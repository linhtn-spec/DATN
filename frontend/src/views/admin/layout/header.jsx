import {
    UserOutlined
} from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { Avatar, Flex, Layout, Popover } from "antd";
import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { ROLE } from '../../../constants/roles';
import { logout, logoutGoogle } from '../../../services/user_service';
import { LogContext } from '../../../store/typeLog/provider';
import { ACTION_USER, UserContext } from '../../../store/user';
import Notification from '../../../utils/configToastify';
import "./../style/header.css";
function HeaderClient() {

    const { Header } = Layout
    const { dispatch, state } = useContext(UserContext)
    const logGoogle = useContext(LogContext)
    const userRole = state?.currentUser?.role

    const outGoogle = useMutation({
        mutationKey: ['logout_google'],
        mutationFn: () => logoutGoogle(),
        retry: false,
        onSuccess: () => {
            Notification({ message: "Logout successully!", type: "success" });
            dispatch({ type: ACTION_USER.LOGOUT })
        },
        onError: () => {
            Notification({ message: `Logout unsuccessfully!`, type: "error" })
        }
    })

    const { mutate } = useMutation({
        mutationFn: () => logout(),
        onSuccess: () => {
            Notification({ message: "Logout successully!", type: "success" });
            dispatch({ type: ACTION_USER.LOGOUT })
        },
        onError: () => {
            Notification({ message: `Logout unsuccessfully!`, type: "error" })
        }
    })
    const handleLogout = () => {
        if (logGoogle?.state?.isLogByGoogle) {
            outGoogle.mutate()
        }
        else {
            mutate()
        }
    }
    const content = (
        <Flex vertical gap={5} style={{ textDecoration: 'none' }}>
            {userRole >= ROLE.STAFF && < NavLink style={{ color: "#000" }} to={`/admin/users/${state?.currentUser?.user_id}`}>Infomation</NavLink>}
            <NavLink style={{ color: "#000" }} onClick={handleLogout}>Logout</NavLink>
        </Flex >
    );
    return (
        <Header className="header">
            <Flex justify="flex-end" align="center" style={{ height: "100%" }}>
                <Popover content={content} arrow={false}>
                    <Avatar size='large' icon={<UserOutlined />} />
                </Popover>
            </Flex>
        </Header>
    );
}


export default HeaderClient;