import { Router } from 'express';
import {
  createRole,
  getAllRoles,
  getRole,
  updateRole,
  deleteRole
} from "../controllers/rolesController";
import { verifyFirebaseToken } from '../../midleware/auth';

const router = Router();

router.get('/',  getAllRoles);
router.post("/",  createRole);
router.get("/:id",  getRole);
router.put("/:id",  updateRole);
router.delete("/:id",  deleteRole);

export default router;