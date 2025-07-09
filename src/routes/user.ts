import express,{Router} from 'express';
import { userSignup } from '../controllers/user'; 

const router = Router();

// middlewares
router.use(express.json())

router.post('/userSignup',userSignup);

export default router;
