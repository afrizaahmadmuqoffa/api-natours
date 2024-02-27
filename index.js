const express = require('express')
const app = express()
const dotenv = require('dotenv')
const mysql = require('mysql2')
const sequelize = require('./config/db')
const path = require('path')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
dotenv.config()
const port = process.env.PORT
const userRoutes = require('./routes/userRoutes')
const tourRoutes = require('./routes/tourRoutes')
const OperationalError = require('./utils/operationalError')
const { handleError } = require('./utils/errorHandle')

app.use(helmet())
const limiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 100,
    message: "Too many request from this IP, Try again later in an hour"
})
app.use('/api', limiter)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static('public'))

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use((req, res, next) => {
    console.log(req.headers)
    next()
})
sequelize.sync({ force: false }).then(() => {
    console.log('Database and tables synced')
})
    .catch(e => {
        console.error(`Error syncing database : ${e}`)
    })

app.use('/', tourRoutes)
app.use('/', userRoutes)

app.all('*', (req, res, next) => {
    const err = new OperationalError(404, `URL ${req.originalUrl} not found`)
    next(err)
})

app.use((err, req, res, next) => {
    handleError(res, err)
})

process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION! Shutting down...')
    console.log(err.name, err.message)
    process.exit(1)
})

const server = app.listen(port, () => {
    console.log(`Run in http://localhost:${port}/`)
})

process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION! Shutting down...')
    console.log(err.name, err.message)
    server.close(() => {
        process.exit(1)
    })
})