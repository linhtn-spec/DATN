import { createContext, useReducer } from "react";
import { userReducer } from "./reducer";

export const UserContext = createContext({
    state: null,
    dispatch: () => undefined,
});

const getInitialState = () => {
    try {
        const stored = localStorage.getItem("user");
        return stored ? JSON.parse(stored) : { currentUser: null };
    } catch {
        return { currentUser: null };
    }
};

export const UserProvider = ({ children }) => {
    const [state, dispatch] = useReducer(userReducer, getInitialState());
    return (
        <UserContext.Provider value={{ state, dispatch }}>
            {children}
        </UserContext.Provider>
    );
};
