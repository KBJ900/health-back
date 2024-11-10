import { verifyFirebaseToken } from './../../midleware/auth';
import { Router } from 'express';
import {
  createDoctor,
  getAllDoctors,
  getDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorByUid,
  createDoctorForm
} from "../controllers/doctorsController";

const router = Router();

router.get('/', getAllDoctors);
router.post("/doctor",   createDoctor);
router.post("/doctorForm",  createDoctorForm as any); // Use 'as any' to bypass type checking temporarily
router.get("/doctor/:id",   getDoctor);
router.get("/doctorId/:id",  getDoctorByUid);
router.put("/doctorEdit/:id",   updateDoctor);
router.delete("/doctor/:id",   deleteDoctor);

export default router;