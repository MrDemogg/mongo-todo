const bcrypt = require('bcrypt')
const {MongoClient, ObjectId} = require('mongodb')

const client = new MongoClient('mongodb://localhost:27017')

const mongoHandler = {
  insertUser: async (username, password, res) => {
    try {
      await client.connect()
      const collection = await client.db('todo').collection('users')
      if (username === await collection.findOne({username: username})) {
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
  }
}

module.exports = mongoHandler