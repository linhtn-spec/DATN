import { Flex, Tooltip, Typography } from 'antd';
import '../style/hot.css';

import { Link } from 'react-router-dom';

function Hot(props) {
    const product = props.product;

    return (
        <Flex className="hot_item d-flex align-items-center">
            <Link to={`/product/${product.product_id}`}>
                <img src="/data/banner/banner-home-1.png" loading="lazy" />
            </Link>
            <Flex vertical>
                <Tooltip>  <Typography.Text level={4} ellipsis={true}>{product.title}</Typography.Text></Tooltip>
                <h5>
                    ${Math.floor(product.price * (1 - parseFloat(product.price_promotion)))}
                    {product.price_promotion === 0 ? "" : <span className="discount">${product.price}</span>}
                </h5>
            </Flex>
        </Flex>
    );
}
export default Hot;