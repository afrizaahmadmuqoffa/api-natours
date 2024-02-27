const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')
const crypto = require('crypto')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const User = sequelize.define('user', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: {
                msg: 'Email format invalid'
            },
            notEmpty: {
                msg: 'Enter your email'
            },
            isLowercase: true
        }
    },
    name_user: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Enter your name'
            }
        },
    },
    photo: {
        type: DataTypes.STRING,
    },
    role: {
        type: DataTypes.STRING,
        validate: {
            isIn: {
                args: [['user', 'guide', 'lead-guide', 'admin']]
            }
        },
        defaultValue: 'user'
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: {
                args: [8, Infinity],
                msg: 'Password must be at least 8 characters long'
            },
            notEmpty: {
                msg: 'Enter your password'
            }
        },
    },
    confirm_password: {
        type: DataTypes.VIRTUAL,
        validate: {
            isMatch: function (val) {
                if (val !== this.password) {
                    throw new Error('Confirm password does not match')
                }
            }
        },
        allowNull: false
    },
    loginAttempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    lastLoginAttempts: {
        type: DataTypes.DATE
    },
    passwordChangedAt: {
        type: DataTypes.DATE
    },
    passwordResetToken: {
        type: DataTypes.STRING
    },
    passwordResetExpires: {
        type: DataTypes.DATE
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
})

User.beforeCreate(async (user) => {
    if (user.password) {
        user.password = await bcrypt.hash(user.password, 12)
        user.passwordChangedAt = Date.now() - 1000;
        user.confirm_password = undefined
    }
})

User.beforeUpdate(async (user) => {
    if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12)
        user.passwordChangedAt = Date.now() - 1000;
    }
})

User.beforeFind((options) => {
    if (!options.where) {
        options.where = {};
    }
    options.where.active = true;
})

User.prototype.createPasswordResetToken = async function () {
    try {
        const resetToken = crypto.randomBytes(32).toString('hex')

        this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')

        console.log({ resetToken }, this.passwordResetToken)

        this.passwordResetExpires = Date.now() + 10 * 60 * 1000

        return resetToken
    } catch (err) {
        next(err)
    }
}


module.exports = User