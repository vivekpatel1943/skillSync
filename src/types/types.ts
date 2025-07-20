import zod from 'zod';


export const userSignupInput = zod.object({
    username : zod.string().trim().min(5,{message:"required"}),
    email : zod.string().email(),
    password : zod.string().trim().min(5,{message:"required"})
})

export const userSigninInput = zod.object({
    email : zod.string().email(),
    password : zod.string().min(1,{message:"required"})
})

export const resumeInput = zod.object({
    jobExperience : zod.array(zod.object({nameOfOrganization:zod.string(),yearsOfExperience:zod.number().optional()})),
    skills : zod.array(zod.object({skill : zod.string(),level : zod.string().optional(),yearsOfExperience:zod.number()})),
    proof_of_work : zod.array(zod.object({title : zod.string(),link:zod.string()})) 
})

export const resumeUpdateInput = zod.object({
    jobExperience : zod.array(zod.object({nameOfOrganization:zod.string(),yearsOfExperience:zod.number().optional()})).optional(),
    skills : zod.array(zod.object({skill : zod.string(),level : zod.string().optional(),yearsOfExperience:zod.number()})).optional(),
    proof_of_work : zod.array(zod.object({title : zod.string(),link:zod.string()})).optional() 
})


export const userUpdateInput = zod.object({
    username : zod.string().trim().min(5).optional(),
    email : zod.string().email().optional(),
    password : zod.string().trim().min(5).optional()
})


export const forgotPasswordInput = zod.object({
    email : zod.string().email()
})


export const otpInput = zod.object({
    otp : zod.number()
})