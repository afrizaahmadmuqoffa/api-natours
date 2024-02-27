const express = require('express')
const router = express.Router()
const tourControllers = require('../controllers/tourControllers')
const authController = require('../controllers/authController')


router.get('/api/v1/top-5-cheap-tours', tourControllers.aliasTopTours, tourControllers.getTours)

router.get('/api/v1/tour-stats', tourControllers.getTourStats)

router.get('/api/v1/monthly-plan/:year', tourControllers.getMonthlyPlan)

router.get('/api/v1/tours', authController.protect, tourControllers.getTours)

router.get('/api/v1/tours/:id', tourControllers.getTourById)

router.post('/api/v1/tours', tourControllers.createTour)

router.patch('/api/v1/tours/:id', tourControllers.updateTour)

router.delete('/api/v1/tours/:id', authController.protect, authController.restrictTo('admin', 'lead-guide'), tourControllers.deleteTour)



module.exports = router