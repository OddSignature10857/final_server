import express from 'express'; 
import { registerUser, loginUser,getUser,getAllUsers,deleteAllUsers } from '../controllers/authControllers.js';  


const router = express.Router();


router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/user', getUser);
router.get('/users', getAllUsers); 
router.delete('/trash', deleteAllUsers);

export default router;
