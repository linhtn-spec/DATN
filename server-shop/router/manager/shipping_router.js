import { Router } from "express";
import * as shipping_controller from "../../controllers/shipping_controller.js";

const router = Router();

router.get("/shipping-config", shipping_controller.get_all_shipping_configs);
router.put("/shipping-config/:id", shipping_controller.update_shipping_config);

export default router;
