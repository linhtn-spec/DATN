import {
    StarOutlined,
    ShopOutlined,
    UserOutlined,
    CalendarOutlined,
    CommentOutlined,
    MessageOutlined
} from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
    Button,
    Flex,
    Form,
    Image,
    Input,
    Rate,
    Switch,
    Typography,
    Row,
    Col
} from 'antd';
import Card from "antd/es/card/Card";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import convertToDate from "../../../../../../functions/convertDate";
import { queryClient } from "../../../../../../main";
import { detailRating, updateRating } from "../../../../../../services/rating_service";
import Notification from "../../../../../../utils/configToastify";
import './DetailRating.css';
import AdminHeader from "../../../../components/AdminHeader";

const formItemLayout = {
    labelCol: {
        xs: { span: 100 },
        sm: { span: 60 },
    },
    wrapperCol: {
        xs: { span: 80 },
        sm: { span: 40 },
    },
};

export function DetailRating() {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const { rating_id, product_id } = useParams()
    const { data, isSuccess } = useQuery({
        queryKey: ['detail_rating_admin', rating_id],
        queryFn: () => detailRating(rating_id),
        enabled: !!rating_id
    })

    const rawData = isSuccess ? (data?.data?.data || data?.data) : null;
    const isActiveValue = Form.useWatch('isActive', form)

    const { mutate } = useMutation({
        mutationFn: (data) => updateRating(data),
        onSuccess: () => {
            Notification({ message: "Cập nhật trạng thái đánh giá thành công!", type: "success" })
            queryClient.invalidateQueries({ queryKey: ['ratings_admin_list'] })
            if (product_id) {
                navigate(`/admin/product/${product_id}/ratings`, { replace: true })
            } else {
                navigate(-1)
            }
        },
        onError: () => {
            Notification({ message: "Cập nhật trạng thái đánh giá thất bại!", type: "error" })
        }
    })

    useEffect(() => {
        if (!isSuccess || !rawData) return
        form.setFieldsValue({
            name: (rawData?.userId?.firstName || '') + " " + (rawData?.userId?.lastName || ''),
            stars: rawData?.stars,
            createdAt: rawData?.createdAt,
            isActive: rawData?.isActive,
            reply: rawData?.reply || ''
        })
    }, [isSuccess, rawData, form]);

    return (
        <Flex className="detail-rating-container" vertical>
            <AdminHeader title="Chi tiết đánh giá" icon={<StarOutlined />} />
            
            <Form 
                form={form}
                layout="vertical"
                className="detail-rating-form"
            >
                <Row gutter={[24, 24]}>
                    {/* Left Side: Interaction & Metadata */}
                    <Col xs={24} lg={10}>
                        <Card bordered={false} className="glass-card shadow-sm info-card">
                            <Typography.Title level={5} className="section-title">
                                <UserOutlined /> Thông tin khách hàng
                            </Typography.Title>
                            
                            <Form.Item label="Khách hàng" name="name">
                                <Input prefix={<UserOutlined />} readOnly variant="filled" />
                            </Form.Item>

                            <Form.Item label="Điểm đánh giá" name="stars">
                                <Rate disabled />
                            </Form.Item>

                            <Form.Item label="Ngày đánh giá" name="createdAt">
                                <Input prefix={<CalendarOutlined style={{color: '#1890ff'}} />} readOnly variant="filled" value={convertToDate(rawData?.createdAt)} />
                            </Form.Item>

                            <Typography.Title level={5} className="section-title" style={{ marginTop: 24 }}>
                                <ShopOutlined /> Sản phẩm liên quan
                            </Typography.Title>

                            <Flex gap={16} align="center" style={{ background: 'rgba(0,0,0,0.02)', padding: 12, borderRadius: 12 }}>
                                <Image src={rawData?.productId?.images?.[0]} width={80} height={80} style={{ borderRadius: 8, objectFit: 'cover' }} />
                                <Flex vertical>
                                    <Typography.Text strong>{rawData?.productId?.name}</Typography.Text>
                                    <Typography.Text type="secondary" size="small">ID: {rawData?.productId?._id}</Typography.Text>
                                    <Button type="link" size="small" style={{ padding: 0, textAlign: 'left' }} 
                                        onClick={() => navigate(`/admin/product/${rawData?.productId?._id}`)}>
                                        Xem chi tiết sản phẩm
                                    </Button>
                                </Flex>
                            </Flex>
                        </Card>
                    </Col>

                    {/* Right Side: Content & Reply */}
                    <Col xs={24} lg={14}>
                        <Flex vertical gap={24}>
                            <Card bordered={false} className="glass-card shadow-sm content-card">
                                <Typography.Title level={5} className="section-title">
                                    <CommentOutlined /> Nội dung đánh giá
                                </Typography.Title>
                                
                                <div className="rating-content-box">
                                    <Typography.Paragraph style={{ fontSize: 16 }}>
                                        {rawData?.content || "Không có nội dung nhận xét."}
                                    </Typography.Paragraph>
                                </div>

                                <div className="rating-images-section" style={{ marginTop: 20 }}>
                                    <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>Hình ảnh đính kèm:</Typography.Text>
                                    <Flex gap={12} wrap="wrap">
                                        {rawData?.images?.length > 0 ? rawData.images.map((img, idx) => (
                                            <Image 
                                                key={idx} 
                                                src={img} 
                                                width={100} 
                                                height={100} 
                                                style={{ objectFit: 'cover', borderRadius: '8px', border: '1px solid #f0f0f0' }} 
                                            />
                                        )) : <Typography.Text type="secondary" italic>Khách hàng không đính kèm hình ảnh</Typography.Text>}
                                    </Flex>
                                </div>
                            </Card>

                            <Card bordered={false} className="glass-card shadow-sm reply-card" style={{ borderLeft: '4px solid #1890ff' }}>
                                <Typography.Title level={5} className="section-title" style={{ color: '#1890ff' }}>
                                    <MessageOutlined /> Phản hồi của cửa hàng
                                </Typography.Title>
                                
                                <Form.Item name="reply">
                                    <Input.TextArea 
                                        rows={6} 
                                        placeholder="Nhập nội dung phản hồi chân thành đến khách hàng..." 
                                        maxLength={1000}
                                        showCount
                                        style={{ borderRadius: 8 }}
                                    />
                                </Form.Item>

                                <Flex gap={12} align="center">
                                <Flex justify="space-between" align="center" className="status-item">
                                    <Form.Item name="isActive" label="Hiển thị đánh giá" valuePropName="checked" style={{ marginBottom: 0 }}>
                                        <Switch 
                                            checkedChildren="Bật" 
                                            unCheckedChildren="Tắt"
                                            onChange={(e) => mutate({ id: rating_id, isActive: e })}
                                        />
                                    </Form.Item>
                                </Flex>
                                    <Button 
                                        type="primary" 
                                        icon={<MessageOutlined />}
                                        size="large"
                                        onClick={() => mutate({ id: rating_id, reply: form.getFieldValue('reply') })}
                                        style={{ marginLeft: 'auto', borderRadius: 8 }}
                                    >
                                        Gửi phản hồi
                                    </Button>
                                </Flex>
                            </Card>
                        </Flex>
                    </Col>
                </Row>
            </Form>
        </Flex>
    );
}