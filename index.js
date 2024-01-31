const express = require('express')
const app = express()
const dotenv = require('dotenv')
const mysql = require('mysql2')
const sequelize = require('./config/db')
const path = require('path')
dotenv.config()
const port = process.env.PORT
const userRoutes = require('./routes/userRoutes')
const tourRoutes = require('./routes/tourRoutes')
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static('public'))

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

//sequelize sync
sequelize.sync({ force: false }).then(() => {
    console.log('Database and tables synced');
})
    .catch(e => {
        console.error('Error syncing database: ', e)
    })


app.use('/', tourRoutes)
app.use('/', userRoutes)

app.listen(port, () => {
    console.log(`Run in http://localhost:${port}/`)
})