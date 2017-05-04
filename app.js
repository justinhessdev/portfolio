const
    express = require('express'),
    app = express(),
    logger = require('morgan'),
    bodyParser = require('body-parser')

// environment port
const port = process.env.PORT || 3000

app.use(express.static(process.env.PWD + '/client'))
app.use(logger('dev'))
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

// app.get('/', (req, res) => {
//   res.render('index')
// })

app.listen(port, (err) => {
  console.log(err || 'listening on port ' + port)
})
