import { useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    AUTH_REQUIRED_PATHS,
    PUBLIC_PATHS,
    ROLE_BLOCKED_PATHS,
    ROLE_HOME_PATH,
} from "../config/roleConfig.jsx";
import { UserContext } from "../store/user";

/**
 * ProtectRoute — Role-based route guard.
 *
 * All permission logic (home paths, blocked paths, public paths) is
 * defined in `src/config/roleConfig.js`. Edit that file to change permissions.
 */
export const ProtectRoute = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { state } = useContext(UserContext);
    const { pathname } = location;
    const user = state?.currentUser;
    const role = user?.role;

    useEffect(() => {
        // ── Not logged in ────────────────────────────────────────────────
        if (!user) {
            const needsAuth = AUTH_REQUIRED_PATHS.some((p) => pathname.includes(p));
            if (needsAuth) {
                navigate("/client", { replace: true });
                return;
            }
            const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
            if (isPublic) return;

            navigate("/", { replace: true });
            return;
        }

        // ── Logged in: redirect to correct home if on wrong base path ────
        const homePath = ROLE_HOME_PATH[role];
        if (homePath && !pathname.startsWith(homePath)) {
            navigate(homePath, { replace: true });
            return;
        }

        // ── Check role-specific blocked paths ────────────────────────────
        const blocked = ROLE_BLOCKED_PATHS[role] ?? [];
        const isBlocked = blocked.some((p) => pathname.startsWith(p));
        if (isBlocked) {
            navigate("/admin", { replace: true });
        }
    }, [user, navigate, pathname, role]);

    return children;
};
