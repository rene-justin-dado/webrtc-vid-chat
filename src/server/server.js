const express = require('express')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 5000

app.use(express.static(__dirname + './../public'))
app.use(cors())

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`))
