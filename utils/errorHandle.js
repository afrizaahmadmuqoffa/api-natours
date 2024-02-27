const OperationalError = require('./operationalError')

exports.handleError = (res, err) => {
    if (process.env.NODE_ENV === 'development') {
        res.status(500).json({
            status: 'Fail',
            error: err,
            message: err.message
        })
    } else {
        if (isSequelizeError(err)) {
            const operationalErr = new OperationalError(400, err.message)
            res.status(400).json({
                status: 'Fail',
                message: operationalErr.message
            })
        } else if (err instanceof OperationalError) {
            res.status(err.statusCode).json({
                status: 'Fail',
                message: err.message
            })
        } else if (err.name === 'JsonWebTokenError') {
            res.status(401).json({
                status: 'Fail',
                message: 'Invalid token!, Please log in again'
            })
        } else if (err.name === 'TokenExpiredError') {
            res.status(401).json({
                status: 'Fail',
                message: 'Expired token!, Please log in again'
            })
        } else {
            res.status(500).json({
                status: 'Error',
                message: 'Something wrong! Try again.'
            })
            console.error(err)
        }
    }
}

function isSequelizeError(err) {
    return err.name && err.name.startsWith('Sequelize')
}
