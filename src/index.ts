import express from 'express';
import dotenv from 'dotenv';
import router from './routes/user'

// configuring all the environment variables
dotenv.config();

const app = express();

// middlewares
app.use('/api/v1',router)
// the following middleware makes json available as javascript objects, 
app.use(express.json());

const port = 5000;

app.listen(port , () => {
    console.log(`your server is running on port ${port}.`)
})