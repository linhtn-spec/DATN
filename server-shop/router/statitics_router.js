import { Router } from "express";
import { count_order, count_product_category, count_statitics, countDailyOrders, countMonthlyOrders, countAddedPerDay, unsold } from "../controllers/statitics_controller.js";
import { authRole, checkAuth } from "../middleware/check_auth.js";
import { Role } from "../helper/enum.js";

const router = Router()


router.get("/count_product_category", checkAuth, authRole(Role.MANAGER), count_product_category)

router.get("/count_order", checkAuth, authRole(Role.MANAGER), count_order)

router.get("/count_statitics", checkAuth, authRole(Role.MANAGER), count_statitics)


router.get("/order_per_month", checkAuth, authRole(Role.MANAGER), countMonthlyOrders)

router.get("/order_per_day", checkAuth, authRole(Role.MANAGER), countDailyOrders)

router.get("/unsold", checkAuth, authRole(Role.MANAGER), unsold)

router.get("/statitics_perday", checkAuth, authRole(Role.MANAGER), countAddedPerDay)

export default router