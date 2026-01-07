const express = require('express');
const database = require('./src/database/db.config');
const { register } = require('./src/config/metrics');
require('dotenv').config();
const app = express();

const cors = require('cors');
app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

database.mongoose.connect(database.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('Connected to MongoDB');
})
.catch(err => {
    console.error('Error connecting to MongoDB:', err);
});

app.get('/', (req, res) => {
    res.send({ message: 'Hello World!' });
});

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
    try {
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
    } catch (err) {
        res.status(500).end(err);
    }
});

require('./src/api/routes/routes')(app);

app.listen(process.env.PORT, () => {
    console.log('Listening on port', process.env.PORT);
});
