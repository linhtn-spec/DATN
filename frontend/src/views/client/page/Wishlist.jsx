import { Breadcrumb, Flex, Pagination, Empty } from 'antd'
import { NavLink } from 'react-router-dom'
import ProductGrid from '../layout/product_grid'
import { useContext, useEffect, useState } from 'react';
import '../style/Wishlist.css'
import { FavouriteContext } from '../../../store/favourite';
import { useQuery } from '@tanstack/react-query';
import { getFavourite } from '../../../services/favourite_service';

export const Wishlist = () => {
    const [page, setPage] = useState(1);
    const { dispatch, state } = useContext(FavouriteContext)

    useEffect(() => {
        document.title = "Wishlist"
    }, [])
    return (
        <Flex className='wishlist' vertical justify='center'>
            <Breadcrumb
                items={[
                    {
                        title: <NavLink to={'/'}>HOME</NavLink>,
                    },
                    {
                        title: <NavLink to={`/user/wishlist`}>WISHLIST</NavLink>,
                    },
                ]}
            />
            <div className="wishlist_item">
                {state?.favourite && state?.favourite.length !== 0 ? (
                    state?.favourite.map((item, index) => (
                        <ProductGrid type={'wishlist'} products={{ ...item, id: item?._id, image: item.images ? item?.images[0] : item.image }} key={index} />
                    ))
                ) : (
                    <Flex justify='center' style={{ width: "100%" }}>
                        <Empty description={"No product in wishlist"} />
                    </Flex>

                )}
            </div>
        </Flex>
    )
}
