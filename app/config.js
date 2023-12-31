const path = require('path')
const dotenv = require('dotenv')
dotenv.config()

module.exports = {
    rootPath: path.resolve(__dirname, '..'),
    secretKey: process.env.SECRET_KEY,
    dbHost: process.env.DB_HOST,
    dbPort: process.env.DB_PORT,
    dbUser: process.env.DB_USER,
    dbPass: process.env.DB_PASS,
    dbName: process.env.DB_NAME,
    dbAuthSource: process.env.DB_AUTHSOURCE,
}