import { Router } from "express";
import { getChatroomDetail, getChatrooms, sendMessage } from '../controllers/chat_controller.js'
import { authRole, checkAuth } from "../middleware/check_auth.js";
import { Role } from "../helper/enum.js";
import { create_validator } from "../validator/chat_validator.js";

const router = Router();


router.post("/chat", checkAuth, authRole(Role.CUSTOMER), create_validator, sendMessage);

router.get("/chat", checkAuth, authRole(Role.CUSTOMER), getChatrooms);
router.get("/chat/:roomId", checkAuth, authRole(Role.CUSTOMER), getChatroomDetail);


export default router;