import { Router } from "express";
import { create_adjustment, detail_adjustment, paginate_adjustments } from "../../controllers/stock_adjustment_controller.js";
import { auditLogger } from "../../middleware/audit_middleware.js";

const router = Router();

router.post('/stock-adjustment', auditLogger("ADD_STOCK_ADJUSTMENT", "StockAdjustment"), create_adjustment);
router.get('/stock-adjustment', paginate_adjustments);
router.get('/stock-adjustment/:id', detail_adjustment);

export default router;
