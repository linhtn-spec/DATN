import { Router } from "express";
import {
    clear_cart,
    get_cart,
    remove_item,
    sync_cart,
    update_cart
} from "../../controllers/cart_controller.js";
import { checkAuth } from "../../middleware/check_auth.js";


const router = Router();

router.get("/cart", get_cart);
router.post("/cart/sync", sync_cart);
router.put("/cart", update_cart);
router.delete("/cart/:productId", remove_item);
router.delete("/cart", clear_cart);

export default router;
