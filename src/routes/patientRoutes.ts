import { Router } from 'express';
import {
  createPatient,
  getAllPatients,
  getPatient,
  updatePatient
} from "../controllers/patientController";
import { verifyFirebaseToken } from '../../midleware/auth';

const router = Router();

router.get('/',   getAllPatients);
router.post("/patient",  createPatient);
router.get("/patient/:uid",  getPatient);
router.put("/patientEdit/:uid",  updatePatient);

export default router;
