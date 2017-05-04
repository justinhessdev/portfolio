const
    express = require('express'),
    app = express(),
    logger = require('morgan'),
    bodyParser = require('body-parser')

// environment port
const port = process.env.PORT || 3000

app.use(express.static(process.env.PWD + '/public'))

app.use(logger('dev'))
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.sendFile("./index.html", {root: __dirname})
})

app.listen(port, (err) => {
  console.log(err || 'listening on port ' + port)
})
