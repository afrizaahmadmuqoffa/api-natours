const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const Tour = sequelize.define('tour', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    name_dest: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Must have a tour name'
            }
        }
    },
    durations: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Must have a tour durations'
            }
        }
    },
    maxGroupSize: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Must have a max group size'
            }
        }
    },
    difficulty: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Must have a tour difficulty'
            }
        }
    },
    price: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Must have a tour price'
            }
        }
    },
    ratingsAverage: {
        type: DataTypes.DECIMAL(2, 1),
        defaultValue: 4.5
    },
    ratingsQuantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    discount: {
        type: DataTypes.INTEGER
    },
    summary: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Must have a tour summary'
            }
        }
    },
    description: {
        type: DataTypes.STRING
    },
    imageCover: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Must have a tour image'
            }
        }
    },
    images: {
        type: DataTypes.JSON
    },
    startedDate: {
        type: DataTypes.JSON
    }
})

module.exports = Tour