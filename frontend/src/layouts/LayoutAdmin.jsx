import { Layout } from 'antd'
import Navbar from '../views/admin/layout/navbar';
import HeaderClient from '../views/admin/layout/header';
import { Outlet } from 'react-router';
import Copyright from '../views/client/layout/copyright';
import '../views/admin/style/admin-layout.css';
export const LayoutAdmin = () => {
    const { Content } = Layout;

    return (
        <Layout hasSider style={{
            minHeight: '100vh',
        }}>
            <Navbar />
            <Layout className="admin-main-layout">
                <HeaderClient />
                <Content className="admin-content-area">
                    <div className="content-inner">
                        <Outlet />
                    </div>
                </Content>
                <Copyright />
            </Layout>
        </Layout >
    )
}
