import React from "react";
import { Layout, Flex } from "antd";
import { ManageChat } from "./ManageChat";
import { Outlet } from "react-router";
import "./UnifiedChat.css";

const { Sider, Content } = Layout;

export const UnifiedChatLayout = () => {
    return (
        <Layout className="unified-chat-layout" style={{ height: "calc(100vh - 150px)", background: "transparent" }}>
            <Sider width={350} className="chat-sidebar" theme="light">
                <ManageChat isSidebar={true} />
            </Sider>
            <Content className="chat-content">
                <Outlet />
            </Content>
        </Layout>
    );
};
