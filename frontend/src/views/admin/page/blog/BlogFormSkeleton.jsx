import { Col, Flex, Row, Skeleton } from 'antd';
import Card from "antd/es/card/Card";

function BlogFormSkeleton() {
    return (
        <Row gutter={[24, 24]}>
            {/* Left Column: Visual / Thumbnail and Visibility Settings */}
            <Col xs={24} lg={9}>
                <Flex vertical gap={24}>
                    <Card bordered={false} className="glass-card shadow-sm media-card">
                        <Flex vertical gap={16}>
                            <Skeleton.Input active size="small" style={{ width: 120 }} />
                            <Skeleton.Node active style={{ width: '100%', height: 180, borderRadius: 12 }} />
                        </Flex>
                    </Card>

                    <Card bordered={false} className="glass-card shadow-sm visibility-card">
                        <Flex vertical gap={16}>
                            <Skeleton.Input active size="small" style={{ width: 140 }} />
                            
                            <Flex vertical gap={8}>
                                <Skeleton.Input active size="small" style={{ width: 100 }} />
                                <Skeleton.Input active block size="large" />
                            </Flex>

                            <Flex justify="space-between" align="center" style={{ marginTop: 8 }}>
                                <Skeleton.Input active size="small" style={{ width: 120 }} />
                                <Skeleton.Button active size="small" shape="round" style={{ width: 44 }} />
                            </Flex>
                        </Flex>
                    </Card>
                </Flex>
            </Col>

            {/* Right Column: Title & Content specifications */}
            <Col xs={24} lg={15}>
                <Card bordered={false} className="glass-card shadow-sm details-card">
                    <Flex vertical gap={24}>
                        <Skeleton.Input active size="small" style={{ width: 150 }} />
                        
                        <Flex vertical gap={8}>
                            <Skeleton.Input active size="small" style={{ width: 80 }} />
                            <Skeleton.Input active block size="large" />
                        </Flex>

                        <Flex vertical gap={8}>
                            <Skeleton.Input active size="small" style={{ width: 80 }} />
                            <Skeleton.Node active style={{ width: '100%', height: 280, borderRadius: 8 }} />
                        </Flex>

                        <Flex justify="flex-end" gap={12} style={{ marginTop: 16 }}>
                            <Skeleton.Button active size="large" style={{ width: 100 }} />
                            <Skeleton.Button active size="large" style={{ width: 120 }} />
                        </Flex>
                    </Flex>
                </Card>
            </Col>
        </Row>
    );
}

export default BlogFormSkeleton;
