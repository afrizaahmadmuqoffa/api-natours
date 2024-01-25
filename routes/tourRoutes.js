const express = require('express')
const router = express.Router()
const tourControllers = require('../controllers/tourControllers')

// router.param('id', tourControllers.checkId)

router.get('/api/v1/tours', tourControllers.getTours)

router.get('/api/v1/tours/:id', tourControllers.getTourById)

router.post('/api/v1/tours', tourControllers.createTour)

router.patch('/api/v1/tours/:id', tourControllers.updateTour)

router.delete('/api/v1/tours/:id', tourControllers.deleteTour)

module.exports = router