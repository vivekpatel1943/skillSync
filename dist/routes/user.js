"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importStar(require("express"));
const user_1 = require("../controllers/user");
const userAuthMiddleware_1 = __importDefault(require("../middlewares/userAuthMiddleware"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const router = (0, express_1.Router)();
// middlewares
router.use(express_1.default.json());
router.use((0, cookie_parser_1.default)());
router.post('/userSignup', user_1.userSignup);
router.post('/userSignin', user_1.userSignin);
router.get('/getAllUsers', user_1.getAllUsers);
router.get('/profile', userAuthMiddleware_1.default, user_1.profile);
router.post('/resume', userAuthMiddleware_1.default, user_1.resume);
router.post('/resumeUpdate', userAuthMiddleware_1.default, user_1.resumeUpdate);
router.post('/userUpdate', userAuthMiddleware_1.default, user_1.userUpdate);
router.delete('/resumeDelete', userAuthMiddleware_1.default, user_1.resumeDelete);
router.delete('/skillDelete', userAuthMiddleware_1.default, user_1.skillDelete);
router.post('/forgotPassword', user_1.forgotPassword);
exports.default = router;
