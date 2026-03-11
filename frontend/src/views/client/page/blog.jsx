import "../style/blog.css"
import { Breadcrumb, Flex } from "antd";
import { NavLink } from "react-router-dom";
function Blog_Page() {

    return (
        <Flex className="blog_page container" vertical>
            <Breadcrumb
                items={[
                    {
                        title: <NavLink to={'/client'}>HOME</NavLink>,
                    },
                    {
                        title: <NavLink to={'/client/blog'}>BLOG</NavLink>,
                    },
                ]}
            />
            <Flex className="wrap_blog" vertical>
                <Flex className="item " >
                    <Flex className="img_hover_zoom">
                        <img src="/data/blog/blog1.png" alt="apple1" />
                    </Flex>
                    <Flex className="wrap_info" vertical>
                        <p>2022-12-23 03:12:31</p>
                        <h4>Apple 1</h4>
                        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                    </Flex>
                </Flex>
                <Flex className="item ">
                    <Flex className="img_hover_zoom">
                        <img src="/data/blog/blog1.png" alt="apple1" />
                    </Flex>
                    <Flex className="wrap_info" vertical>
                        <p>2022-12-23 03:12:31</p>
                        <h4>Apple 1</h4>
                        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                    </Flex>
                </Flex>
                <Flex className="item ">
                    <Flex className="img_hover_zoom">
                        <img src="/data/blog/blog1.png" alt="apple1" />
                    </Flex>
                    <Flex className="wrap_info" vertical>
                        <p>2022-12-23 03:12:31</p>
                        <h4>Apple 1</h4>
                        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                    </Flex>
                </Flex>
            </Flex>
        </Flex>
    );
}

export default Blog_Page;