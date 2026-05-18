import { Router } from "express";
import { 
    get_notifications, 
    mark_as_read, 
    mark_all_as_read, 
    delete_notification 
} from "../controllers/notification_controller.js";

const router = Router();

router.get("/notifications", get_notifications);
router.put("/notifications/read-all", mark_all_as_read); // Must be before /:id/read
router.put("/notifications/:id/read", mark_as_read);
router.delete("/notifications/:id", delete_notification);

export default router;
