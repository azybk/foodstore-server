const mongoose = require('mongoose')
const { dbHost, dbPort, dbUser, dbPass, dbName, dbAuthSource } = require('../app/config')

mongoose.connect(`mongodb://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}?authSource=${dbAuthSource}`,
    { useNewUrlParser: true, useUnifiedTopology: true } 
)

const db = mongoose.connection

module.exports = db