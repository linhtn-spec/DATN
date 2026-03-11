import { useQuery } from '@tanstack/react-query';
import '../style/RecommendProduct.css';
import { productMayLike } from '../../../services/product_service';
import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Skeleton } from 'antd';
export default function RecommendedProduct() {
    const [products, setProducts] = useState([])
    const { data, isSuccess } = useQuery({
        queryKey: ['product_may_like_home'],
        queryFn: () => productMayLike('')
    })
    const [isLoading, setIsLoading] = useState(true)
    useEffect(() => {
        if (!isSuccess) return
        setProducts(data?.data?.data?.map(item => ({
            id: item?._id,
            image: item?.images?.[0]
        })))
        setIsLoading(false)
        return () => {
            setIsLoading(false)
            setProducts([])
        }
    }, [isSuccess, data])

    return (
        <section className="container product-recommend">
            <div className="item-1">
                {isLoading ? (
                    <Skeleton.Image active style={{ width: '100%', height: '500px' }} />
                ) : (
                    products[0] && (
                        <NavLink to={`/client/product/${products[0]?.id}`}>
                            <img src={products[0]?.image} alt={products[0]?.name} />
                        </NavLink>
                    )
                )}
            </div>

            <div className="item-2">
                <div className="item-2_1">
                    {isLoading ? (
                        <Skeleton.Image active style={{ width: '100%', height: '290px' }} />
                    ) : (
                        products[1] && (
                            <NavLink to={`/client/product/${products[1]?.id}`}>
                                <img src={products[1]?.image} alt={products[1]?.name} />
                            </NavLink>
                        )
                    )}
                </div>
                <div className="item-2_2">
                    {isLoading ? (
                        <Skeleton.Image active style={{ width: '100%', height: '190px' }} />
                    ) : (
                        products[2] && (
                            <NavLink to={`/client/product/${products[2]?.id}`}>
                                <img src={products[2]?.image} alt={products[2]?.name} />
                            </NavLink>
                        )
                    )}
                </div>
                <div className="item-2_3">
                    {isLoading ? (
                        <Skeleton.Image active style={{ width: '100%', height: '190px' }} />
                    ) : (
                        products[3] && (
                            <NavLink to={`/client/product/${products[3]?.id}`}>
                                <img src={products[3]?.image} style={{ width: "100%" }} alt={products[3]?.name} />
                            </NavLink>
                        )
                    )}
                </div>
            </div>

            <div className="item-3">
                {isLoading ? (
                    <Skeleton.Image active style={{ width: '100%', height: '500px' }} />
                ) : (
                    products[4] && (
                        <NavLink to={`/client/product/${products[4]?.id}`}>
                            <img src={products[4]?.image} alt={products[4]?.name} />
                        </NavLink>
                    )
                )}
            </div>
        </section>
    )
}
