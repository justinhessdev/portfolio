const
    express = require('express'),
    app = express(),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    nodemailer = require('nodemailer')

// environment port
const port = process.env.PORT || 3000

app.use(express.static(process.env.PWD + '/public'))

app.use(logger('dev'))
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.sendFile("./index.html", {root: __dirname})
})

app.post('/contact', (req, res) => {
  console.log("The request body is: ");
  console.log(req.body);

  // if(req.body.company) {
  //   res.render('contact', {
  //     title: 'Contact',
  //     err: true,
  //     page: 'contact',
  //     type: 'empty',
  //     body: req.body.message,
  //     name: req.body.name,
  //     email: req.body.email,
  //     msg: 'Spam detected',
  //     description: 'spam'});
  //   return;
  // }

  // if(! req.body.name || ! req.body.email || ! req.body.message) {
  //   res.render('contact', {
  //     title: 'Contact',
  //     err: true,
  //     page: 'contact',
  //     type: 'empty',
  //     body: req.body.message,
  //     name: req.body.name,
  //     email: req.body.email,
  //     msg: 'fill in info',
  //     description: 'infooo'});
  //   return;
  // }

  var transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
          user: 'winitdevproject@gmail.com', // Your email id
          pass: 'winit12345' // Your password
      }
  });

  var mailOptions = {
      from: req.body.email,
      to: 'justinhessdev@gmail.com',
      subject:'Winit Project -- Reaching out',
      text: 'Email: ' + req.body.email + '\nPhone: ' + req.body.phone + '\nMessage: ' + req.body.message
  };

  transporter.sendMail(mailOptions, function(error, info){
      if(error){
          console.log(error);
          res.json({failure: 'error'});
      }else{
          console.log('Message sent: ' + info.response);
          res.json({
            "success": 'Your message was sent',
            "next steps": "I will respond to your email shortly"
          });
      };
  });
});

app.listen(port, (err) => {
  console.log(err || 'listening on port ' + port)
});
