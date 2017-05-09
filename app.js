const
    dotenv = require('dotenv').load({silent: true}),
    express = require('express'),
    app = express(),
    mongoose = require('mongoose'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    nodemailer = require('nodemailer'),
    ejs = require('ejs'),
    ejsLayouts = require('express-ejs-layouts'),
    methodOverride = require('method-override'),
    jwt = require('jsonwebtoken'),
    Bitly = require('bitly'),
    bitly = new Bitly('b4ec80a1062537de1006970c9b65eb1217cb624d');
    port = (process.env.PORT || 3000),
    mongoConnectionString = (process.env.MONGODB_URL || 'mongodb://localhost/winit-app'),
    messageRoutes = require('./routes/messages.js'),
    Message = require('./models/Message.js'),
    Token = require('./models/Token.js')

console.log("The mongodb url is: ");
console.log(process.env.MONGODB_URL);

// mongoose connection
mongoose.connect(mongoConnectionString, (err) => {
  console.log(err || "Connected to MongoDB (winit-app)")
})

app.use(methodOverride('_method'))
app.set('view engine', 'ejs')
app.use(ejsLayouts)
app.use(express.static(__dirname + '/public'))
app.use(logger('dev'))
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

app.use('/messages', messageRoutes)

// send res (response) back to client when client makes get request at root.
// response contains sendFile of our client index.html so client/chrome will know to populate page
app.get('/', (req, res) => {
  res.render('index')
})

app.post('/contact' , (req, res) => {
  var newMessage = new Message(req.body)
  newMessage.save((err, message) => {
    if(err) console.log(err)
    // sign synchronously
    var genToken = jwt.sign({ messageId: message._id }, 'shhhhh');
    var genURL = "https://winit-app.herokuapp.com/token/"+genToken;
    bitly.shorten(genURL)
    .then(function(response) {
      var short_url = response.data.url
      res.render('token', {short_url})
    }, function(error) {
      throw error;
    });
  })
})

app.get('/bit.ly/:id' , (req, res) => {
    // verify a token symmetric - synchronous
    var decoded = jwt.verify(req.params.id, 'shhhhh');
    Message.findById(decoded.messageId, (err, message) => {
      if (err) res.json({error: "401"})
      res.render('message', {message})
    })
  }, function(error) {
    throw error;
  });
})



app.listen(port, (err) => {
  console.log(err || 'listening on port ' + port)
});
