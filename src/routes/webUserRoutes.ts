import { Router } from 'express';
import {
  createWebUser,
  getAllWebUsers,
  getWebUser,
  updateWebUser,
  deleteWebUser,
  getWebUserId
} from "../controllers/webUserController";
import { verifyFirebaseToken } from '../../midleware/auth';

const router = Router();

router.get('/', getAllWebUsers);
router.post("/",createWebUser);
router.get("/:id", getWebUser);
router.get("/userId/:id", getWebUserId);
router.put("/:id", updateWebUser);
router.delete("/:id", deleteWebUser);

export default router;