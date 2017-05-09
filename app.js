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
  // nodemailer = require('nodemailer'),
  ejs = require('ejs'),
  ejsLayouts = require('express-ejs-layouts'),
  methodOverride = require('method-override'),
  jwt = require('jsonwebtoken'),
  Bitly = require('bitly'),
  bitly = new Bitly('b4ec80a1062537de1006970c9b65eb1217cb624d'),
  request = require('superagent'),
  mailchimpInstance = process.env.MAILCHIMP_INSTANCE,
  mailchimpListUniqueId = process.env.MAILCHIMP_UNIQUE_ID,
  mailchimpApiKey = process.env.MAILCHIMP_APIKEY,
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

app.get('/messages/:id', (req, res) => {
  Message.findById(req.params.id, (err, message) => {
    if (req.xhr) {
      res.json(message);
    } else {
      console.log('I am now in app js -- routing to messageß');
      res.render('message', { message });
    }
  });
});

app.post('/contact', (req, res) => {
  request
    .post('https://' + mailchimpInstance + '.api.mailchimp.com/3.0/lists/' + mailchimpListUniqueId + '/members/')
    .set('Content-Type', 'application/json;charset=utf-8')
    .set('Authorization', 'Basic ' + new Buffer('any:' + mailchimpApiKey).toString('base64'))
    .send({
      'email_address': req.body.contact,
      'message': req.body.message,
      'status': 'subscribed',
    })
      .end((err, response) => {
        if (err) console.log(err);
        console.log('The response is: ');
        console.log(response.text);
      });

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
      res.render('token', { shortUrl });
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
