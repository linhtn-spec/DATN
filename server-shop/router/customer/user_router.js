import { Router } from "express";
import rateLimit from "express-rate-limit";
import passport from "passport";
import { create_user, deleteUser, detailUser, forgetPassword, get_all_user_available, getAll, getCurrentUser, login, loginByGoogle, logout, paginate_customer, paginate_user, refresh_token, register, resetPassword, resetPasswordCurrentUser, updateUser } from "../../controllers/user_controller.js";
import { authRole, checkAuth } from "../../middleware/check_auth.js";
import { auditLogger } from "../../middleware/audit_middleware.js";
import { Role } from "../../helper/enum.js";
import { create_validator, edit_validator, forgot_password_validator, login_validator, register_validator, reset_password_validator, send_email_validator } from "../../validator/user_validator.js";


const router = Router();

router.get('/user', getCurrentUser)
router.put('/users/:user_id', auditLogger("UPDATE_USER", "User"), edit_validator, updateUser)
router.put('/reset-password-current', auditLogger("RESET_PASSWORD", "User"), reset_password_validator, resetPasswordCurrentUser)
router.post('/logout', logout);

export default router;
