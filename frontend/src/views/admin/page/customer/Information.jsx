import { InfoCircleOutlined, ShoppingCartOutlined, StarOutlined } from '@ant-design/icons';
import { Flex } from 'antd';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import { NavLink } from 'react-router-dom';
import './Information.css';

export const Infomation = () => {

    const [activeLink, setActiveLink] = useState('information');
    const location = useLocation()
    useEffect(() => {
        if (location.pathname.split('/').includes("customers")) {
            if (location.pathname.split('/').length === 4) setActiveLink("information")
            else
                setActiveLink(location.pathname.split('/')[4])
        }
    }, [location])

    const setActive = (link) => {
        setActiveLink(link);
    };

    return (
        <Flex vertical className="customer-info-wrapper">
            <Flex justify='flex-start' gap={12} className='info-navigation-tabs'>
                <NavLink
                    to={''}
                    end
                    className={({ isActive }) => clsx('nav-tab', isActive && 'active')}
                >
                    <InfoCircleOutlined /> <span>Thông tin chi tiết</span>
                </NavLink>
                <NavLink
                    to={'orders'}
                    className={({ isActive }) => clsx('nav-tab', isActive && 'active')}
                >
                    <ShoppingCartOutlined /> <span>Lịch sử đơn hàng</span>
                </NavLink>
                <NavLink
                    to={'ratings'}
                    className={({ isActive }) => clsx('nav-tab', isActive && 'active')}
                >
                    <StarOutlined /> <span>Đánh giá & Phản hồi</span>
                </NavLink>
            </Flex >
            <div className="tab-content-area">
                <Outlet />
            </div>
        </Flex >
    );
};
