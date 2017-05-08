// Token.js
const
    mongoose = require('mongoose'),
    tokenSchema = new mongoose.Schema({
      token: {type: String} // random token aaaaaa.bbbbbb.ccccccc generated
    }, {timestamps: true})

const Token = mongoose.model('Token', tokenSchema)

module.exports = Token
