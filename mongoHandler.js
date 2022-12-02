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
  }
}

module.exports = mongoHandler