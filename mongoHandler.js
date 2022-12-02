const bcrypt = require('bcrypt')
const {MongoClient, ObjectId} = require('mongodb')
const {v4} = require('uuid')

const client = new MongoClient('mongodb://localhost:27017')

const mongoHandler = {
  insertUser: async (username, password, res) => {
    try {
      await client.connect()
      const collection = await client.db('todo').collection('users')
      let isProfileExists = false
      await collection.findOne({username: username}).then(response => {
        if (response) {
          if (username === response.username) {
            isProfileExists = true
          }
        }
      })
      if (isProfileExists) {
        res.status(403).send('Пользователь с таким username уже существует')
      } else {
        let securePassword
        await bcrypt.hash(password, 5).then(function(hash) {
          securePassword = hash
        });
        await collection.insertOne({username: username, password: securePassword, _id: new ObjectId()}).then()
        res.status(201).send('Успешно')
      }
      await client.close()
    } catch (e) {
      res.status(500).send('Ошибка')
    }
  },
  login: async (username, password, res) => {
    try {
      await client.connect()
      const collection = await client.db('todo').collection('users')
      let token = v4()
      while (token === await collection.findOne({token: token})) {
        token = v4()
      }
      let profile = await collection.findOne({username: username})
      let isPasswordCorrect = false
      if (profile !== null) {
        await bcrypt.compare(password, profile.password).then(function (result) {
          isPasswordCorrect = result
        })
        if (isPasswordCorrect) {
          await collection.updateOne(
            {username: username, password: profile.password},
            {$set: {token: token}}).then(() => {
              res.status(201).send({token: token})
            }
          )
        } else {
          res.status(418).send('Неправильный пароль пупсик')
        }
      } else {
        res.status(404).send('Пользователь не найден')
      }
      await client.close()
    } catch (e) {
      res.status(500).send('Ошибка')
    }
  },
  findTasks: async (token, userId, res) => {
    try {
      await client.connect()
      const collection = await client.db('todo').collection('tasks')
      const users = await client.db('todo').collection('users')
      const isUserLogged = await users.findOne({token: token})
      if (isUserLogged !== null) {
        if (isUserLogged._id === new ObjectId(userId)) {
          const todos = await collection.find({user: new ObjectId(userId)}).toArray()
          res.status(200).send(todos)
        } else {
          res.status(403).send('Данный id - не id пользователя авторизованного сейчас')
        }
      } else {
        res.status(403).send('Пользователь не авторизован')
      }
      await client.close()
    } catch (e) {
      res.status(500).send('Ошибка')
    }
  },
  insertTask: async (token, userId, title, description, res) => {
    try {
      await client.connect()
      const collection = await client.db('todo').collection('tasks')
      const users = await client.db('todo').collection('users')
      const isUserLogged = await users.findOne({token: token})
      if (isUserLogged !== null) {
        if (isUserLogged._id.toString() === userId) {
          await collection.insertOne(
            {
              user: new ObjectId(userId),
              title: title,
              description: description,
              status: 'new',
              _id: new ObjectId()
            }
          )
          res.status(201).send('Успешно')
        } else {
          res.status(403).send('Данный id - не id пользователя авторизованного сейчас')
        }
      } else {
        res.status(403).send('Пользователь не авторизирован')
      }
      await client.close()
    } catch (e) {
      res.status(500).send('Ошибка')
    }
  }
}

module.exports = mongoHandler