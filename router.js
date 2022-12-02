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

router.put('/tasks/:id', (req, res) => {
  let status = undefined
  if (req.body.status === 'now' || req.body.status === 'in_progress' || req.body.status === "complete") {
    status = req.body.status
  }
  const changes = {
    title: req.body.title ? req.body.title : undefined,
    description: req.body.description ? req.body.description : undefined,
    status: status
  }
  mongoHandler.changeTask(JSON.parse(JSON.stringify(changes)), req.params.id, req.body.userId, req.get('Token'), res).then()
})

module.exports = router