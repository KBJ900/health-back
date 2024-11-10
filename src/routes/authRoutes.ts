import express from 'express';
import { login, createUser, getUser } from '../controllers/authController';

const router = express.Router();

router.post('/login', login);
router.post('/signup', createUser);
router.get('/user/:uid', getUser);

export default router;
