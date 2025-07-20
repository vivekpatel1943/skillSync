import express,{Router} from 'express';
import { userSignup,userSignin, getAllUsers,profile,resume,resumeUpdate,userUpdate,resumeDelete,skillDelete,forgotPassword,verifyOTP} from '../controllers/user'; 
import userAuthMiddleware from '../middlewares/userAuthMiddleware';
import cookieParser from 'cookie-parser';

const router = Router();

// middlewares
router.use(express.json())
router.use(cookieParser())

router.post('/userSignup',userSignup);
router.post('/userSignin',userSignin);
router.get('/getAllUsers',getAllUsers);
router.get('/profile',userAuthMiddleware,profile);
router.post('/resume',userAuthMiddleware,resume);
router.post('/resumeUpdate',userAuthMiddleware,resumeUpdate);
router.post('/userUpdate',userAuthMiddleware,userUpdate)
router.delete('/resumeDelete',userAuthMiddleware,resumeDelete);
router.delete('/skillDelete',userAuthMiddleware,skillDelete);

router.post('/forgotPassword',forgotPassword)
router.post('/verifyOTP',verifyOTP)

export default router;
