import {
    PlusOutlined
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
    Typography
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
    const productIdValue = Form.useWatch('productId', form)
    const productNameValue = Form.useWatch('productName', form)
    const imageValue = Form.useWatch('image', form)
    const starsValue = Form.useWatch('stars', form)
    const nameValue = Form.useWatch('name', form)
    const createdAtValue = Form.useWatch('createdAt', form)
    const contentValue = Form.useWatch('content', form)
    const imagesValue = Form.useWatch('images', form)

    const { rating_id, product_id } = useParams()


    const { data, isSuccess } = useQuery({
        queryKey: ['detail_rating_admin', rating_id],
        queryFn: () => detailRating(rating_id),
        enabled: !!rating_id
    })

    const { mutate } = useMutation({
        mutationFn: (data) => updateRating(data),
        onSuccess: () => {
            Notification({ message: "Cập nhật trạng thái đánh giá thành công!", type: "success" })
            queryClient.invalidateQueries({ queryKey: ['ratings_admin_list'] })
            queryClient.invalidateQueries({ queryKey: ['ratings_global_list'] })
            if (product_id) {
                navigate(`/admin/product/${product_id}/ratings`, { replace: true })
            } else {
                navigate(`/admin/ratings`, { replace: true })
            }
        },
        onError: () => {
            Notification({ message: "Cập nhật trạng thái đánh giá thất bại!", type: "error" })
        }
    })

    useEffect(() => {
        if (!isSuccess) return
        const rawData = data?.data?.data || data?.data;
        console.log(rawData);
        form.setFieldValue('productId', rawData?.productId?._id)
        form.setFieldValue('stars', rawData?.stars)
        form.setFieldValue('createdAt', rawData?.createdAt)
        form.setFieldValue('name', rawData?.userId.firstName + " " + rawData?.userId.lastName)
        form.setFieldValue('productName', rawData?.productId?.name)
        form.setFieldValue('image', rawData?.productId?.images[0])
        form.setFieldValue('isActive', rawData?.isActive)
        form.setFieldValue('content', rawData?.content)
        form.setFieldValue('images', rawData?.images || [])
        form.setFieldValue('reply', rawData?.reply || '')
    }, [isSuccess, data, form])

    return (
        <Flex className="crud_user detail_rating container" vertical>
            <AdminHeader title="Chi tiết đánh giá" icon={<PlusOutlined />} />
            <Card
                title={"Chi tiết đánh giá"}
                bordered={false}
                className="form"
            >
                <Flex justify="center" >
                    <Flex justify="center" >
                        <Form {...formItemLayout} style={{ width: "100%" }}
                            form={form}
                        >
                            <Flex vertical>
                                <Flex gap={"80px"}>

                                    <Flex vertical>
                                        <Form.Item label="Tên khách hàng"
                                            hasFeedback
                                            required
                                            name="name"
                                        >
                                            <Typography.Text >{nameValue}</Typography.Text>
                                        </Form.Item>
                                        <Form.Item label="Số sao"
                                            hasFeedback
                                            required
                                            name="stars"
                                        >
                                            <Rate disabled defaultValue={starsValue} />
                                        </Form.Item>
                                        <Form.Item label="Ngày tạo"
                                            hasFeedback
                                            required
                                            name="createdAt"
                                        >
                                            <Typography.Text >{convertToDate(createdAtValue)}</Typography.Text>
                                        </Form.Item>
                                    </Flex>
                                    <Flex vertical>
                                        <Form.Item label="ID sản phẩm"
                                            hasFeedback
                                            required
                                            name="productId"
                                        >
                                            <Typography.Text >{productIdValue}</Typography.Text>
                                        </Form.Item>
                                        <Form.Item label="Tên sản phẩm"
                                            hasFeedback
                                            required
                                            name="productName"
                                        >
                                            <Typography.Text >{productNameValue}</Typography.Text>
                                        </Form.Item>
                                        <Form.Item label="Hình ảnh sản phẩm"
                                            hasFeedback
                                            required
                                            name="image"
                                        >
                                            <Image src={imageValue} width="100px" height="100px" />
                                        </Form.Item>
                                    </Flex>
                                </Flex>
                                <Flex vertical gap={10} style={{ borderTop: '1px solid #f0f0f0', paddingTop: '20px', marginTop: '20px' }}>
                                    <Form.Item label="Nội dung nhận xét" name="content">
                                        <Typography.Paragraph>{contentValue || "Không có nội dung"}</Typography.Paragraph>
                                    </Form.Item>
                                    <Form.Item label="Hình ảnh khách hàng gửi" name="images">
                                        <Flex gap={10} wrap="wrap">
                                            {imagesValue?.length > 0 ? imagesValue.map((img, idx) => (
                                                <Image key={idx} src={img} width={100} height={100} style={{ objectFit: 'cover', borderRadius: '4px' }} />
                                            )) : <Typography.Text type="secondary">Không có hình ảnh</Typography.Text>}
                                        </Flex>
                                    </Form.Item>
                                </Flex>
                                <Flex vertical gap={10}>
                                    <Form.Item name='isActive' label="Trạng thái" required>
                                        <Switch checkedChildren='Hoạt động' unCheckedChildren="Ngưng hoạt động"
                                            onChange={(e) => mutate({ id: rating_id, isActive: e })}
                                        />
                                    </Form.Item>
                                    <Form.Item label="Phản hồi của cửa hàng" name="reply">
                                        <Input.TextArea rows={4} placeholder="Nhập nội dung phản hồi..." />
                                    </Form.Item>
                                    <Form.Item wrapperCol={{ offset: 6 }}>
                                        <Button type="primary" onClick={() => mutate({ id: rating_id, reply: form.getFieldValue('reply') })}>
                                            Lưu phản hồi
                                        </Button>
                                    </Form.Item>
                                </Flex>
                            </Flex>
                        </Form>
                    </Flex>
                </Flex>
            </Card>
        </Flex >
    );
}