import { Router } from 'express';
import {
  createInsuranceCompany,
  getAllInsuranceCompanies,
  getInsuranceCompany,
  updateInsuranceCompany,
  deleteInsuranceCompany
} from "../controllers/insuranceCompanyController";
import { verifyFirebaseToken } from '../../midleware/auth';

const router = Router();

router.get('/',   getAllInsuranceCompanies);
router.post("/company",   createInsuranceCompany);
router.get("/company/:id",  getInsuranceCompany);
router.put("/companyEdit/:id",  updateInsuranceCompany);
router.delete("/insurance-company/:id",  deleteInsuranceCompany);

export default router;