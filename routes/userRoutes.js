const express = require('express')
const router = express.Router()
const userControllers = require('../controllers/userControllers')

router.get('/api/v1/users', userControllers.getUsers)
router.get('/api/v1/users/:id', userControllers.getUserById)

module.exports = router