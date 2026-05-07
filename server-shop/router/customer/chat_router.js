import { Router } from "express";
import { getChatroomDetail, sendMessage } from '../../controllers/chat_controller.js'
import { create_validator } from "../../validator/chat_validator.js";

const router = Router();

router.post("/chat", create_validator, sendMessage);
router.get("/chat/:roomId", getChatroomDetail);

export default router;
