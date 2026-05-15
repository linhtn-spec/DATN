import { Layout } from 'antd';
import { useContext, useEffect } from 'react';
import { Outlet } from 'react-router';
import { UserContext } from '../store/user';
import { avoidDoubleClick } from '../utils/avoidDoubleClick';
import Copyright from '../views/client/layout/copyright';
import Footers from '../views/client/layout/footer';
import Headers from '../views/client/layout/header';
import { ChatWidget } from '../views/client/page/ChatWidget/ChatWidget';

export const LayoutClient = () => {
    const { Header, Content, Footer } = Layout;

    const { state } = useContext(UserContext)

    useEffect(() => {
        avoidDoubleClick()
    }, [])

    return (
        <Layout>
            <Header style={{ backgroundColor: 'rgb(255, 255, 255)', zIndex: 30, padding: 0 }}>
                <Headers />
            </Header>
            <Content>
                <Outlet />
            </Content>

            {state?.currentUser && <ChatWidget />}
            <Footer>

                <Footers />
                <Copyright />

            </Footer>
        </Layout>

    );
}