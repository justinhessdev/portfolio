/* eslint one-var: ["error", "always"]*/
/* eslint-env es6*/

const
  dotenv = require('dotenv').load({ silent: true }),
  express = require('express'),
  app = express(),
  mongoose = require('mongoose'),
  logger = require('morgan'),
  path = require('path'),
  bodyParser = require('body-parser'),
  nodemailer = require('nodemailer'),
  ejs = require('ejs'),
  ejsLayouts = require('express-ejs-layouts'),
  methodOverride = require('method-override'),
  jwt = require('jsonwebtoken'),
  Bitly = require('bitly'),
  bitly = new Bitly(process.env.BITLY),
  request = require('superagent'),
  mailchimpInstance = process.env.MAILCHIMP_INSTANCE,
  mailchimpListUniqueId = process.env.MAILCHIMP_UNIQUE_ID,
  mailchimpApiKey = process.env.MAILCHIMP_APIKEY,
  mandrill = require('mandrill-api/mandrill'),
  mandrill_client = new mandrill.Mandrill(process.env.MANDRILL_CLIENT),
  port = (process.env.PORT || 3000),
  mongoConnectionString = (process.env.MONGODB_URL || 'mongodb://localhost/winit-app'),
  messageRoutes = require('./routes/messages.js'),
  Message = require('./models/Message.js');

// mongoose connection
mongoose.connect(mongoConnectionString, (err) => {
  console.log(err || 'Connected to MongoDB (winit-app)');
});

app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.use(ejsLayouts);
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.static(path.join(process.env.HEROKU_URL, '/public')));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/messages', messageRoutes);

// send res (response) back to client when client makes get request at root.
// response contains sendFile of our client index.html so client/chrome will know to populate page
app.get('/', (req, res) => {
  res.render('index');
});



app.post('/contact', (req, res) => {
  /*
  MAILCHIMP LOGIC ...
  */
  // request
  //   .post('https://' + mailchimpInstance + '.api.mailchimp.com/3.0/lists/' + mailchimpListUniqueId + '/members/')
  //   .set('Content-Type', 'application/json;charset=utf-8')
  //   .set('Authorization', 'Basic ' + new Buffer('any:' + mailchimpApiKey).toString('base64'))
  //   .send({
  //     'email_address': req.body.contact,
  //     'message': req.body.message,
  //     'status': 'subscribed',
  //   })
  //     .end((err, response) => {
  //       if (err) console.log(err);
  //       console.log('The response is: ');
  //       console.log(response.text);
  //     });

/*
  MANDRILL LOGIC -- NOT WORKING BC OF DKIM and SPF SETTINGS

  text -- eventually would contain link...
*/
  // mandrill_client.messages.send({
  //   "message": {
  //       "from_email": "winitdevproject@gmail.com",
  //       "from_name": "Mr Winit",
  //       "to":[{"email": req.body.contact, "name": "someone's_name"}], // Array of recipients
  //       "subject": "Winit Email",
  //       "text": req.body.message, // Alternatively, use the "html" key
  //                                to send HTML emails rather than plaintext
  //   },
  // }, (response) => {
  //   console.log(response);
  // });
/*
  Workaround: Generate a new page with bitly link.
  When clikced get forwarded to API call and displays the info
*/
  const newMessage = new Message(req.body);
  newMessage.save((err, message) => {
    if (err) console.log(err);
    // sign synchronously
    const
      genToken = jwt.sign({ messageId: message._id }, 'shhhhh'),
      genURL = `${process.env.HEROKU_URL}/token/${genToken}`;
    bitly.shorten(genURL)
    .then((response) => {
      const shortUrl = response.data.url;
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'winitdevproject@gmail.com',
          pass: 'winit12345',
        },
      });

      const text = `Congrats! You received the special email.
      \nTo view the hidden message click this link: ${shortUrl}`
      console.log('created');
      transporter.sendMail({
        from: 'winitdevproject@gmail.com',
        to: req.body.contact,
        subject: 'Winit Email',
        html: text,
      }, (error, info) => {
        if (error) {
          console.log(error);
          res.json({ failure: 'error' });
        } else {
          console.log('Message sent: ' + info.response);
          res.json({
            success: 'Your message was sent',
            'next steps': 'I will respond to your email shortly',
          });
        }
      });


    });
  });
});

/*
  API FOR THE TOKEN GENERATION --- TO VIEW THE MESSAGE WITH THE CONTENT
*/
app.get('/token/:id', (req, res) => {
    // verify a token symmetric - synchronous
  const decoded = jwt.verify(req.params.id, 'shhhhh');
  Message.findById(decoded.messageId, (err, message) => {
    if (err) res.json({ error: '401' });
    console.log("In the api -- redirecting to messages/id");
    res.redirect(`/messages/${message._id}`);
  });
});

app.listen(port, (err) => {
  console.log(err || 'listening on port ' + port);
});
