import dotenv from 'dotenv';
import { prisma } from '../utils/prisma.js';
import { Request, Response } from 'express';
import { userSignupInput, userSigninInput, resumeInput, resumeUpdateInput, userUpdateInput, forgotPasswordInput,otpInput } from '../types/types.js';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import express from 'express';
import { sendEmail } from '../emailService.js'
import {redisClient} from '../redisClient.js'; 

const app = express();

// configuring environment variables
dotenv.config();

// middlewares
app.use(express.json())

export const userSignup = async (req: Request, res: Response): Promise<any> => {
    try {

        const parsedPayload = userSignupInput.safeParse(req.body);

        if (!parsedPayload.success) {
            return res.status(400).json({ msg: "internal server error.." })
        }

        const { username, email, password } = parsedPayload.data;

        // here the number 10 is the number of salt rounds which refer to the number of recursive hashing that the password will go through
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                username: username,
                email: email,
                password: hashedPassword
            }
        })

        res.status(200).json({ msg: "user has been successfully created", user })
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "internal server error..." })
    }
}

export const userSignin = async (req: Request, res: Response): Promise<any> => {
    try {
        const parsedPayload = userSigninInput.safeParse(req.body);

        if (!parsedPayload.success) {
            return res.status(400).json({ msg: "invalid inputs" });
        }

        const { email, password } = parsedPayload.data;

        const user = await prisma.user.findUnique({
            where: {
                email: email
            }
        })

        if (!user) {
            return res.status(404).json({ msg: "user with given email not found" });
        }

        console.log("user", user);

        // now i gotta compare the passwords that we have saved in the database and the one entered by the user, if the passwords match we will send the user the jwt token which he can send everytime he sends a request and through which we can ensure his idenity before sending him the resposnse to the requests , 

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ msg: "password doesn't match..." })
        }

        // function to sign the token
        // SignOptions type is a special type imported from the jsonwebtoken module itself for optional settings like expiresIn , algorithm etc imported from jsonwebtoken,
        // options ?? {} => if options are not available it will be empty object
        const signToken = (payload: string | object | Buffer, secret: string, options: SignOptions): Promise<string> => {
            return new Promise((resolve, reject) => {
                jwt.sign(payload, secret, options ?? {}, (err, token) => {
                    if (err || !token) return reject(err);
                    resolve(token);
                })
            })
        }

        console.log("type of secret", typeof (process.env.jwt_secret))

        if (!process.env.jwt_secret) {
            throw new Error("missing jwt_secret in the environment variables..")
        }

        const token = await signToken({ userId: user.id, email: user.email }, process.env.jwt_secret, { expiresIn: '1w' });

        console.log("token", token);

        res
            .cookie('token', token, {
                httpOnly: true, //prevents javascript access to cookies , helps avoid XSS (cross-site scripting)
                secure: process.env.NODE_ENV === 'production', //while in development this stays false 
                //while in production secure : true, and this ensures that cookie is only sent over https in production 
                sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax",
                maxAge: 7 * 24 * 60 * 60 * 1000 // max age will be a week 
            })
            .status(200).json({ msg: "logged in successfully.." })

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "internal server error..." });
    }
}

export const getAllUsers = async (req: Request, res: Response): Promise<any> => {
    try {
        const users = await prisma.user.findMany();

        res.status(200).json({ msg: "all users retrieved...", users });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "internal server error..." })
    }
}

export const profile = async (req: Request, res: Response): Promise<any> => {
    try {

        if (!req.user) {
            return res.status(400).json({ msg: "user property doesn't exist in the request object." })
        }

        const user = await prisma.user.findUnique({
            where: {
                id: req.user.userId
            }
        })

        console.log(profile);

        res.status(200).json({ msg: "user has been successfully retrieved", user });


    } catch (err) {
        res.status(500).json({ msg: "internal server error.." });
    }
}

// route to add resume
export const resume = async (req: Request, res: Response): Promise<any> => {
    try {
        const parsedPayload = resumeInput.safeParse(req.body);

        console.log("parsed_payload", parsedPayload)

        if (!parsedPayload.success) {
            return res.status(400).json({ msg: "invalid request...." })
        }

        if (!req.user) {
            return res.status(500).json({ msg: "request object does not have not any user property." })
        }

        const user = await prisma.user.findUnique({
            where: {
                id: req.user.userId
            }
        })

        if (!user) {
            return res.status(404).json({ msg: "user not found..." })
        }

        const { jobExperience, skills, proof_of_work } = parsedPayload.data;

        const resume = await prisma.resume.create({
            data: {
                jobExperience,
                proof_of_work,
                user: { connect: { id: user.id } }
            }
        })

        await Promise.all(
            skills.map(async (sk) => {
                return await prisma.skill.create({
                    data: {
                        skill: sk.skill,
                        level: sk.level,
                        yearsOfExperience: sk.yearsOfExperience,
                        resume: { connect: { id: resume.id } }
                    }
                })
            })
        )

        res.status(200).json({ msg: "resume and skill tables create.." })

    } catch (err) {
        console.error(err);
        return res.status(500).json({ msg: "internal server error...." })
    }
}

export const resumeUpdate = async (req: Request, res: Response): Promise<any> => {
    try {

        const parsedPayload = resumeUpdateInput.safeParse(req.body);

        if (!parsedPayload.success) {
            return res.status(400).json({ msg: "invalid input...." })
        }

        if (!req.user) {
            return res.status(500).json({ msg: "user object doesn't exist in the request object" })
        }

        const user = await prisma.user.findUnique({
            where: {
                id: req.user.userId
            },
            include: {
                resume: true
            }
        })

        if (!user) {
            return res.status(404).json({ msg: "user doesn't exist" })
        }

        console.log("user", user)

        if (!user.resume) {
            return res.status(400).json("resume of the user doesn't exist , please create one...")
        }

        const resume = await prisma.resume.findUnique({
            where: {
                id: user.resume.id,
            },
            include: {
                skills: true
            }
        })

        if (!resume) {
            return res.status(400).json({ msg: "no resume is asscociated with this user..." })
        }

        const { jobExperience, skills, proof_of_work } = parsedPayload.data;

        if (!skills || !proof_of_work || !jobExperience) {
            return res.status(400).json({ msg: "provide skills and proof of work and job experience as well if you have any." })
        }

        const updatedResume = await prisma.resume.update({
            where: {
                userId: user.id
            },
            data: {
                jobExperience: jobExperience ?? resume.jobExperience,
                proof_of_work: proof_of_work ?? resume.proof_of_work,
                user: { connect: { id: user.id } }
            },
        })

        await Promise.all(
            skills.map(async (sk) => {

                const alreadyExists = resume.skills.some((rk) => {
                    return (rk.skill === sk.skill)
                })

                if (!alreadyExists) {
                    return await prisma.skill.create({
                        data: {
                            skill: sk.skill,
                            level: sk.level,
                            yearsOfExperience: sk.yearsOfExperience,
                            resume: { connect: { id: resume.id } }
                        }
                    })
                }
            })
        )

        console.log("resume", resume);
        console.log("skills", skills);

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "internal server error..." });
    }
}

export const resumeDelete = async (req: Request, res: Response): Promise<any> => {
    try {

        if (!req.user) {
            return res.status(400).json({ msg: "request object has no user object..." })
        }

        // user
        const user = await prisma.user.findUnique({
            where: {
                id: req.user.userId
            },
            include: {
                resume: true
            }
        })

        console.log("user", user)


        await prisma.resume.delete({
            where: {
                userId: req.user.userId
            }
        })

        res.status(200).json({ msg: "your resume has been succesfully deleted...." })

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "internal server error..." })
    }
}

export const skillDelete = async (req: Request, res: Response): Promise<any> => {
    try {

        const { skillId } = req.query;

        if (!skillId) {
            return res.status(400).json({ msg: "please provide the id of the skill that you want to delete..." })
        }

        if (!req.user) {
            return res.status(400).json({ msg: "request object does not have a user object..." })
        }

        // resume associated with the user
        const resume = await prisma.resume.findUnique({
            where: {
                userId: req.user.userId
            },
            include: {
                skills: true
            }
        })

        console.log("resume", resume);

        await prisma.skill.delete({
            where: { id: parseInt(skillId.toString()) }
        })

        return res.status(200).json({ msg: "skill deleted successfully...." })
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "internal server error.." });
    }
}

// route to update username , email and password or only one of them, 
export const userUpdate = async (req: Request, res: Response): Promise<any> => {
    try {
        // we want the user to signin again  

        const parsedPayload = userUpdateInput.safeParse(req.body);

        if (!parsedPayload.success) {
            return res.status(400).json({ msg: "invalid input..." })
        }

        if (!req.user) {
            return res.status(400).json({ msg: "request object does not contain any user object.." })
        }


        const user = await prisma.user.findUnique({
            where: { id: req.user.userId }
        })

        const { username, email, password } = parsedPayload.data;

        if (!user) {
            return res.status(400).json({ msg: "user doesn't exist.." })
        }

        const updatedUser = await prisma.user.update({
            where: {
                id: req.user.userId
            },
            data: {
                username: username ?? user.username,
                email: email ?? user.email,
                password: password ?? user.password
            }
        })

        return res.status(200).json({ msg: "user credentials have been succesfully updated...", updatedUser })


    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "internal server error..." })
    }
}

// route to update the password when the user has forgotten the password and thus can't log in
export const forgotPassword = async (req: Request, res: Response): Promise<any> => {
    try {

        const parsedPayload = forgotPasswordInput.safeParse(req.body);

        if (!parsedPayload.success) {
            return res.status(400).json({ msg: "invalid input.." })
        }

        const { email } = parsedPayload.data;

        const user = await prisma.user.findUnique({
            where : {
                email : email
            }
        })

        if(!user){
            return res.status(404).json({msg:"user with the email does not exist..."})
        }

        const storedOTP = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
        await redisClient.set(`otp`,storedOTP,{EX:300}); //300s = 5 mins

        //  with nodemailer we will send the above random number to the user's email as otp
        sendEmail(
            `${email}`,
            "email verification",
            `your email verification code is ${storedOTP}, if this isn't you please report at @skillSyncReportForum`,
            `<div>
                <p><strong>your email verification otp is ${storedOTP}</strong></p>,
                <p><b>we have received a request to change your account's password , if this is not you please report at @skillSyncReportForum</b></p>
            </div>`
        )

        return res.status(200).json({ msg: "otp sent to the user's email successfully..." })
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "internal server error..." })
    }
}

export const verifyOTP = async (req:Request,res:Response) : Promise<any> => {
    try {
        const parsedPayload = otpInput.safeParse(req.body);

        if(!parsedPayload.success){
            return res.status(400).json({msg:"invalid input"})
        }

        const {otp} = parsedPayload.data;


        const storedOTP = await redisClient.get(`otp`);

        if(!storedOTP){
            return res.status(400).json({msg:"OTP expired or not found.."})
        }

        if(parseInt(storedOTP) !== otp){
            return res.status(400).json({msg:"invalid otp"})
        }

        // valid OTP ; delete it after use
        await redisClient.del('otp');

        return res.status(200).json({msg:"OTP verified successfully..."})
    }catch(err){
        console.error(err);
        res.status(500).json({msg:"internal server error..."})
    }
} 