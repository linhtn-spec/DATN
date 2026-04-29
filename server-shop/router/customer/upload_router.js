import { Router } from "express";
import { upload_image } from "../../controllers/upload_controller.js";
import { Role } from "../../helper/enum.js";
import { authRole, checkAuth } from "../../middleware/check_auth.js";


const router = Router();

router.post("/upload_image", upload_image)

export default router;
