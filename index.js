const connectToMongo = require('./db');
const express = require('express');
const cors = require('cors')
const app = express();
app.use(cors());
connectToMongo();
app.use(express.json());//if we want use req.body a middleware is required, namely app.use()
const port = 5000;
// available routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));
app.listen(port, () => {
    console.log(`iNotebook App listening on port http://127.0.0.1:${port}`)
})