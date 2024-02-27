const { where } = require('sequelize')
const User = require('../models/UserModel')

const OperationalError = require('../utils/operationalError')

exports.updateUser = async (req, res, next) => {
    try {
        if (req.body.password || req.body.confirm_password) {
            throw new OperationalError(400, 'Use /updatePassword if you want update your password!')
        }

        const user = await User.findByPk(req.user.dataValues.id)

        const updatedUser = await user.update({
            email: req.body.email,
            name_user: req.body.name_user
        })

        res.status(200).json({
            status: 'success',
            data: {
                user: updatedUser
            }
        });

    } catch (err) {
        next(err)
    }
}

exports.deleteUser = async (req, res, next) => {
    try {
        const userDeleted = await User.findByPk(req.user.dataValues.id)

        await userDeleted.update({
            active: false
        })

        res.status(204).json({
            status: "success",
            data: null
        })
    } catch (err) {
        next(err)
    }
}

exports.getUsers = async (req, res, next) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password', 'active', 'passwordResetToken', 'passwordResetExpires'] }
        })
        const total = users.length

        res.status(200).json({
            status: 'success',
            total,
            users
        })
    } catch (err) {
        next(err)
    }
}

exports.getUserById = (req, res) => {
    res.status(500).json({
        status: 'failed',
        message: 'user routes not defined yet'
    })
}