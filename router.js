const express = require('express')
const router = express.Router()
const mongoHandler = require('./mongoHandler')

router.post('/user', (req, res) => {
  mongoHandler.insertUser(req.body.username, req.body.password, res).then()
})

module.exports = router