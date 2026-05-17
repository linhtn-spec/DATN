import { Col, Flex, Row, Skeleton } from 'antd';
import Card from "antd/es/card/Card";

function SaleFormSkeleton() {
    return (
        <Row gutter={[24, 24]}>
            {/* Left Column: Schedule & Status Skeleton */}
            <Col xs={24} lg={9}>
                <Flex vertical gap={24}>
                    <Card bordered={false} className="glass-card shadow-sm schedule-card">
                        <Flex vertical gap={16}>
                            <Skeleton.Input active size="small" style={{ width: 150 }} />
                            
                            <Flex vertical gap={8}>
                                <Skeleton.Input active size="small" style={{ width: 100 }} />
                                <Skeleton.Input active block size="large" />
                            </Flex>

                            <Flex vertical gap={8}>
                                <Skeleton.Input active size="small" style={{ width: 100 }} />
                                <Skeleton.Input active block size="large" />
                            </Flex>
                        </Flex>
                    </Card>

                    <Card bordered={false} className="glass-card shadow-sm status-card">
                        <Flex vertical gap={16}>
                            <Skeleton.Input active size="small" style={{ width: 180 }} />
                            <Flex justify="space-between" align="center">
                                <Skeleton.Input active size="small" style={{ width: 120 }} />
                                <Skeleton.Button active size="small" shape="round" style={{ width: 44 }} />
                            </Flex>
                        </Flex>
                    </Card>
                </Flex>
            </Col>

            {/* Right Column: Products List Skeleton */}
            <Col xs={24} lg={15}>
                <Card bordered={false} className="glass-card shadow-sm details-card">
                    <Flex vertical gap={24}>
                        <Skeleton.Input active size="small" style={{ width: 180 }} />
                        
                        {/* Item 1 */}
                        <Flex align="center" gap={16} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 16 }}>
                            <Skeleton.Input active size="small" style={{ width: 80 }} />
                            <Flex vertical gap={8} style={{ flex: 2 }}>
                                <Skeleton.Input active block />
                            </Flex>
                            <Flex vertical gap={8} style={{ flex: 1 }}>
                                <Skeleton.Input active block />
                            </Flex>
                            <Skeleton.Button active size="small" shape="circle" />
                        </Flex>

                        {/* Item 2 */}
                        <Flex align="center" gap={16}>
                            <Skeleton.Input active size="small" style={{ width: 80 }} />
                            <Flex vertical gap={8} style={{ flex: 2 }}>
                                <Skeleton.Input active block />
                            </Flex>
                            <Flex vertical gap={8} style={{ flex: 1 }}>
                                <Skeleton.Input active block />
                            </Flex>
                            <Skeleton.Button active size="small" shape="circle" />
                        </Flex>

                        <Skeleton.Button active size="large" style={{ width: 150, marginTop: 16 }} />

                        <Flex justify="flex-end" gap={12} style={{ marginTop: 32 }}>
                            <Skeleton.Button active size="large" style={{ width: 100 }} />
                            <Skeleton.Button active size="large" style={{ width: 120 }} />
                        </Flex>
                    </Flex>
                </Card>
            </Col>
        </Row>
    );
}

export default SaleFormSkeleton;
