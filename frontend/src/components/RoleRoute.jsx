import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { UserContext } from "../store/user";

/**
 * RoleRoute — Declarative role-based routing wrapper.
 * Requires the user to have a role >= minRole to access the children routes.
 * 
 * If access is denied, redirects to the safe landing zone (/admin).
 */
export const RoleRoute = ({ minRole }) => {
    const { state } = useContext(UserContext);
    
    // Ensure the state exists and extract role
    const userRole = state?.currentUser?.role;

    // If undefined or less than required minRole, bounce them back
    if (userRole === undefined || userRole < minRole) {
        return <Navigate to="/admin" replace />;
    }
    
    // Valid role, render the nested components
    return <Outlet />;
};
