const { Sequelize, DataTypes } = require('sequelize')
const sequelize = require('../config/db')
const slugify = require('slugify')

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
            len: {
                args: [5, 40],
                msg: 'A tour name must have length beetwen 5 and 40 character'
            },
            notEmpty: {
                msg: 'Must have a tour name'
            }
        },
    },
    slug: {
        type: DataTypes.STRING
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
    durationWeeks: {
        type: DataTypes.VIRTUAL,
        get() {
            return this.durations / 7
        },
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
            isIn: {
                args: [['easy', 'medium', 'hard']],
                msg: 'Difficulty is either: easy, medium, hard'
            },
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
            },
        }
    },
    ratingsAverage: {
        type: DataTypes.DECIMAL(2, 1),
        defaultValue: 4.5,
        validate: {
            min: {
                args: [0.0],
                msg: 'Rating tour must greater than equal 0.0'
            },
            max: {
                args: [5.0],
                msg: 'Rating tour must less than equal 5.0'
            }
        }
    },
    ratingsQuantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    discount: {
        type: DataTypes.INTEGER,
        validate: {
            function(val) {
                if (val > this.price) {
                    throw new Error('Discount must less than price')
                }
            }
        }
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
    startedDate_1: {
        type: DataTypes.DATE,
        allowNull: false
    },
    startedDate_2: {
        type: DataTypes.DATE,
        allowNull: false
    },
    startedDate_3: {
        type: DataTypes.DATE,
        allowNull: false
    },
    startedTime: {
        type: DataTypes.TIME,
        allowNull: false
    },
    secretTour: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    timezone: '+07:00',
})

Tour.beforeCreate((tour, options) => {
    tour.slug = slugify(tour.name_dest, { lower: true })
})

Tour.beforeFind((options) => {
    options.where = {
        ...options.where,
        secretTour: {
            [Sequelize.Op.ne]: true,
        },
    };
});


module.exports = Tour