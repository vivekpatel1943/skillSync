import dotenv from 'dotenv';
import jwt, { JwtPayload } from 'jsonwebtoken';
import {Request,Response,NextFunction} from 'express';
import express from 'express';
import cookieParser from 'cookie-parser';

const app = express();

// configuring all the environment variables
dotenv.config();

// middlewares
app.use(express.json());
// app.use(cookieParser())

declare global {
    namespace Express {
        interface Request {
            user? : JwtPayload
        }
    }
}

// this middleware is simply to verify the token being sent from the frontend
// we are using async so the return type of the function will be Promise<any> rather than just any
const userAuthMiddleware = async (req : Request,res:Response,next:NextFunction) : Promise<any> => {
    try{

        // console.log("cookie object",req.cookies)
        const token = req.cookies.token;

        if(!token){
            return res.status(400).json({msg:"access denied... token not provided...."})
        }

        try{

            // jwt.verify helps us to verify that the token being used have not been expired and they have not been tampered with
            const verifyJwt = (token : string,secret : string) : Promise<JwtPayload> => {
                return new Promise((resolve,reject) => {
                    jwt.verify(token,secret,(err,data) => {
                        if(err) return reject(err);
                        resolve(data as JwtPayload);
                    })
                })
            }

            if(!process.env.jwt_secret){
                throw new Error("jwt secret not available in the environment variables...")
            }

        
            const isVerified = await verifyJwt(token,process.env.jwt_secret);

            if(!isVerified){
                return res.status(400).json({msg:"invalid token...."})
            }

            console.log("isVerified",isVerified);

            // console.log("req",req)

            req.user = isVerified;

            next();

        }catch(err){
            console.error(err);
        }


    }catch(err){
        console.error(err);
    }

}

export default userAuthMiddleware;