class OperationalError extends Error {
    constructor(statusCode, message) {
        super(message)
        this.name = 'OperationalError'
        this.statusCode = statusCode
        Error.captureStackTrace(this, this.constructor)
    }
}

module.exports = OperationalError
