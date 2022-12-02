const express = require('express')
const router = express.Router()
const mongoHandler = require('./mongoHandler')

router.post('/user', (req, res) => {
  mongoHandler.insertUser(req.body.username, req.body.password, res).then()
})

router.post('/user/sessions', (req, res) => {
  mongoHandler.login(req.body.username, req.body.password, res).then()
})

router.get('/tasks', (req, res) => [
  mongoHandler.findTasks(req.get('Token'), req.body.userId, res)
])

router.post('/tasks', (req, res) => {
  mongoHandler.insertTask(req.get('Token'), req.body.userId, req.body.title, req.body.description, res).then()
})

module.exports = router