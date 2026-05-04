import {
    PlusOutlined
} from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
    Flex,
    Form,
    Image,
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

    const { rating_id, product_id } = useParams()


    const { data, isSuccess } = useQuery({
        queryKey: ['detail_rating_admin', rating_id],
        queryFn: () => detailRating(rating_id),
        enabled: !!rating_id
    })

    const { mutate } = useMutation({
        mutationFn: (data) => updateRating(data),
        onSuccess: () => {
            Notification({ message: "Update status of rating successfully!", type: "success" })
            queryClient.invalidateQueries({ queryKey: ['ratings_admin_list'] })
            queryClient.invalidateQueries({ queryKey: ['ratings_global_list'] })
            if (product_id) {
                navigate(`/admin/product/${product_id}/ratings`, { replace: true })
            } else {
                navigate(`/admin/ratings`, { replace: true })
            }
        },
        onError: () => {
            Notification({ message: "Update status of rating unsuccessfully!", type: "error" })
        }
    })

    useEffect(() => {
        if (!isSuccess) return
        const rawData = data?.data
        console.log(rawData);
        form.setFieldValue('productId', rawData?.productId?._id)
        form.setFieldValue('stars', rawData?.stars)
        form.setFieldValue('createdAt', rawData?.createdAt)
        form.setFieldValue('name', rawData?.userId.firstName + " " + rawData?.userId.lastName)
        form.setFieldValue('productName', rawData?.productId?.name)
        form.setFieldValue('image', rawData?.productId?.images[0])
        form.setFieldValue('isActive', rawData?.isActive)


    }, [isSuccess, data, form])

    return (
        <Flex className="crud_user detail_rating container" vertical>
            <h2 className='caption'><PlusOutlined />{"Detail rating"}</h2>
            <Card
                title={"Detail rating"}
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
                                        <Form.Item label="Customer name"
                                            hasFeedback
                                            required
                                            name="name"
                                        >
                                            <Typography.Text >{nameValue}</Typography.Text>
                                        </Form.Item>
                                        <Form.Item label="Stars"
                                            hasFeedback
                                            required
                                            name="stars"
                                        >
                                            <Rate disabled defaultValue={starsValue} />
                                        </Form.Item>
                                        <Form.Item label="Created at"
                                            hasFeedback
                                            required
                                            name="createdAt"
                                        >
                                            <Typography.Text >{convertToDate(createdAtValue)}</Typography.Text>
                                        </Form.Item>
                                    </Flex>
                                    <Flex vertical>
                                        <Form.Item label="Product ID"
                                            hasFeedback
                                            required
                                            name="productId"
                                        >
                                            <Typography.Text >{productIdValue}</Typography.Text>
                                        </Form.Item>
                                        <Form.Item label="Product name"
                                            hasFeedback
                                            required
                                            name="productName"
                                        >
                                            <Typography.Text >{productNameValue}</Typography.Text>
                                        </Form.Item>
                                        <Form.Item label="Product image"
                                            hasFeedback
                                            required
                                            name="image"
                                        >
                                            <Image src={imageValue} width="100px" height="100px" />
                                        </Form.Item>
                                    </Flex>
                                </Flex>
                                <Flex gap={10}>
                                    <Form.Item name='isActive' label="Status" required>
                                        <Switch checkedChildren='Active' unCheckedChildren="Deactive"
                                            onChange={(e) => mutate({ id: rating_id, isActive: e })}
                                        />
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