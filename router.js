const express = require('express')
const router = express.Router()
const mongoHandler = require('./mongoHandler')

router.post('/user', (req, res) => {
  mongoHandler.insertUser(req.body.username, req.body.password, res).then()
})

router.post('/user/sessions', (req, res) => {
  mongoHandler.login(req.body.username, req.body.password, res).then()
})

module.exports = router