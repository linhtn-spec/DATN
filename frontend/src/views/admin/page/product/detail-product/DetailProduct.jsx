import { Flex } from 'antd';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import { NavLink, useNavigate } from 'react-router-dom';
import './DetailProduct.css';
import AdminHeader from '../../../components/AdminHeader';
import { ShoppingOutlined } from '@ant-design/icons';

export const DetailProduct = () => {

    const navigate = useNavigate();
    const [activeLink, setActiveLink] = useState('information');
    const location = useLocation()
    useEffect(() => {
        if (location.pathname.split('/').includes("product")) {
            if (location.pathname.split('/').length === 4) setActiveLink("information")
            else
                setActiveLink(location.pathname.split('/')[4])
        }
    }, [location])

    const setActive = (link) => {
        setActiveLink(link);
    };

    return (
        <Flex vertical>
            <AdminHeader 
                title="Thông tin chi tiết sản phẩm" 
                icon={<ShoppingOutlined />} 
                onBack={() => navigate('/admin/product')} 
            />
            <Flex justify='space-between' className='group_link'>
                <Flex justify='center' align='center' className={clsx('link', activeLink === 'information' && 'active_link')} onClick={() => setActive('information')}>
                    <NavLink
                        to={''}
                        className='information'
                    >
                        Thông tin
                    </NavLink>
                </Flex>
                <Flex justify='center' align='center' className={clsx('link', activeLink === 'ratings' && 'active_link')} onClick={() => setActive('ratings')} >
                    <NavLink
                        to={'ratings'}
                        className='variant'
                    >
                        Đánh giá
                    </NavLink>
                </Flex>
            </Flex >
            <Outlet />
        </Flex >
    );
};
