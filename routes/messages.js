/* eslint one-var: ["error", "always"]*/
/* eslint-env es6*/

const
  express = require('express'),
  messageRouter = express.Router(),
  Message = require('../models/Message.js');

messageRouter.route('/')
  .get((req, res) => {
    Message.find({}, (err, messages) => {
      if (err) { return console.log(err); }
      return res.json(messages);
    });
  })
   .post((req, res) => {
     const newMessage = new Message(req.body);
     newMessage.save((err, message) => {
       if (err) { return console.log(err); }
       return res.json(message);
     });
   });

messageRouter.route('/:id')
  .get((req, res) => {
    Message.findById(req.params.id, (err, message) => {
      if (req.xhr) {
        res.json(message);
      } else {
        res.render('message', { message });
      }
    });
  })
  .delete((req, res) => {
    Message.findByIdAndRemove(req.params.id, (err) => {
      if (err) { return console.log(err); }
      return res.json({ message: 'deleted' });
    });
  })
  .patch((req, res) => {
    Message.findByIdAndUpdate(req.params.id, req.body, { new: true }, (err, message) => {
      if (err) { return console.log(err); }
      return res.json(message);
    });
  });

module.exports = messageRouter;
