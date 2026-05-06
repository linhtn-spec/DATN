import express from "express";
import { get_tax_config, update_tax_config } from "../../controllers/tax_controller.js";
import { checkAuth } from "../../middleware/check_auth.js";

const router = express.Router();

router.get("/tax-config", get_tax_config);
router.put("/tax-config/:id", checkAuth, update_tax_config); // Using checkAuth for admin verification where applicable

export default router;
