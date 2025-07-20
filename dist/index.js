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
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const user_1 = __importDefault(require("./routes/user"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const prisma_1 = require("./utils/prisma");
const redisClient_1 = require("./redisClient");
// configuring all the environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
// middlewares
app.use('/api/v1', user_1.default);
// the following middleware makes json available as javascript objects, 
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
function databaseConnect() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield prisma_1.prisma.$connect();
            console.log("connected to the database successfully..");
        }
        catch (err) {
            console.error(err);
        }
    });
}
databaseConnect();
function redisConnect() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield redisClient_1.redisClient.connect();
            console.log("redis connection successfull...");
        }
        catch (err) {
            console.error("redis client error", err);
        }
    });
}
redisConnect();
const port = 5000;
app.listen(port, () => {
    console.log(`your server is running on port ${port}.`);
});
