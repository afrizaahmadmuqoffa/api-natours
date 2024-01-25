const Tour = require('../models/TourModel')
const { Sequelize } = require('sequelize')
const { Op } = require('sequelize')
const APIFeatures = require('../utils/APIFeatures')

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5'
    req.query.sort = 'price_ratingsAverage'
    req.query.order = 'asc'
    req.query.fields = 'name_dest,price,ratingsAverage,summary,difficulty'
    next()
}

exports.getTours = async (req, res) => {
    try {
        // const { fields, page, limit, sort, order, ...filters } = req.query

        // let whereClause = {}
        // for (const key in filters) {
        //     const [field, operator] = key.split('_')

        //     switch (operator) {
        //         case 'lt':
        //             whereClause[field] = { [Sequelize.Op.lt]: filters[key] }
        //             break
        //         case 'gt':
        //             whereClause[field] = { [Sequelize.Op.gt]: filters[key] }
        //             break
        //         case 'gte':
        //             whereClause[field] = { [Sequelize.Op.gte]: filters[key] }
        //             break
        //         case 'lte':
        //             whereClause[field] = { [Sequelize.Op.lte]: filters[key] }
        //             break
        //         default:
        //             whereClause[field] = filters[key]

        //     }
        // }

        // let orderClause = [['createdAt', 'ASC']]
        // if (sort && order) {
        //     const sortColumns = sort.split('_')
        //     orderClause = sortColumns.map(col => [col, order])
        // }
        // console.log(orderClause)
        // let attributes;
        // if (fields) {
        //     attributes = fields.split(',')
        // }

        // const offset = (page - 1) * (parseInt(limit) || 10)

        // if (page) {
        //     const numTours = await Tour.count()
        //     if (offset >= numTours) throw new Error('This page does not exist')
        // }

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
            res.status(404).json({
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