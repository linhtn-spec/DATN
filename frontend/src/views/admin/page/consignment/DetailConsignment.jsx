import {
    MinusCircleOutlined,
    PlusOutlined
} from "@ant-design/icons";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import {
    Button,
    ConfigProvider,
    DatePicker,
    Flex,
    Form,
    InputNumber,
    Select,
    Typography
} from 'antd';
import Card from "antd/es/card/Card";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import './DetailConsignment.css';

import locale from 'antd/es/date-picker/locale/vi_VN';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { queryClient } from "../../../../main";
import { addConsignment, detailConsignment, updateConsignment } from "../../../../services/cosignment_service";
import { productAll } from "../../../../services/product_service";
import Notification from "../../../../utils/configToastify";
dayjs.locale('vi')

const formItemLayout = {
    labelCol: {
        xs: { span: 100 },
        sm: { span: 60 },
    },
    wrapperCol: {
        xs: { span: 90 },
        sm: { span: 40 },
    },
};

export function DetailConsignment() {
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const [products, setProducts] = useState([])
    const [condition, setCondition] = useState(false)

    const { consignment_id } = useParams()

    const { mutate } = useMutation({
        mutationFn: (data) => condition ? updateConsignment(data) : addConsignment(data),
        onSuccess: () => {
            Notification({ message: condition ? `Update consignment successfully!` : "Create consignment successfully!", type: "success" })
            queryClient.invalidateQueries({ queryKey: ['ratings_admin_list'] })
            navigate(`/admin/consignment`, { replace: true })
        },
        onError: (error) => {
            Notification({ message: error?.response?.data, type: "error" })
        }
    })

    const queryAllProduct = useQuery({
        queryKey: ['product_all'],
        queryFn: () => productAll(),
        placeholderData: keepPreviousData,
        refetchOnWindowFocus: false
    })


    const queryConsignmentDetail = useQuery({
        queryKey: ['consignment_detail_admin', consignment_id],
        queryFn: () => detailConsignment(consignment_id),
        enabled: !!consignment_id
    })


    useEffect(() => {
        if (!queryConsignmentDetail.isSuccess) return
        const rawData = queryConsignmentDetail.data?.data
        console.log(rawData);
        form.setFieldValue('importDate', dayjs(rawData?.importDate))
        form.setFieldValue('money', rawData?.money)
        form.setFieldValue('products', rawData?.products.map(item => ({
            productId: item?.productId?._id,
            expireDate: dayjs(item?.expireDate),
            importMoney: item?.importMoney,
            quantity: item?.quantity
        })))

    }, [queryConsignmentDetail.isSuccess, queryConsignmentDetail.data, form])

    const onFinish = (value) => {
        mutate({
            ...value, ...(condition ? { id: consignment_id } : {})
        })
    }



    useEffect(() => {
        if (!queryAllProduct.isSuccess) return
        const rawData = queryAllProduct?.data?.data?.data
        setProducts(rawData?.map(item => ({
            value: item?._id,
            label: item?.name
        })))
        return () => {
            setProducts([])
        }
    }, [queryAllProduct.data, queryAllProduct.isSuccess])

    useEffect(() => {
        if (consignment_id) setCondition(true)
        return () => {
            setCondition(false)
        }
    }, [consignment_id])

    return (
        <Flex className="crud_user  container" vertical>
            <h2 className='caption'><PlusOutlined />{condition ? "Update consignment" : "Create consignment"}</h2>
            <Card
                title={condition ? "Update consignment" : "Create consignment"}
                bordered={false}
                className="form"
            >
                <Flex justify="center" >
                    <Form {...formItemLayout} style={{ width: "100%" }}
                        form={form}
                        onFinish={onFinish}
                    >
                        <Flex vertical style={{ width: "100%" }}>
                            <Flex gap={"0px"} style={{ width: "100%" }}>
                                <ConfigProvider locale={locale} width={"40%"}>
                                    <Form.Item
                                        label={"Import date"}
                                        name="importDate"
                                        rules={[
                                            {
                                                required: true,
                                                message: "Please input import date"
                                            }
                                        ]}
                                        style={{ width: "90%" }} required
                                    >
                                        <DatePicker placeholder='Import date'
                                            style={{ width: "80%" }}
                                        />
                                    </Form.Item>
                                </ConfigProvider>
                                <Form.Item
                                    label={"Import money"}
                                    name="money"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please input import date"
                                        }
                                    ]}
                                    style={{ width: "100%" }} required
                                >
                                    <InputNumber min={0} placeholder="Import money" suffix="$" style={{ width: "50%" }} />

                                </Form.Item>
                            </Flex>


                        </Flex>
                        <Flex>
                            <Form.List name="products" rules={[
                                {
                                    required: true,
                                    message: "Please input at least one product"
                                }
                            ]}>
                                {(fields, { add, remove }) =>
                                (<Flex vertical gap={'40px'} style={{ width: "100%" }}>
                                    {fields.map((field, index) => (
                                        <Flex key={field.key} align="center" gap={'20px'}  >
                                            <Typography.Title level={5} style={{ marginBottom: 0, fontWeight: 600, fontSize: '18px' }}>{`Product ${index + 1}`}</Typography.Title>
                                            <Flex vertical style={{ width: "70%" }} gap={"20px"}>
                                                <Flex style={{ width: "100%" }} gap={"16px"} vertical>
                                                    <Form.Item
                                                        name={[field.name, "productId"]}
                                                        fieldId={[field.key, "productId"]}
                                                        label="Product name"
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message: "Please input product name"
                                                            }
                                                        ]}
                                                        style={{ marginBottom: 0, width: "100%" }}                                                    >
                                                        <Select
                                                            virtual={false}

                                                            options={products}
                                                            placeholder={'Product name'}
                                                        />
                                                    </Form.Item>
                                                    <Form.Item
                                                        name={[field.name, "quantity"]}
                                                        fieldId={[field.key, "quantity"]}
                                                        label="Quantity"
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message: "Please input Quantity"
                                                            },
                                                        ]}
                                                        style={{ marginBottom: 0 }}

                                                    >
                                                        <InputNumber min={0} max={100} placeholder="Quantity" step={1} style={{ marginBottom: 0, width: "100%" }} />
                                                    </Form.Item>

                                                    <ConfigProvider locale={locale}>
                                                        <Form.Item
                                                            label={"Expire date"}
                                                            name={[field.name, "expireDate"]}
                                                            fieldId={[field.key, "expireDate"]}
                                                            rules={[
                                                                {
                                                                    required: true,
                                                                    message: "Please input expire date"
                                                                }
                                                            ]}
                                                            style={{ width: "100%", margin: 0 }} required
                                                        >
                                                            <DatePicker placeholder='Expire date'
                                                                style={{ marginBottom: 0, width: "100%" }} />
                                                        </Form.Item>
                                                    </ConfigProvider>
                                                    <Form.Item
                                                        name={[field.name, "importMoney"]}
                                                        fieldId={[field.key, "importMoney"]}
                                                        label="Import money"
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message: "Please input import money"
                                                            },
                                                        ]}
                                                        style={{ marginBottom: 0, width: "100%" }}

                                                    >
                                                        <InputNumber min={0} placeholder="Import money" suffix="$" style={{ marginBottom: 0, width: "100%" }}
                                                        />
                                                    </Form.Item>

                                                </Flex>
                                            </Flex>
                                            <Flex style={{ width: "10%", marginLeft: "70px" }}>
                                                <MinusCircleOutlined style={{ color: 'red' }} onClick={() => remove(field.name)} />
                                            </Flex>
                                        </Flex>
                                    ))}
                                    <Flex>
                                        <Form.Item>
                                            <Button onClick={() => add()}>Add new product </Button>
                                        </Form.Item>
                                    </Flex>
                                </Flex>)
                                }
                            </Form.List>
                        </Flex>
                        <Form.Item>
                            <Flex justify="center" gap={20} className="group_btn">
                                <Button type="primary" htmlType="submit" >
                                    {condition ? "Update" : "Submit"}
                                </Button>
                            </Flex>
                        </Form.Item>
                    </Form>
                </Flex>
            </Card>
        </Flex >
    );
}