import { useQuery } from '@tanstack/react-query'
import { useContext, useEffect } from 'react'
import { ACTION_USER } from '../store/user/action'
import { UserContext } from '../store/user/provider'
import { getMe } from '../services/user_service'
import Notification from '../utils/configToastify'

export const AuthProvider = ({ children }) => {
    const { state, dispatch } = useContext(UserContext)
    const { data, isError, isSuccess } = useQuery({
        queryKey: ['getMe'],
        queryFn: () => getMe(),
        enabled: !!state?.currentUser
    })

    useEffect(() => {
        if (isSuccess && data?.data) {
            const userData = data.data;
            // Normalize ID field for consistency across the app
            const normalizedUser = {
                ...userData,
                user_id: userData.user_id || userData._id
            };
            dispatch({ type: ACTION_USER.LOGIN, payload: normalizedUser });
        }
    }, [isSuccess, data, dispatch])

    useEffect(() => {
        if (!isError) return
        dispatch({ type: ACTION_USER.LOGOUT })
        Notification({ message: "Token expired!!", type: 'error' })
    }, [isError, dispatch])

    return children
}
