import { EyeOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Flex, Form, Input, Rate, Table, Typography, Switch } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import convertToDate from '../../../../../functions/convertDate';
import { queryClient } from '../../../../../main';
import { ratingToUser, updateRating } from '../../../../../services/rating_service';
import Notification from '../../../../../utils/configToastify';
import useDebounce from '../../../../../utils/useDebounce';

export const ListOfRatingUser = () => {
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [items, setItems] = useState([]);
    const { user_id } = useParams();
    const navigate = useNavigate();

    const { mutate } = useMutation({
        mutationFn: (data) => updateRating(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ratings_user_list'] });
            Notification({ message: "Cập nhật trạng thái đánh giá thành công", type: 'success' });
        },
        onError: () => {
            Notification({ message: "Cập nhật trạng thái đánh giá thất bại", type: "error" });
        }
    });

    const { data, isSuccess } = useQuery({
        queryKey: ['ratings_user_list', user_id, page],
        queryFn: () => ratingToUser(user_id, page),
        enabled: !!user_id
    });

    useEffect(() => {
        if (!isSuccess) return;
        const rawData = data?.data?.data || data?.data;
        setItems(
            (rawData?.docs || []).map((item) => ({
                key: item?._id,
                productName: item?.productId?.name,
                stars: item?.stars,
                content: item?.content,
                isActive: item?.isActive,
                createdAt: item?.createdAt
            }))
        );
        setTotal(rawData?.totalDocs || 0);
    }, [data, isSuccess]);

    const columns = [
        {
            title: "Sản phẩm",
            dataIndex: 'productName',
            width: 200,
        },
        {
            title: "Nội dung",
            dataIndex: 'content',
            width: 300,
            render: (value) => (
                <div style={{
                    maxWidth: 300,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }} title={value}>
                    {value}
                </div>
            )
        },
        {
            title: "Số sao",
            dataIndex: 'stars',
            width: 150,
            align: "center",
            render: (value) => <Rate defaultValue={value} allowHalf disabled />
        },
        {
            title: "Ngày tạo",
            dataIndex: 'createdAt',
            width: 150,
            align: "center",
            render: (value) => <Typography.Text>{convertToDate(value)}</Typography.Text>
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            width: 100,
            render: (value, row) => <Switch checked={value} onChange={(e) => mutate({ id: row.key, isActive: e })} />
        },
        {
            title: 'Hành động',
            align: "center",
            key: 'x',
            width: 75,
            render: (text, row) => (
                <Button icon={<EyeOutlined />} onClick={() => navigate(`/admin/ratings/${row.key}`)} />
            ),
        },
    ];

    return (
        <Flex vertical gap={"middle"} style={{ padding: '20px' }}>
            <Table
                bordered
                columns={columns}
                dataSource={items}
                rowHoverable
                pagination={{ 
                    hideOnSinglePage: true, 
                    pageSize: 6, 
                    total: total, 
                    current: page,
                    onChange: setPage,
                    showSizeChanger: false 
                }}
            />
        </Flex>
    );
};
