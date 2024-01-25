const mysql = require('mysql2')
const { Sequelize } = require('sequelize')
const dotenv = require('dotenv')

dotenv.config()

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    port: 3306
})

sequelize.authenticate()
    .then(() => {
        console.log("Success remote database")
    })
    .catch((e) => {
        console.error(e.message)
    })

module.exports = sequelize