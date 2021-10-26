const express = require('express')
var bodyParser = require('body-parser')
const app = express()
const port = 3001


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send('Hello World!')
})


app.post('/store', (req, res) => {
  console.log('Got body:', req.body);
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})