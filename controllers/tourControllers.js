const Tour = require('../models/TourModel')
const { sqlQuery } = require('../utils/query')
const sequelize = require('../config/db')
const { Op } = require('sequelize')
const APIFeatures = require('../utils/APIFeatures')
const OperationalError = require('../utils/operationalError')

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5'
    req.query.sort = 'price_ratingsAverage'
    req.query.order = 'asc'
    req.query.fields = 'name_dest,price,ratingsAverage,summary,difficulty'
    console.log(req.query)
    next()
}

exports.getTours = async (req, res, next) => {
    try {
        console.log(req.query)
        const query = new APIFeatures(req.query)

        const where = query.filtering()
        const order = query.sorting()
        const attributes = query.limitFields()
        const offset = query.pagination()
        const limit = query.limit

        const tours = await Tour.findAll({
            attributes,
            where,
            limit,
            offset,
            order
        })

        const total = tours.length

        res.status(200).json({
            status: 'success',
            result: total,
            data: {
                tours
            }
        })
    } catch (err) {
        next(err)
    }
}

exports.getTourById = async (req, res, next) => {
    try {
        const tour = await Tour.findByPk(req.params.id)

        if (!tour) {
            throw new OperationalError(404, `Id not found!`)
        }

        res.status(200).json({
            status: 'success',
            data: {
                tour
            }
        })
    } catch (err) {
        next(err)
    }

}

exports.createTour = async (req, res, next) => {
    try {
        const newTour = await Tour.create(req.body)

        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        })
    } catch (err) {
        next(err)
    }
}

exports.updateTour = async (req, res, next) => {
    try {
        const tourId = await Tour.findByPk(req.params.id)

        if (!tourId) {
            throw new OperationalError(404, `Id not found!`)
        }

        const tour = await tourId.update(req.body)

        res.status(200).json({
            status: 'success',
            data: {
                tour
            }
        })

    } catch (err) {
        next(err)
    }
}

exports.deleteTour = async (req, res, next) => {
    try {
        const tourId = await Tour.findByPk(req.params.id)

        if (!tourId) {
            throw new OperationalError(404, `Id not found!`)
        }
        const tour = await tourId.destroy()

        res.status(204).json({
            status: 'success',
            data: {
                tour
            }
        })

    } catch (err) {
        next(err)
    }

}

exports.getTourStats = async (req, res, next) => {
    try {
        const stats = await Tour.findAll({
            attributes: ['difficulty',
                [sequelize.fn('COUNT', sequelize.literal('*')), 'numTours'],
                [sequelize.fn('SUM', sequelize.col('ratingsQuantity')), 'numRatings'],
                [sequelize.fn('AVG', sequelize.col('ratingsAverage')), 'avgRating'],
                [sequelize.fn('AVG', sequelize.col('price')), 'avgPrice'],
                [sequelize.fn('MIN', sequelize.col('price')), 'minPrice'],
                [sequelize.fn('MAX', sequelize.col('price')), 'maxPrice'],
            ],
            where: {
                ratingsAverage: { [Op.gte]: 2.0 },
            },
            group: ['difficulty'],
            order: [[sequelize.fn('AVG', sequelize.col('price')), 'ASC']],
            raw: true,
        });

        res.status(200).json({
            status: 'success',
            data: {
                stats
            }
        })

    } catch (err) {
        next(err)
    }
}

exports.getMonthlyPlan = async (req, res, next) => {
    try {
        const { year } = req.params
        const parsedYear = parseInt(year)

        const plan = await sequelize.query(sqlQuery(parsedYear), { type: sequelize.QueryTypes.SELECT })


        res.status(200).json({
            status: 'success',
            data: {
                plan
            }
        })
    } catch (err) {
        next(err)
    }
} 
