const Tour = require('../models/TourModel')
const { Sequelize } = require('sequelize')
const sequelize = require('../config/db')
const { Op } = require('sequelize')
const APIFeatures = require('../utils/APIFeatures')

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5'
    req.query.sort = 'price_ratingsAverage'
    req.query.order = 'asc'
    req.query.fields = 'name_dest,price,ratingsAverage,summary,difficulty'
    console.log(req.query)
    next()
}

exports.getTours = async (req, res) => {
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
        console.log(tours)

        const total = tours.length

        res.status(200).json({
            status: 'success',
            result: total,
            data: {
                tours
            }
        })
    } catch (err) {
        res.status(404).json({
            status: 'Not Found!',
            message: err.message
        })
    }
}

exports.getTourById = async (req, res) => {
    try {
        const tour = await Tour.findByPk(req.params.id)

        res.status(200).json({
            status: 'success',
            data: {
                tour
            }
        })
    } catch (err) {
        res.status(404).json({
            status: 'Not Found!',
            message: err.message
        })

    }

}

exports.createTour = async (req, res) => {
    try {
        const newTour = await Tour.create(req.body)

        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        })
    } catch (err) {
        res.status(400).json({
            status: 'Fail',
            message: err.message
        })
    }
}

exports.updateTour = async (req, res) => {
    try {
        const tour = await Tour.findByPk(req.params.id)
        if (tour) {
            await tour.update(req.body)

            res.status(200).json({
                status: 'success',
                data: {
                    tour
                }
            })
        } else {
            return res.status(404).json({
                message: 'Not Found!'
            })
        }
    } catch (err) {
        res.status(400).json({
            status: 'Fail',
            message: err.message
        })
    }
}

exports.deleteTour = async (req, res) => {
    try {
        const tour = await Tour.findByPk(req.params.id)

        if (tour) {
            await tour.destroy()

            res.status(204).json({
                status: 'success',
                data: {
                    tour
                }
            })
        } else {
            res.status(404).json({
                status: 'Not Found!',
                message: err.message
            })
        }
    } catch (err) {
        res.status(400).json({
            status: 'Fail',
            message: err.message
        })
    }

}

exports.getTourStats = async (req, res) => {
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
        res.status(400).json({
            status: 'Fail',
            message: err.message
        })
    }
}