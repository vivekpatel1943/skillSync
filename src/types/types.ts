import zod from 'zod';


export const userSignupInput = zod.object({
    username : zod.string().trim().min(5,{message:"required"}),
    email : zod.string().email(),
    password : zod.string().trim().min(5,{message:"required"})
})

