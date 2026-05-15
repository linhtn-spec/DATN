import { InfoCircleOutlined, StarOutlined, ShoppingOutlined } from '@ant-design/icons';
import { Flex } from 'antd';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { Outlet } from 'react-router';
import { NavLink, useNavigate } from 'react-router-dom';
import './DetailProduct.css';
import AdminHeader from '../../../components/AdminHeader';

export const DetailProduct = () => {

    const navigate = useNavigate();

    return (
        <Flex vertical className="product-detail-wrapper">
            <AdminHeader 
                title="Thông tin chi tiết sản phẩm" 
                icon={<ShoppingOutlined />} 
                onBack={() => navigate('/admin/product')} 
            />
            
            <Flex justify='flex-start' gap={12} className='info-navigation-tabs'>
                <NavLink
                    to={''}
                    end
                    className={({ isActive }) => clsx('nav-tab', isActive && 'active')}
                >
                    <InfoCircleOutlined /> <span>Thông tin sản phẩm</span>
                </NavLink>
                <NavLink
                    to={'ratings'}
                    className={({ isActive }) => clsx('nav-tab', isActive && 'active')}
                >
                    <StarOutlined /> <span>Đánh giá khách hàng</span>
                </NavLink>
            </Flex >

            <div className="tab-content-area">
                <Outlet />
            </div>
        </Flex >
    );
};
