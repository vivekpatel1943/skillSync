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
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
// configuring the environment variables
dotenv_1.default.config();
const sendEmail = (to, subject, text, html) => __awaiter(void 0, void 0, void 0, function* () {
    // create transporter
    const transporter = nodemailer_1.default.createTransport({
        service: "gmail", //Or use 'host' , 'port' etc. for custom SMTP
        auth: {
            user: process.env.EMAIL_USER, //your email address
            pass: process.env.EMAIL_PASS // App password (for gmail , use an app password)
        }
    });
    // sendEmail 
    const info = yield transporter.sendMail({
        from: `SkillSync <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
        html
    });
    console.log("Message sent %s", info.messageId);
});
exports.sendEmail = sendEmail;
