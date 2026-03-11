import { Router } from "express";

import { authRole, checkAuth } from "../middleware/check_auth.js";
import { Role } from "../helper/enum.js";
import { addFavourite, deleteFavourite, getFavourite } from "../controllers/favourite_controller.js";

const router = Router();

router.post("/favourite", checkAuth, authRole(Role.CUSTOMER), addFavourite)

router.delete("/favourite", checkAuth, authRole(Role.CUSTOMER), deleteFavourite)

router.get("/favourite", checkAuth, authRole(Role.CUSTOMER), getFavourite)



export default router;