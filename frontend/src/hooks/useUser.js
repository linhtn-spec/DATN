import { useContext } from "react";
import { UserContext } from "../store/user";
import { ACTION_USER } from "../store/user/action";

/**
 * Custom hook to access and mutate the current authenticated user.
 *
 * @returns {{ user: object|null, login: (userData: object) => void, logout: () => void }}
 *
 * @example
 * const { user, logout } = useUser();
 * if (!user) return <Login />;
 */
export const useUser = () => {
    const { state, dispatch } = useContext(UserContext);

    const login = (userData) => {
        dispatch({ type: ACTION_USER.LOGIN, payload: userData });
    };

    const logout = () => {
        dispatch({ type: ACTION_USER.LOGOUT });
    };

    return {
        user: state?.currentUser ?? null,
        login,
        logout,
    };
};
