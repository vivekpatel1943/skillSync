"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgotPassword = exports.userUpdate = exports.skillDelete = exports.resumeDelete = exports.resumeUpdate = exports.resume = exports.profile = exports.getAllUsers = exports.userSignin = exports.userSignup = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const prisma_js_1 = require("../utils/prisma.js");
const types_js_1 = require("../types/types.js");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_1 = __importDefault(require("express"));
const emailService_js_1 = require("../emailService.js");
const app = (0, express_1.default)();
// configuring environment variables
dotenv_1.default.config();
// middlewares
app.use(express_1.default.json());
const userSignup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parsedPayload = types_js_1.userSignupInput.safeParse(req.body);
        if (!parsedPayload.success) {
            return res.status(400).json({ msg: "internal server error.." });
        }
        const { username, email, password } = parsedPayload.data;
        // here the number 10 is the number of salt rounds which refer to the number of recursive hashing that the password will go through
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const user = yield prisma_js_1.prisma.user.create({
            data: {
                username: username,
                email: email,
                password: hashedPassword
            }
        });
        res.status(200).json({ msg: "user has been successfully created", user });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ msg: "internal server error..." });
    }
});
exports.userSignup = userSignup;
const userSignin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parsedPayload = types_js_1.userSigninInput.safeParse(req.body);
        if (!parsedPayload.success) {
            return res.status(400).json({ msg: "invalid inputs" });
        }
        const { email, password } = parsedPayload.data;
        const user = yield prisma_js_1.prisma.user.findUnique({
            where: {
                email: email
            }
        });
        if (!user) {
            return res.status(404).json({ msg: "user with given email not found" });
        }
        console.log("user", user);
        // now i gotta compare the passwords that we have saved in the database and the one entered by the user, if the passwords match we will send the user the jwt token which he can send everytime he sends a request and through which we can ensure his idenity before sending him the resposnse to the requests , 
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "password doesn't match..." });
        }
        // function to sign the token
        // SignOptions type is a special type imported from the jsonwebtoken module itself for optional settings like expiresIn , algorithm etc imported from jsonwebtoken,
        // options ?? {} => if options are not available it will be empty object
        const signToken = (payload, secret, options) => {
            return new Promise((resolve, reject) => {
                jsonwebtoken_1.default.sign(payload, secret, options !== null && options !== void 0 ? options : {}, (err, token) => {
                    if (err || !token)
                        return reject(err);
                    resolve(token);
                });
            });
        };
        console.log("type of secret", typeof (process.env.jwt_secret));
        if (!process.env.jwt_secret) {
            throw new Error("missing jwt_secret in the environment variables..");
        }
        const token = yield signToken({ userId: user.id, email: user.email }, process.env.jwt_secret, { expiresIn: '1w' });
        console.log("token", token);
        res
            .cookie('token', token, {
            httpOnly: true, //prevents javascript access to cookies , helps avoid XSS (cross-site scripting)
            secure: process.env.NODE_ENV === 'production', //while in development this stays false 
            //while in production secure : true, and this ensures that cookie is only sent over https in production 
            sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000 // max age will be a week 
        })
            .status(200).json({ msg: "logged in successfully.." });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ msg: "internal server error..." });
    }
});
exports.userSignin = userSignin;
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma_js_1.prisma.user.findMany();
        res.status(200).json({ msg: "all users retrieved...", users });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ msg: "internal server error..." });
    }
});
exports.getAllUsers = getAllUsers;
const profile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(400).json({ msg: "user property doesn't exist in the request object." });
        }
        const user = yield prisma_js_1.prisma.user.findUnique({
            where: {
                id: req.user.userId
            }
        });
        console.log(exports.profile);
        res.status(200).json({ msg: "user has been successfully retrieved", user });
    }
    catch (err) {
        res.status(500).json({ msg: "internal server error.." });
    }
});
exports.profile = profile;
// route to add resume
const resume = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parsedPayload = types_js_1.resumeInput.safeParse(req.body);
        console.log("parsed_payload", parsedPayload);
        if (!parsedPayload.success) {
            return res.status(400).json({ msg: "invalid request...." });
        }
        if (!req.user) {
            return res.status(500).json({ msg: "request object does not have not any user property." });
        }
        const user = yield prisma_js_1.prisma.user.findUnique({
            where: {
                id: req.user.userId
            }
        });
        if (!user) {
            return res.status(404).json({ msg: "user not found..." });
        }
        const { jobExperience, skills, proof_of_work } = parsedPayload.data;
        const resume = yield prisma_js_1.prisma.resume.create({
            data: {
                jobExperience,
                proof_of_work,
                user: { connect: { id: user.id } }
            }
        });
        yield Promise.all(skills.map((sk) => __awaiter(void 0, void 0, void 0, function* () {
            return yield prisma_js_1.prisma.skill.create({
                data: {
                    skill: sk.skill,
                    level: sk.level,
                    yearsOfExperience: sk.yearsOfExperience,
                    resume: { connect: { id: resume.id } }
                }
            });
        })));
        res.status(200).json({ msg: "resume and skill tables create.." });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ msg: "internal server error...." });
    }
});
exports.resume = resume;
const resumeUpdate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parsedPayload = types_js_1.resumeUpdateInput.safeParse(req.body);
        if (!parsedPayload.success) {
            return res.status(400).json({ msg: "invalid input...." });
        }
        if (!req.user) {
            return res.status(500).json({ msg: "user object doesn't exist in the request object" });
        }
        const user = yield prisma_js_1.prisma.user.findUnique({
            where: {
                id: req.user.userId
            },
            include: {
                resume: true
            }
        });
        if (!user) {
            return res.status(404).json({ msg: "user doesn't exist" });
        }
        console.log("user", user);
        if (!user.resume) {
            return res.status(400).json("resume of the user doesn't exist , please create one...");
        }
        const resume = yield prisma_js_1.prisma.resume.findUnique({
            where: {
                id: user.resume.id,
            },
            include: {
                skills: true
            }
        });
        if (!resume) {
            return res.status(400).json({ msg: "no resume is asscociated with this user..." });
        }
        const { jobExperience, skills, proof_of_work } = parsedPayload.data;
        if (!skills || !proof_of_work || !jobExperience) {
            return res.status(400).json({ msg: "provide skills and proof of work and job experience as well if you have any." });
        }
        const updatedResume = yield prisma_js_1.prisma.resume.update({
            where: {
                userId: user.id
            },
            data: {
                jobExperience: jobExperience !== null && jobExperience !== void 0 ? jobExperience : resume.jobExperience,
                proof_of_work: proof_of_work !== null && proof_of_work !== void 0 ? proof_of_work : resume.proof_of_work,
                user: { connect: { id: user.id } }
            },
        });
        yield Promise.all(skills.map((sk) => __awaiter(void 0, void 0, void 0, function* () {
            const alreadyExists = resume.skills.some((rk) => {
                return (rk.skill === sk.skill);
            });
            if (!alreadyExists) {
                return yield prisma_js_1.prisma.skill.create({
                    data: {
                        skill: sk.skill,
                        level: sk.level,
                        yearsOfExperience: sk.yearsOfExperience,
                        resume: { connect: { id: resume.id } }
                    }
                });
            }
        })));
        console.log("resume", resume);
        console.log("skills", skills);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ msg: "internal server error..." });
    }
});
exports.resumeUpdate = resumeUpdate;
const resumeDelete = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(400).json({ msg: "request object has no user object..." });
        }
        // user
        const user = yield prisma_js_1.prisma.user.findUnique({
            where: {
                id: req.user.userId
            },
            include: {
                resume: true
            }
        });
        console.log("user", user);
        yield prisma_js_1.prisma.resume.delete({
            where: {
                userId: req.user.userId
            }
        });
        res.status(200).json({ msg: "your resume has been succesfully deleted...." });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ msg: "internal server error..." });
    }
});
exports.resumeDelete = resumeDelete;
const skillDelete = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { skillId } = req.query;
        if (!skillId) {
            return res.status(400).json({ msg: "please provide the id of the skill that you want to delete..." });
        }
        if (!req.user) {
            return res.status(400).json({ msg: "request object does not have a user object..." });
        }
        // resume associated with the user
        const resume = yield prisma_js_1.prisma.resume.findUnique({
            where: {
                userId: req.user.userId
            },
            include: {
                skills: true
            }
        });
        console.log("resume", resume);
        yield prisma_js_1.prisma.skill.delete({
            where: { id: parseInt(skillId.toString()) }
        });
        return res.status(200).json({ msg: "skill deleted successfully...." });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ msg: "internal server error.." });
    }
});
exports.skillDelete = skillDelete;
// route to update username , email and password or only one of them, 
const userUpdate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // we want the user to signin again  
        const parsedPayload = types_js_1.userUpdateInput.safeParse(req.body);
        if (!parsedPayload.success) {
            return res.status(400).json({ msg: "invalid input..." });
        }
        if (!req.user) {
            return res.status(400).json({ msg: "request object does not contain any user object.." });
        }
        const user = yield prisma_js_1.prisma.user.findUnique({
            where: { id: req.user.userId }
        });
        const { username, email, password } = parsedPayload.data;
        if (!user) {
            return res.status(400).json({ msg: "user doesn't exist.." });
        }
        const updatedUser = yield prisma_js_1.prisma.user.update({
            where: {
                id: req.user.userId
            },
            data: {
                username: username !== null && username !== void 0 ? username : user.username,
                email: email !== null && email !== void 0 ? email : user.email,
                password: password !== null && password !== void 0 ? password : user.password
            }
        });
        return res.status(200).json({ msg: "user credentials have been succesfully updated...", updatedUser });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ msg: "internal server error..." });
    }
});
exports.userUpdate = userUpdate;
// route to update the password when the user has forgotten the password and thus can't log in
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parsedPayload = types_js_1.forgotPasswordInput.safeParse(req.body);
        if (!parsedPayload.success) {
            return res.status(400).json({ msg: "invalid input.." });
        }
        const { email } = parsedPayload.data;
        const otp = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
        //  with nodemailer we will send the above random number to the user's email as otp
        (0, emailService_js_1.sendEmail)(`${email}`, "email verification", `your email verification code is ${otp}, if this isn't you please report at @skillSyncReportForum`, `<div>
                <p><strong>your email verification otp is ${otp}</strong></p>,
                <p><b>we have received a request to change your account's password , if this is not you please report at @skillSyncReportForum</b></p>
            </div>`);
        return res.status(200).json({ msg: "otp sent to the user's email successfully..." });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ msg: "internal server error..." });
    }
});
exports.forgotPassword = forgotPassword;
