import { Router } from "express";
import { update_rating } from "../../controllers/rating_controller.js";
import { edit_validator } from "../../validator/rating_validator.js";
import { auditLogger } from "../../middleware/audit_middleware.js";

const router = Router();

router.put("/rating/:id", auditLogger("EDIT_RATING", "Rating"), edit_validator, update_rating);

export default router;
