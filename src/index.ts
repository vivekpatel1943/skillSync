import express from 'express';
import dotenv from 'dotenv';
import router from './routes/user'
import cookieParser from 'cookie-parser';
import {prisma} from './utils/prisma';
import {redisClient} from './redisClient';

// configuring all the environment variables
dotenv.config();

const app = express();

// middlewares
app.use('/api/v1',router)
// the following middleware makes json available as javascript objects, 
app.use(express.json());
app.use(cookieParser());

async function databaseConnect(){
    try{
        await prisma.$connect();
        console.log("connected to the database successfully..")
    }catch(err){
        console.error(err);
    }
}

databaseConnect();

async function redisConnect(){
    try{
        await redisClient.connect();
        console.log("redis connection successfull...")
    }catch(err){
        console.error("redis client error",err)
    }
}

redisConnect();

const port = 5000;

app.listen(port , () => {
    console.log(`your server is running on port ${port}.`)
})