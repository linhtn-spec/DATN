import { useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ROLE } from "../constants/roles";
import { UserContext } from "../store/user";

// Maps each role to its allowed base path
const ROLE_HOME_PATH = {
    [ROLE.CUSTOMER]: "/client",
    [ROLE.STAFF]: "/admin",
    [ROLE.MANAGER]: "/admin",
    [ROLE.ADMIN]: "/admin",
};

// Paths that require authentication (logged-in user)
const AUTH_REQUIRED_PATHS = [
    "/client/cart",
    "/client/checkout",
    "/client/checkout/confirm",
    "/client/checkout/success",
    "/client/user",
];

// Paths accessible without login
const PUBLIC_PATHS = ["/client", "/register", "/forget-password", "/change-password", "/"];

// Paths blocked per role (roles can access /admin base but not these sub-paths)
const ROLE_BLOCKED_PATHS = {
    [ROLE.STAFF]: [
        "/admin/product",
        "/admin/consignment",
        "/admin/users",
        "/admin/sales",
        "/admin/category",
        "/admin/banner",
        "/admin/overview",
        "/admin/ratings",
    ],
    [ROLE.MANAGER]: [
        "/admin/overview",
    ],
    [ROLE.ADMIN]: [],
};

export const ProtectRoute = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { state } = useContext(UserContext);
    const { pathname } = location;
    const user = state?.currentUser;
    const role = user?.role;

    useEffect(() => {
        // Not logged in
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

        // Logged in — ensure user is on their allowed base path
        const homePath = ROLE_HOME_PATH[role];
        if (homePath && !pathname.startsWith(homePath)) {
            navigate(homePath, { replace: true });
            return;
        }

        // Check role-specific blocked paths
        const blocked = ROLE_BLOCKED_PATHS[role] ?? [];
        const isBlocked = blocked.some((p) => pathname.startsWith(p));
        if (isBlocked) {
            navigate("/admin", { replace: true });
        }
    }, [user, navigate, pathname, role]);

    return children;
};
