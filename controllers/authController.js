const crypto = require('crypto')
const { promisify } = require('util')
const User = require('../models/UserModel')
const { Op } = require('sequelize')
const bcrypt = require('bcryptjs')
const sendEmail = require('../utils/email')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
const OperationalError = require('../utils/operationalError')
dotenv.config()

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES
    })
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user.id)
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
        httpOnly: true
    }
    if (process.env.NODE_ENV === 'production') {
        cookieOptions.secure = true
    }

    res.cookie('jwt', token, cookieOptions)
    user.password = undefined
    res.status(statusCode).json({
        status: "success",
        token,
        data: {
            user
        }
    })
}


exports.signup = async (req, res, next) => {
    try {
        const newUser = await User.create({
            name_user: req.body.name_user,
            email: req.body.email,
            password: req.body.password,
            confirm_password: req.body.confirm_password,
        })

        const token = signToken(newUser)
        const verifyEmailLink = `${req.protocol}://${req.get('host')}/api/v1/users/verify-your-email?token=${token}`
        const message = `Click this link to verify your email : ${verifyEmailLink}`

        try {
            await sendEmail({
                email: req.body.email,
                subject: 'Email Verification',
                text: message
            })

            res.status(200).json({
                status: 'success',
                message: 'Check your email for verification'
            })
        } catch (err) {
            throw new OperationalError(500, 'Error sending email!')
        }

    } catch (err) {
        next(err)
    }
}

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body
        const now = new Date()
        const maxLoginAttempts = 5;
        const lockTime = 30 * 60 * 1000; // 30 minute

        if (!email || !password) {
            throw new OperationalError(400, 'Please provide email and password')
        }

        const user = await User.findOne({
            where: { email },
        })

        if (!user) {
            throw new OperationalError(401, "User not found.")
        }

        if (user.verified === false) {
            throw new OperationalError(401, 'Email is not verified yet.')
        }

        if (user.loginAttempts >= maxLoginAttempts && now - user.lastLoginAttempts < lockTime) {
            const remainingTime = Math.ceil((lockTime - (now - user.lastLoginAttempts)) / 1000 / 60);
            throw new OperationalError(429, `Try again later in ${remainingTime} minute.`)
        }

        const validatePassword = await bcrypt.compare(password, user.password)

        if (!validatePassword) {
            user.loginAttempts += 1;
            user.lastLoginAttempts = now;
            await user.save();

            if (user.loginAttempts >= maxLoginAttempts) {
                throw new OperationalError(401, `Login failed. Try again later in 30 min`)
            }

            const remainingAttempts = maxLoginAttempts - user.loginAttempts;
            throw new OperationalError(401, `Invalid email or password. You have ${remainingAttempts} remaining login attempts`)
        }

        user.loginAttempts = 0;
        user.lastLoginAttempts = null;
        await user.save();

        createSendToken(user, 200, res)

    } catch (err) {
        next(err)
    }
}

exports.verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.query

        if (!token) {
            throw new OperationalError(400, 'Token not provided');
        }

        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
        console.log(decoded)
        const user = await User.findByPk(decoded.id.id);
        if (!user) {
            throw new OperationalError(404, 'User not found');
        }

        user.verified = true;
        await user.save();

        res.status(200).json({
            status: 'success',
            message: 'Email verified successfully',
        });
    } catch (err) {
        next(err)
    }
}

exports.protect = async (req, res, next) => {
    try {
        let token

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1]
        }

        if (!token) {
            throw new OperationalError(401, "Please logged in")
        }

        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
        console.log(decoded)

        const currentUser = await User.findByPk(decoded.id)
        if (!currentUser) {
            throw new OperationalError(400, 'Token no longer exist')
        }

        if (currentUser.verified === false) {
            throw new OperationalError(401, 'Email is not verified')
        }

        if (decoded.iat < new Date(currentUser.passwordChangedAt).getTime() / 1000) {
            throw new OperationalError(401, "User has changed password. Please log in again.");
        }

        req.user = currentUser

        next()
    } catch (err) {
        next(err)
    }
}

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw new OperationalError(403, 'You do not have permission to perform this action')
        }

        next()
    }
}

exports.forgotPassword = async (req, res, next) => {
    try {
        console.log(req.body.email)
        const user = await User.findOne({ where: { email: req.body.email } })
        if (!user) {
            throw new OperationalError(404, 'User not found')
        }

        const resetToken = await user.createPasswordResetToken()
        await user.save()
        const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`

        const message = `Forgot your password? submit to ${resetURL}`
        console.log(message)

        try {
            await sendEmail({
                email: user.email,
                subject: 'Your password reset token (10 min)',
                text: message
            })

            res.status(200).json({
                status: 'success',
                message: 'Token sent to email'
            })
        } catch (err) {
            user.passwordResetToken = undefined
            user.passwordResetExpires = undefined
            await user.save({ validate: false })

            throw new OperationalError(500, 'Error sending email!')
        }

    } catch (err) {
        next(err)
    }

}

exports.resetPassword = async (req, res, next) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
        const user = await User.findOne({
            where: {
                passwordResetToken: hashedToken,
                passwordResetExpires: { [Op.gt]: Date.now() }
            }
        })
        if (!user) {
            throw new OperationalError(400, 'Token is invalid or expired')
        }
        console.log(user.id)

        user.password = req.body.password
        user.confirm_password = req.body.confirm_password
        user.passwordResetToken = null
        user.passwordResetExpires = null
        await user.save()

        createSendToken(user, 200, res)

    } catch (err) {
        next(err)
    }
}

exports.updatePassword = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.dataValues.id)

        const validatePassword = await bcrypt.compare(req.body.current_password, user.password)

        if (!validatePassword) {
            throw new OperationalError(401, 'Your current password is wrong')
        }

        user.password = req.body.password
        user.confirm_password = req.body.confirm_password
        await user.save()

        createSendToken(user, 200, res)
    } catch (err) {
        next(err)
    }
}