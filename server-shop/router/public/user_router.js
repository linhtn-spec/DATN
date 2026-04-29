import { Router } from "express";
import rateLimit from "express-rate-limit";
import passport from "passport";
import { create_user, deleteUser, detailUser, forgetPassword, get_all_user_available, getAll, getCurrentUser, login, loginByGoogle, logout, paginate_customer, paginate_user, refresh_token, register, resetPassword, resetPasswordCurrentUser, updateUser } from "../../controllers/user_controller.js";
import { authRole, checkAuth } from "../../middleware/check_auth.js";
import { auditLogger } from "../../middleware/audit_middleware.js";
import { Role } from "../../helper/enum.js";
import { create_validator, edit_validator, forgot_password_validator, login_validator, register_validator, reset_password_validator, send_email_validator } from "../../validator/user_validator.js";


const router = Router();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        status: "error",
        message: "Too many attempts, please try again after 15 minutes"
    },
    standardHeaders: true,
    legacyHeaders: false,
});

router.get('/auth/google', passport.authenticate('google'));
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: `${FRONTEND_URL}/`, successRedirect: `${FRONTEND_URL}/client` }));

router.get('/login/google/success', loginByGoogle)

router.post('/logout/google', function (req, res, next) {
    req.logout(function (err) {
        if (err) { return next(err); }
        req.session.destroy(function (err) {
            if (err) {
                console.log("error: " + err);
                res.status(500).json({ message: "Error destroying session" });
            } else {
                res.clearCookie('connect.sid');
                res.clearCookie("refresh_token")
                res.clearCookie("access_token")
                res.status(200).json({ message: "Logged out successfully" });
            }
        });
    });
});
router.get('/users/options/all', getAll)
router.get('/users/:user_id', detailUser)
router.put('/reset-password', forgot_password_validator, resetPassword)
router.post('/register', authLimiter, register_validator, register);
router.post('/login', authLimiter, login_validator, login);
router.post('/forget-password', authLimiter, send_email_validator, forgetPassword)
router.post('/refresh_token', refresh_token)

export default router;
