const express = require('express')
const router = express.Router()
const userControllers = require('../controllers/userControllers')
const authController = require('../controllers/authController')

router.post('/api/v1/users/signup/', authController.signup)

router.get('/api/v1/users/verify-your-email', authController.verifyEmail)

router.post('/api/v1/users/login/', authController.login)

router.post('/api/v1/users/forgotPassword/', authController.forgotPassword)

router.patch('/api/v1/users/updatePassword/', authController.protect, authController.updatePassword)

router.patch('/api/v1/users/resetPassword/:token', authController.resetPassword)

router.patch('/api/v1/users/updateUser', authController.protect, userControllers.updateUser)

router.delete('/api/v1/users/deleteUser', authController.protect, userControllers.deleteUser)

router.get('/api/v1/users', userControllers.getUsers)

router.get('/api/v1/users/:id', userControllers.getUserById)

module.exports = router