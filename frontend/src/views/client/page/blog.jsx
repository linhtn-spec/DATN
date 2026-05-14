import "../style/blog.css"
import { Breadcrumb, Flex, Spin, Typography, Empty } from "antd";
import { NavLink, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listBlog } from "../../../services/blog_service";
import { CalendarOutlined } from "@ant-design/icons";

function Blog_Page() {
    const { data, isLoading } = useQuery({
        queryKey: ['blogs_client'],
        queryFn: () => listBlog(1, '', 'true', '', '')
    });

    const blogs = data?.data?.docs || [];

    if (isLoading) {
        return (
            <Flex align="center" justify="center" style={{ minHeight: '80vh' }}>
                <Spin size="large" tip="Đang tải bài viết..." />
            </Flex>
        );
    }

    return (
        <Flex className="blog_page" vertical>
            <div className="container">
                <Flex vertical align="center" style={{ marginBottom: '40px' }}>
                    <Breadcrumb
                        items={[
                            { title: <NavLink to={'/client/home'}>TRANG CHỦ</NavLink> },
                            { title: <NavLink to={'/client/blog'}>BÀI VIẾT</NavLink> },
                        ]}
                    />
                    
                    <div className="blog-header" style={{ textAlign: 'center', marginTop: '30px' }}>
                        <Typography.Title level={1} style={{ margin: '0 0 10px 0', fontSize: '40px', fontWeight: 800 }}>Mời bạn xem bài viết mới nhất</Typography.Title>
                        <Typography.Text type="secondary" style={{ fontSize: '18px', display: 'block' }}>Cập nhật các kiến thức về sức khỏe và lối sống sạch từ chuyên gia</Typography.Text>
                    </div>
                </Flex>

                    <div className="wrap_blog">
                        {blogs.length > 0 ? (
                            blogs.map((item, index) => {
                                const isFeatured = index === 0;
                                return (
                                    <Link 
                                        key={item._id} 
                                        to={`/client/blog/${item._id}`} 
                                        className={`item ${isFeatured ? 'featured-item' : 'grid-item'}`}
                                    >
                                        <div className="img_hover_zoom">
                                            <img 
                                                src={item.image || "/data/blog/blog1.png"} 
                                                alt={item.title} 
                                            />
                                        </div>
                                        <div className="wrap_info">
                                            <div className="date">
                                                <CalendarOutlined /> {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                                            </div>
                                            {isFeatured ? (
                                                <Typography.Title level={2}>{item.title}</Typography.Title>
                                            ) : (
                                                <Typography.Title level={4}>{item.title}</Typography.Title>
                                            )}
                                            <div 
                                                className="summary"
                                                style={{ 
                                                    display: '-webkit-box', 
                                                    WebkitLineClamp: isFeatured ? 4 : 3, 
                                                    WebkitBoxOrient: 'vertical', 
                                                    overflow: 'hidden'
                                                }}
                                                dangerouslySetInnerHTML={{ __html: item.content }}
                                            />
                                            <Typography.Text strong style={{ color: 'var(--primary-color)' }}>Xem thêm →</Typography.Text>
                                        </div>
                                    </Link>
                                );
                            })
                        ) : (
                            <Empty description="Không có bài viết nào" />
                        )}
                    </div>
            </div>
        </Flex>
    );
}

export default Blog_Page;