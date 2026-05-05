import { Flex, Tooltip, Typography } from 'antd';
import '../style/last_view.css';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

function LastView(props) {
    const [mainImage, setMainImage] = useState('')

    const product = props.product;

    useEffect(() => {
        if (!props?.product) return
        setMainImage(props?.product?.mainImage)

    }, [setMainImage, props.product])

    return (
        <Flex className="last_view_item d-flex align-items-center">
            <Link to={`/client/product/${product?.id}`}>
                <img src={mainImage} loading="lazy" />
            </Link>
            <Tooltip title={product?.name}><Typography.Text level={4} ellipsis={true}>{product?.name}</Typography.Text></Tooltip>
        </Flex>
    );
}
export default LastView;