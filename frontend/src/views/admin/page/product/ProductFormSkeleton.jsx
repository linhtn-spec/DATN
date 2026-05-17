import { Col, Flex, Row, Skeleton } from 'antd';
import Card from "antd/es/card/Card";

function ProductFormSkeleton() {
    return (
        <Row gutter={[24, 24]}>
            {/* Left Column: Visuals & Core Info Skeleton */}
            <Col xs={24} lg={9}>
                <Flex vertical gap={24}>
                    <Card bordered={false} className="glass-card shadow-sm image-card">
                        <Flex vertical gap={16}>
                            <Skeleton.Input active size="small" style={{ width: 150 }} />
                            <Skeleton.Node active style={{ width: 104, height: 104, borderRadius: 12 }} />
                        </Flex>
                    </Card>

                    <Card bordered={false} className="glass-card shadow-sm status-card">
                        <Skeleton.Input active size="small" style={{ width: 180, marginBottom: 24 }} />
                        <Flex justify="space-between" align="center">
                            <Skeleton.Input active size="small" style={{ width: 120 }} />
                            <Skeleton.Button active size="small" shape="round" style={{ width: 44 }} />
                        </Flex>
                        <div style={{ margin: '16px 0', borderTop: '1px solid #f0f0f0' }}></div>
                        <Skeleton active paragraph={{ rows: 1 }} title={false} />
                    </Card>
                </Flex>
            </Col>

            {/* Right Column: Detailed Specs Skeleton */}
            <Col xs={24} lg={15}>
                <Card bordered={false} className="glass-card shadow-sm details-card">
                    <Skeleton.Input active size="small" style={{ width: 150, marginBottom: 24 }} />
                    
                    <Row gutter={16}>
                        <Col span={24}>
                            <Flex vertical style={{ marginBottom: 24 }}>
                                <Skeleton.Input active size="small" style={{ width: 100, marginBottom: 8 }} />
                                <Skeleton.Input active block size="large" />
                            </Flex>
                        </Col>
                        <Col xs={24} md={12}>
                            <Flex vertical style={{ marginBottom: 24 }}>
                                <Skeleton.Input active size="small" style={{ width: 80, marginBottom: 8 }} />
                                <Skeleton.Input active block size="large" />
                            </Flex>
                        </Col>
                        <Col xs={24} md={12}>
                            <Flex vertical style={{ marginBottom: 24 }}>
                                <Skeleton.Input active size="small" style={{ width: 80, marginBottom: 8 }} />
                                <Skeleton.Input active block size="large" />
                            </Flex>
                        </Col>
                    </Row>

                    <Skeleton.Input active size="small" style={{ width: 150, marginTop: 12, marginBottom: 24 }} />
                    
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Flex vertical style={{ marginBottom: 24 }}>
                                <Skeleton.Input active size="small" style={{ width: 100, marginBottom: 8 }} />
                                <Skeleton.Input active block size="large" />
                            </Flex>
                        </Col>
                        <Col xs={24} md={12}>
                            <Flex vertical style={{ marginBottom: 24 }}>
                                <Skeleton.Input active size="small" style={{ width: 100, marginBottom: 8 }} />
                                <Skeleton.Input active block size="large" />
                            </Flex>
                        </Col>
                    </Row>

                    <Skeleton.Input active size="small" style={{ width: 150, marginTop: 12, marginBottom: 24 }} />
                    <Flex vertical style={{ marginBottom: 24 }}>
                        <Skeleton.Input active size="small" style={{ width: 100, marginBottom: 8 }} />
                        <Skeleton.Node active style={{ width: '100%', height: 150, borderRadius: 8 }} />
                    </Flex>

                    <Flex justify="flex-end" gap={12} style={{ marginTop: 32 }}>
                        <Skeleton.Button active size="large" style={{ width: 100 }} />
                        <Skeleton.Button active size="large" style={{ width: 160 }} />
                    </Flex>
                </Card>
            </Col>
        </Row>
    );
}

export default ProductFormSkeleton;
