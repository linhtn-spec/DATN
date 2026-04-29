import { Router } from "express";

import { authRole, checkAuth } from "../../middleware/check_auth.js";
import { Role } from "../../helper/enum.js";
import { addFavourite, deleteFavourite, getFavourite } from "../../controllers/favourite_controller.js";


const router = Router();

router.post("/favourite", addFavourite)
router.delete("/favourite", deleteFavourite)
router.get("/favourite", getFavourite)

export default router;
