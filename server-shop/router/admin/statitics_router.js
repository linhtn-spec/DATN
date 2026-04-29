import { Router } from "express";
import { countAddedPerDay, countDailyOrders, countMonthlyOrders, count_order, count_product_category, count_statitics, unsold } from "../../controllers/statitics_controller.js";

const router = Router();

router.get("/count_product_category", count_product_category)
router.get("/count_order", count_order)
router.get("/count_statitics", count_statitics)
router.get("/order_per_month", countMonthlyOrders)
router.get("/order_per_day", countDailyOrders)
router.get("/unsold", unsold)
router.get("/statitics_perday", countAddedPerDay)

export default router;
