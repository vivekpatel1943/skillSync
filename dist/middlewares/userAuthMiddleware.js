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
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
// configuring all the environment variables
dotenv_1.default.config();
// middlewares
app.use(express_1.default.json());
// this middleware is simply to verify the token being sent from the frontend
// we are using async so the return type of the function will be Promise<any> rather than just any
const userAuthMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // console.log("cookie object",req.cookies)
        const token = req.cookies.token;
        if (!token) {
            return res.status(400).json({ msg: "access denied... token not provided...." });
        }
        try {
            // jwt.verify helps us to verify that the token being used have not been expired and they have not been tampered with
            const verifyJwt = (token, secret) => {
                return new Promise((resolve, reject) => {
                    jsonwebtoken_1.default.verify(token, secret, (err, data) => {
                        if (err)
                            return reject(err);
                        resolve(data);
                    });
                });
            };
            if (!process.env.jwt_secret) {
                throw new Error("jwt secret not available in the environment variables...");
            }
            const isVerified = yield verifyJwt(token, process.env.jwt_secret);
            if (!isVerified) {
                return res.status(400).json({ msg: "invalid token...." });
            }
            console.log("isVerified", isVerified);
            // console.log("req",req)
            req.user = isVerified;
            next();
        }
        catch (err) {
            console.error(err);
        }
    }
    catch (err) {
        console.error(err);
    }
});
exports.default = userAuthMiddleware;
