import { Router } from "express";
import {
    clear_cart,
    get_cart,
    remove_item,
    sync_cart,
    update_cart
} from "../controllers/cart_controller.js";
import { checkAuth } from "../middleware/check_auth.js";

const router = Router();

router.get("/cart", checkAuth, get_cart);
router.post("/cart/sync", checkAuth, sync_cart);
router.put("/cart", checkAuth, update_cart);
router.delete("/cart/:productId", checkAuth, remove_item);
router.delete("/cart", checkAuth, clear_cart);

export default router;
