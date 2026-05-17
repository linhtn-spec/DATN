import { Col, Flex, Row, Skeleton } from 'antd';
import Card from "antd/es/card/Card";

function ConsignmentFormSkeleton() {
    return (
        <Row gutter={[24, 24]}>
            {/* Left Column: Info & Value Skeleton */}
            <Col xs={24} lg={9}>
                <Flex vertical gap={24}>
                    <Card bordered={false} className="glass-card shadow-sm schedule-card">
                        <Flex vertical gap={16}>
                            <Skeleton.Input active size="small" style={{ width: 150 }} />
                            <Flex vertical gap={8}>
                                <Skeleton.Input active size="small" style={{ width: 100 }} />
                                <Skeleton.Input active block size="large" />
                            </Flex>
                        </Flex>
                    </Card>

                    <Card bordered={false} className="glass-card shadow-sm status-card">
                        <Flex vertical gap={16}>
                            <Skeleton.Input active size="small" style={{ width: 150 }} />
                            <Skeleton.Node active style={{ width: '100%', height: 70, borderRadius: 8 }} />
                        </Flex>
                    </Card>
                </Flex>
            </Col>

            {/* Right Column: Items List Skeleton */}
            <Col xs={24} lg={15}>
                <Card bordered={false} className="glass-card shadow-sm details-card">
                    <Flex vertical gap={24}>
                        <Skeleton.Input active size="small" style={{ width: 180 }} />
                        
                        {/* Item 1 */}
                        <Flex vertical gap={12} style={{ border: '1px dashed #d9d9d9', borderRadius: 8, padding: 16 }}>
                            <Skeleton.Input active size="small" style={{ width: 120 }} />
                            <Skeleton.Input active block size="large" />
                            <Flex gap={16}>
                                <Skeleton.Input active style={{ flex: 1 }} />
                                <Skeleton.Input active style={{ flex: 1 }} />
                            </Flex>
                            <Flex gap={16}>
                                <Skeleton.Input active style={{ flex: 1 }} />
                                <Skeleton.Node active style={{ flex: 1, height: 38 }} />
                            </Flex>
                        </Flex>

                        <Skeleton.Button active size="large" style={{ width: '100%', height: 40 }} />

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

export default ConsignmentFormSkeleton;
