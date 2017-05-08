const
  express = require('express'),
  messageRouter = express.Router(),
  Message = require('../models/Message.js')

messageRouter.route('/')
  .get((req, res) => {
      Message.find({}, (err, messages) => {
        res.json(messages)
      })
    })
   .post((req, res) => {
       var newMessage = new Message(req.body)
       console.log("server - the new message we received from client is")
       console.log(newMessage)
       newMessage.save((err, message) => {
         if(err) console.log(err)
         res.json(message)
       })
    })

    // app.post('/contact', (req, res) => {
    //   console.log("The request body is: ");
    //   // console.log(req.body);
    //
    //   console.log("*******************");
    //   console.log("*******************");
    //   console.log("*******************");
    //
    //   console.log(res);
    //
    //   // if(req.status === '401'){
    //   //     res.json({failure: 'error'});
    //   // }else{
    //   //     console.log('Message sent: ' + info.response);
    //       res.json({
    //         "success": 'Your message was sent',
    //         "next steps": "I will respond to your email shortly",
    //         "body": req.body
    //       });
    //   // };
    //
    // //   var transporter = nodemailer.createTransport({
    // //       service: 'Gmail',
    // //       auth: {
    // //           user: 'winitdevproject@gmail.com', // Your email id
    // //           pass: 'winit12345' // Your password
    // //       }
    // //   });
    // //
    // //   var mailOptions = {
    // //       from: req.body.email,
    // //       to: 'justinhessdev@gmail.com',
    // //       subject:'Winit Project -- Reaching out',
    // //       text: 'Email: ' + req.body.email + '\nPhone: ' + req.body.phone + '\nMessage: ' + req.body.message
    // //   };
    // //
    // //   transporter.sendMail(mailOptions, function(error, info){
    // //       if(error){
    // //           console.log(error);
    // //           res.json({failure: 'error'});
    // //       }else{
    // //           console.log('Message sent: ' + info.response);
    // //           res.json({
    // //             "success": 'Your message was sent',
    // //             "next steps": "I will respond to your email shortly"
    // //           });
    // //       };
    // //   });
    // });

messageRouter.route('/:id')
  .get((req, res) => {
      Message.findById(req.params.id, (err, message) => {
        res.json(message)
      })
    })
  .delete((req, res) => {
      Message.findByIdAndRemove(req.params.id , (err) =>{
        if (err) console.log(err)
        res.json({message: "deleted"})
      })
  })
  .patch((req, res) => {
      Message.findByIdAndUpdate(req.params.id, req.body, {new: true}, (err, message) => {
      // respond here
      res.json(message)
    })
  })

module.exports = messageRouter
