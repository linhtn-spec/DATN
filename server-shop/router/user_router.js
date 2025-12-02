import { Router } from "express";
import passport from "passport";
import { create_user, deleteUser, detailUser, forgetPassword, get_all_user_available, getAll, getCurrentUser, login, loginByGoogle, logout, paginate_customer, paginate_user, refresh_token, register, resetPassword, resetPasswordCurrentUser, updateUser } from "../controllers/user_controller.js";
import { authRole, checkAuth } from "../middleware/check_auth.js";
import { create_validator, edit_validator, forgot_password_validator, login_validator, register_validator, reset_password_validator, send_email_validator } from "../validator/user_validator.js";

const router = Router();
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

router.get('/auth/google', passport.authenticate('google'));
router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: `${FRONTEND_URL}/`, successRedirect: `${FRONTEND_URL}/client` }));

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
router.get('/user', checkAuth, authRole([0, 1, 2, 3]), getCurrentUser)
router.get('/users', checkAuth, authRole([3]), paginate_user)
router.get('/customers', checkAuth, authRole([1]), paginate_customer)
router.get('/users/available/all', checkAuth, authRole([2]), get_all_user_available)

router.put('/users/:user_id', checkAuth, authRole([0, 3]), edit_validator,updateUser)
router.put('/reset-password', forgot_password_validator, resetPassword)
router.put('/reset-password-current', checkAuth, authRole([0, 3]), reset_password_validator, resetPasswordCurrentUser)

router.delete('/users/delete/:user_id', deleteUser)

router.post('/register', register_validator, register);
router.post('/login', login_validator, login);
router.post('/logout', checkAuth, authRole([0, 1, 2, 3]), logout);
router.post('/forget-password', send_email_validator, forgetPassword)
router.post('/users', checkAuth, authRole([3]), create_validator, create_user)

router.post('/refresh_token', refresh_token)

export default router;