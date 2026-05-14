import { LeftOutlined, UserOutlined, CalendarOutlined, FacebookFilled, XOutlined } from '@ant-design/icons'
import { Breadcrumb, Divider, Flex, Typography, Spin } from 'antd'
import { NavLink, useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { detailBlog } from '../../../services/blog_service'
import '../style/DetailBlog.css'


export const DetailBlog = () => {
    const { id } = useParams();
    const { data, isLoading, isError } = useQuery({
        queryKey: ['blog_detail_client', id],
        queryFn: () => detailBlog(id),
        enabled: !!id
    });

    const blog = data?.data;

    const handleShareFacebook = () => {
        const url = encodeURIComponent(window.location.href);
        const quote = encodeURIComponent(blog?.title || '');
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`, '_blank');
    };

    const handleShareX = () => {
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent(blog?.title || '');
        window.open(`https://x.com/intent/tweet?url=${url}&text=${text}`, '_blank');
    };

    if (isLoading) {
        return (
            <Flex align="center" justify="center" style={{ minHeight: '80vh', backgroundColor: 'var(--bg-color)' }}>
                <Spin size="large" tip="Đang tải nội dung bài viết..." />
            </Flex>
        );
    }

    if (isError || !blog) {
        return (
            <Flex align="center" justify="center" style={{ minHeight: '80vh', backgroundColor: 'var(--bg-color)' }}>
                <Typography.Title level={4}>Không tìm thấy bài viết!</Typography.Title>
            </Flex>
        );
    }

    // Truncate content for meta description
    const plainText = blog.content.replace(/<[^>]*>?/gm, '');
    const metaDescription = plainText.substring(0, 150) + '...';

    return (
        <Flex className="detail_blog" vertical>
            <Helmet>
                <title>{blog.title} | Klever Fruit</title>
                <meta name="description" content={metaDescription} />
                <meta property="og:title" content={blog.title} />
                <meta property="og:description" content={metaDescription} />
                <meta property="og:image" content={blog.image} />
                <meta property="og:url" content={window.location.href} />
                <meta property="og:type" content="article" />
            </Helmet>

            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <Breadcrumb
                    items={[
                        { title: <NavLink to={'/client/home'}>TRANG CHỦ</NavLink> },
                        { title: <NavLink to={'/client/blog'}>BÀI VIẾT</NavLink> },
                        { title: blog.title },
                    ]}
                />

                <Link to="/client/blog" className="nav-back">
                    <LeftOutlined /> Quay lại danh sách
                </Link>

                <article className="content">
                    <Typography.Title level={1}>{blog.title}</Typography.Title>
                    
                    <div className="meta">
                        <div className="meta-item">
                            <CalendarOutlined /> {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                        <div className="meta-item">
                            <UserOutlined /> {blog.user ? `${blog.user.firstName} ${blog.user.lastName}` : 'Ban biên tập'}
                        </div>
                    </div>
                    
                    {blog.image && (
                        <img 
                            src={blog.image} 
                            alt={blog.title} 
                            className="main-image"
                        />
                    )}

                    <div 
                        className="blog-content-html"
                        dangerouslySetInnerHTML={{ __html: blog.content }}
                    />
                    
                    <Divider />
                    
                    <Flex align="center" justify="space-between">
                        <Typography.Text type="secondary">
                            Cảm ơn bạn đã đọc bài viết này.
                        </Typography.Text>
                        <Flex gap={16} align="center">
                            <Typography.Text strong>Chia sẻ bài viết:</Typography.Text>
                            <Typography.Link onClick={handleShareFacebook} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FacebookFilled style={{ fontSize: '18px', color: '#1877F2' }} /> Facebook
                            </Typography.Link>
                            <Typography.Link onClick={handleShareX} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <XOutlined style={{ fontSize: '18px', color: '#000000' }} /> X
                            </Typography.Link>
                        </Flex>
                    </Flex>
                </article>
            </div>
        </Flex>
    )
}
