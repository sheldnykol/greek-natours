const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI;

let client;

async function connectToDatabase() {
  if (!client) {
    client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await client.connect();
    console.log('connected to MongoDB Atlas!');
  }
  return client.db('myDatabaseName');
}

module.exports = connectToDatabase;
