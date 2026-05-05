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
        <Flex vertical>
            <Flex justify='space-between' className='group_link'>
                <Flex justify='center' align='center' className={clsx('link', activeLink === 'information' && 'active_link')} onClick={() => setActive('information')}>
                    <NavLink
                        to={''}
                        className='information'
                    >
                        Information
                    </NavLink>
                </Flex>
                <Flex justify='center' align='center' className={clsx('link', activeLink === 'orders' && 'active_link')} onClick={() => setActive('orders')} >
                    <NavLink
                        to={'orders'}
                        className='variant'
                    >
                        Orders
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
