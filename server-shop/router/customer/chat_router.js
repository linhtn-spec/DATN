import { Router } from "express";
import { getChatroomDetail, getChatrooms, sendMessage } from '../../controllers/chat_controller.js'
import { authRole, checkAuth } from "../../middleware/check_auth.js";
import { Role } from "../../helper/enum.js";
import { create_validator } from "../../validator/chat_validator.js";


const router = Router();

router.post("/chat", create_validator, sendMessage);
router.get("/chat", getChatrooms);
router.get("/chat/:roomId", getChatroomDetail);

export default router;
