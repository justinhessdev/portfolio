/* eslint one-var: ["error", "always"]*/
/* eslint-env es6*/

const
  express = require('express'),
  messageRouter = express.Router(),
  Message = require('../models/Message.js');

messageRouter.route('/')
  .get((req, res) => {
    Message.find({}, (err, messages) => {
      res.json(messages);
    });
  })
   .post((req, res) => {
     const newMessage = new Message(req.body);
     newMessage.save((err, message) => {
       if (err) console.log(err)
       res.json(message);
     });
   });

messageRouter.route('/:id')
  .get((req, res) => {
    Message.findById(req.params.id, (err, message) => {
      if (req.xhr) {
        res.json(message);
      } else {
        console.log('I am routing to message');
        res.render('message', { message });
      }
    });
  })
  .delete((req, res) => {
    Message.findByIdAndRemove(req.params.id, (err) => {
      if (err) console.log(err)
      res.json({ message: 'deleted' });
    });
  })
  .patch((req, res) => {
    Message.findByIdAndUpdate(req.params.id, req.body, { new: true }, (err, message) => {
    // respond here
      res.json(message);
    });
  });

module.exports = messageRouter;
