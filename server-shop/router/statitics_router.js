import { Router } from "express";
import { count_order, count_product_category, count_statitics, countDailyOrders, countMonthlyOrders, countAddedPerDay, unsold } from "../controllers/statitics_controller.js";
import { authRole, checkAuth } from "../middleware/check_auth.js";
import { Role } from "../helper/enum.js";

const router = Router()


router.get("/count_product_category", checkAuth, authRole(Role.ADMIN), count_product_category)

router.get("/count_order", checkAuth, authRole(Role.ADMIN), count_order)

router.get("/count_statitics", checkAuth, authRole(Role.ADMIN), count_statitics)


router.get("/order_per_month", checkAuth, authRole(Role.ADMIN), countMonthlyOrders)

router.get("/order_per_day", checkAuth, authRole(Role.ADMIN), countDailyOrders)

router.get("/unsold", checkAuth, authRole(Role.ADMIN), unsold)

router.get("/statitics_perday", checkAuth, authRole(Role.ADMIN), countAddedPerDay)

export default router