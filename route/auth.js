import express from 'express'; 
import { registerUser, loginUser,getUser,getAllUsers } from '../controllers/authControllers.js';  


const router = express.Router();


router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/user', getUser);
router.get('/users', getAllUsers); 
export default router;
