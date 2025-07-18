"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
// configuring all the environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = 5000;
app.listen(port, () => {
    console.log(`your server is running on port ${port}.`);
});
