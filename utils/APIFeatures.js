const { Sequelize } = require('sequelize')
const { Op } = require('sequelize')

class APIFeatures {
    constructor(queryParams) {
        this.fields = queryParams.fields
        this.page = queryParams.page || 1
        this.limit = parseInt(queryParams.limit) || 10
        this.sort = queryParams.sort
        this.order = queryParams.order || 'ASC'
        this.filters = { ...queryParams }
        delete this.filters.fields
        delete this.filters.page
        delete this.filters.limit
        delete this.filters.sort
        delete this.filters.order
    }

    filtering() {
        let where = {}
        for (const key in this.filters) {
            const [field, operator] = key.split('_')
            switch (operator) {
                case 'lt':
                    where[field] = { [Op.lt]: this.filters[key] }
                    break
                case 'gt':
                    where[field] = { [Op.gt]: this.filters[key] }
                    break
                case 'gte':
                    where[field] = { [Op.gte]: this.filters[key] }
                    break
                case 'lte':
                    where[field] = { [Op.lte]: this.filters[key] }
                    break
                default:
                    where[field] = this.filters[key]
            }
        }
        return where
    }

    sorting() {
        let order = [['createdAt', 'ASC']]
        if (this.sort && this.order) {
            const sortColumns = this.sort.split('_')
            order = sortColumns.map(col => [col, this.order])
        }
        return order
    }

    limitFields() {
        return this.fields ? this.fields.split(',') : undefined
    }

    pagination() {
        return (this.page - 1) * this.limit
    }
}

module.exports = APIFeatures