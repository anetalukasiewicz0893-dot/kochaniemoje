const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('.')); 

const client = new MongoClient(process.env.MONGO_URL);
let db;

async function init() {
    try {
        await client.connect();
        db = client.db('as_database');
        console.log("Połączono z MongoDB");
    } catch (e) { console.error("Błąd DB:", e); }
}
init();

app.get('/api/data', async (req, res) => {
    try {
        const thoughts = await db.collection('thoughts').find().toArray();
        const whispers = await db.collection('whispers').find().toArray();
        res.json({ thoughts, whispers });
    } catch (e) { res.status(500).send(e); }
});

app.post('/api/thoughts', async (req, res) => {
    await db.collection('thoughts').insertOne(req.body);
    res.status(201).send();
});

app.post('/api/whispers', async (req, res) => {
    await db.collection('whispers').insertOne(req.body);
    res.status(201).send();
});

app.delete('/api/whispers/:id', async (req, res) => {
    await db.collection('whispers').deleteOne({ _id: new ObjectId(req.params.id) });
    res.status(200).send();
});

app.delete('/api/nuke', async (req, res) => {
    await db.collection('thoughts').deleteMany({});
    await db.collection('whispers').deleteMany({});
    res.status(200).send();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serwer na porcie ${PORT}`));
