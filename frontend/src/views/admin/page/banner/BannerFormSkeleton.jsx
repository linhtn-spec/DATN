import { Col, Flex, Row, Skeleton } from 'antd';
import Card from "antd/es/card/Card";

function BannerFormSkeleton() {
    return (
        <Row gutter={[24, 24]}>
            {/* Left Column: Visuals & Status Skeleton */}
            <Col xs={24} lg={9}>
                <Flex vertical gap={24}>
                    <Card bordered={false} className="glass-card shadow-sm image-card">
                        <Flex vertical gap={16}>
                            <Skeleton.Input active size="small" style={{ width: 150 }} />
                            <Skeleton.Node active style={{ width: '100%', height: 160, borderRadius: 12 }} />
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

            {/* Right Column: Details Skeleton */}
            <Col xs={24} lg={15}>
                <Card bordered={false} className="glass-card shadow-sm details-card">
                    <Flex vertical gap={24}>
                        <Skeleton.Input active size="small" style={{ width: 150 }} />
                        
                        <Flex vertical gap={8}>
                            <Skeleton.Input active size="small" style={{ width: 100 }} />
                            <Skeleton.Input active block size="large" />
                        </Flex>

                        <Flex vertical gap={8}>
                            <Skeleton.Input active size="small" style={{ width: 100 }} />
                            <Skeleton.Input active style={{ width: 150 }} size="large" />
                        </Flex>

                        <Flex vertical gap={8}>
                            <Skeleton.Input active size="small" style={{ width: 100 }} />
                            <Skeleton.Node active style={{ width: '100%', height: 120, borderRadius: 8 }} />
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

export default BannerFormSkeleton;
