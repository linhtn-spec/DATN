import { Breadcrumb, Empty, Flex, Pagination } from 'antd';
import { useContext, useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FavouriteContext } from '../../../store/favourite';
import ProductGrid from '../layout/product_grid';
import '../style/Wishlist.css';

export const Wishlist = () => {
    const [page, setPage] = useState(1);
    const pageSize = 8;
    const { state } = useContext(FavouriteContext)

    const wishlistItems = state?.favourite || [];
    const total = wishlistItems.length;

    const displayItems = useMemo(() => {
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        return wishlistItems.slice(start, end);
    }, [wishlistItems, page]);

    useEffect(() => {
        document.title = "Danh sách yêu thích"
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [])

    return (
        <>
            <Flex className='category_page' vertical>
                <Breadcrumb
                    items={[
                        {
                            title: <NavLink to={'/client'}>TRANG CHỦ</NavLink>,
                        },
                        {
                            title: <NavLink to={`/client/user/wishlist`}>DANH SÁCH YÊU THÍCH</NavLink>,
                        },
                    ]}
                />

                <Flex className="category_pagination" justify="center">
                    <p>Hiển thị <b>{total !== 0 ? (page - 1) * pageSize + 1 : 0}</b> - <b>{Math.min(page * pageSize, total)}</b> trên tổng số <b>{total}</b> kết quả</p>
                </Flex>

                <Flex className="category_items" wrap="wrap" gap="24px" style={{ width: "100%" }}>
                    {displayItems.length !== 0 ? (
                        displayItems.map((item, index) => (
                            <ProductGrid
                                type={'wishlist'}
                                products={{ ...item, id: item?._id || item.id, image: item.images ? item?.images[0] : item.image }}
                                key={item._id || item.id || index}
                            />
                        ))
                    ) : (
                        <Flex justify='center' style={{ width: "100%", padding: "50px 0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Empty description={"Không có sản phẩm nào trong danh sách yêu thích"} />
                        </Flex>
                    )}
                </Flex>

                {total > pageSize && (
                    <Flex justify="center" style={{ marginTop: '40px' }}>
                        <Pagination
                            total={total}
                            pageSize={pageSize}
                            current={page}
                            hideOnSinglePage
                            showSizeChanger={false}
                            onChange={(p) => {
                                setPage(p);
                                window.scrollTo({ top: 400, behavior: 'smooth' });
                            }}
                        />
                    </Flex>
                )}
            </Flex>
        </>
    )
}
