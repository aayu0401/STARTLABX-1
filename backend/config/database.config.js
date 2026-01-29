// Database Configuration
const path = require('path');

const config = {
    development: {
        dialect: 'sqlite',
        storage: path.join(__dirname, '..', 'database.sqlite'),
        logging: false
    },
    production: {
        dialect: 'postgres',
        url: process.env.DATABASE_URL,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
        logging: false
    }
};

module.exports = config[process.env.NODE_ENV || 'development'];
