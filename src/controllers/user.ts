import {prisma} from '../utils/prisma.js'; 
import {Request,Response} from 'express';
import { userSignupInput } from '../types/types.js';
import bcrypt from 'bcryptjs';


export const userSignup = async (req:Request,res:Response) : Promise<any> => {
    try{

        const parsedPayload = userSignupInput.safeParse(req.body);

        if(!parsedPayload.success){
            return res.status(400).json({msg:"internal server error.."})
        }

        const {username , email , password } = parsedPayload.data;

        // here the number 10 is the number of salt rounds which refer to the number of recursive hashing that the password will go through
        const hashedPassword = await bcrypt.hash(password,10);

        const user = await prisma.user.create({
            data : {
                username : username,
                email : email,
                password : hashedPassword
            }
        })

        res.status(200).json({msg : "user has been successfully created",user})                                                                               
    }catch(err){
        console.error(err);
        res.status(500).json({msg:"internal server error..."})
    }
}

