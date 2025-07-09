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
exports.userSignup = void 0;
const prisma_js_1 = require("../utils/prisma.js");
const types_js_1 = require("../types/types.js");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
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
