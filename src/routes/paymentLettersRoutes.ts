import { Router } from 'express';
import {
  createPaymentLetter,
  getPaymentLetter,
  getAllPaymentLetters,
  updatePaymentLetter,
  getPaymentLettersByDoctorId
} from "../controllers/paymentLettersControllers";
import { verifyFirebaseToken } from '../../midleware/auth';

const router = Router();

router.get('/',  getAllPaymentLetters);
router.get('/doctor/:doctor_id',  getPaymentLettersByDoctorId);
router.post("/invoice",  createPaymentLetter);
router.get("/invoice/:uid",  getPaymentLetter);
router.put("/invoiceEdit/:uid",  updatePaymentLetter);

export default router;