"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgotPasswordInput = exports.userUpdateInput = exports.resumeUpdateInput = exports.resumeInput = exports.userSigninInput = exports.userSignupInput = void 0;
const zod_1 = __importDefault(require("zod"));
exports.userSignupInput = zod_1.default.object({
    username: zod_1.default.string().trim().min(5, { message: "required" }),
    email: zod_1.default.string().email(),
    password: zod_1.default.string().trim().min(5, { message: "required" })
});
exports.userSigninInput = zod_1.default.object({
    email: zod_1.default.string().email(),
    password: zod_1.default.string().min(1, { message: "required" })
});
exports.resumeInput = zod_1.default.object({
    jobExperience: zod_1.default.array(zod_1.default.object({ nameOfOrganization: zod_1.default.string(), yearsOfExperience: zod_1.default.number().optional() })),
    skills: zod_1.default.array(zod_1.default.object({ skill: zod_1.default.string(), level: zod_1.default.string().optional(), yearsOfExperience: zod_1.default.number() })),
    proof_of_work: zod_1.default.array(zod_1.default.object({ title: zod_1.default.string(), link: zod_1.default.string() }))
});
exports.resumeUpdateInput = zod_1.default.object({
    jobExperience: zod_1.default.array(zod_1.default.object({ nameOfOrganization: zod_1.default.string(), yearsOfExperience: zod_1.default.number().optional() })).optional(),
    skills: zod_1.default.array(zod_1.default.object({ skill: zod_1.default.string(), level: zod_1.default.string().optional(), yearsOfExperience: zod_1.default.number() })).optional(),
    proof_of_work: zod_1.default.array(zod_1.default.object({ title: zod_1.default.string(), link: zod_1.default.string() })).optional()
});
exports.userUpdateInput = zod_1.default.object({
    username: zod_1.default.string().trim().min(5).optional(),
    email: zod_1.default.string().email().optional(),
    password: zod_1.default.string().trim().min(5).optional()
});
exports.forgotPasswordInput = zod_1.default.object({
    email: zod_1.default.string().email()
});
