// augmenting the Express Request interface with a user property 
declare global {
    namespace Express {
        interface Request {
            user? : JwtPayload
        }
    }
}