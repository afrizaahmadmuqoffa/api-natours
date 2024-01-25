const Tour = require('../models/TourModel')
const { Sequelize } = require('sequelize')
const { Op } = require('sequelize')

exports.getTours = async (req, res) => {
    try {
        const { fields, sort, order, ...filters } = req.query

        let whereClause = {}
        for (const key in filters) {
            const [field, operator] = key.split('_')

            switch (operator) {
                case 'lt':
                    whereClause[field] = { [Sequelize.Op.lt]: filters[key] }
                    break
                case 'gt':
                    whereClause[field] = { [Sequelize.Op.gt]: filters[key] }
                    break
                case 'gte':
                    whereClause[field] = { [Sequelize.Op.gte]: filters[key] }
                    break
                case 'lte':
                    whereClause[field] = { [Sequelize.Op.lte]: filters[key] }
                    break
                default:
                    whereClause[field] = filters[key]

            }
        }

        let orderClause = []
        if (sort && order) {
            orderClause.push([sort, order])
        }

        let attributes;
        if (fields) {
            attributes = fields.split(',')
        }

        const tours = await Tour.findAll({
            attributes: attributes,
            where: whereClause,
            order: orderClause,
        })

        const total = await Tour.count({ where: whereClause })

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
                message: 'Fail'
            })
        }
    } catch (err) {
        res.status(400).json({
            status: 'Fail',
            message: err.message
        })
    }

}