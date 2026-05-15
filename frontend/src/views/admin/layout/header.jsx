import {
    UserOutlined
} from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { Avatar, Flex, Layout, Popover, Space } from "antd";
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
            Notification({ message: "Đăng xuất thành công!", type: "success" });
            dispatch({ type: ACTION_USER.LOGOUT })
        },
        onError: () => {
            Notification({ message: `Đăng xuất thất bại!`, type: "error" })
        }
    })

    const { mutate } = useMutation({
        mutationFn: () => logout(),
        onSuccess: () => {
            Notification({ message: "Đăng xuất thành công!", type: "success" });
            dispatch({ type: ACTION_USER.LOGOUT })
        },
        onError: () => {
            Notification({ message: `Đăng xuất thất bại!`, type: "error" })
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
        <Flex vertical gap={4} className="popover-content">
            <div className="popover-header">
                <div className="popover-user-name">{state?.currentUser?.firstName} {state?.currentUser?.lastName}</div>
                <div className="popover-user-role">{userRole === ROLE.ADMIN ? 'Administrator' : 'Staff'}</div>
            </div>
            <hr className="popover-divider" />
            {userRole >= ROLE.STAFF && (
                <NavLink className="popover-item" to={`/admin/users/${state?.currentUser?.user_id || state?.currentUser?._id}`}>
                    Thông tin cá nhân
                </NavLink>
            )}
            <NavLink className="popover-item logout" onClick={handleLogout}>
                Đăng xuất
            </NavLink>
        </Flex >
    );
    return (
        <Header className="admin-header-main">
            <Flex justify="flex-end" align="center" className="header-content">
                <Space size={24}>
                    <Popover 
                        content={content} 
                        arrow={false} 
                        trigger="click"
                        placement="bottomRight"
                        overlayClassName="user-popover"
                    >
                        <Flex align="center" gap={12} className="user-profile-trigger">
                            <div className="user-info-text">
                                <span className="user-name">{state?.currentUser?.username}</span>
                            </div>
                            <Avatar 
                                size={40} 
                                icon={<UserOutlined />} 
                                src={state?.currentUser?.image}
                                className="user-avatar"
                            />
                        </Flex>
                    </Popover>
                </Space>
            </Flex>
        </Header>
    );
}


export default HeaderClient;