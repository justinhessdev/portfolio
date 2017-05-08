// Message.js
const
    mongoose = require('mongoose'),
    messageSchema = new mongoose.Schema({
      contact: {type: String}, // email or cell number
      message: {type: String} // message
    }, {timestamps: true})


const Message = mongoose.model('Message', messageSchema)

module.exports = Message
