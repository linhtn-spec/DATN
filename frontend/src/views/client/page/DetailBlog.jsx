import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import { Breadcrumb, Button, Divider, Flex, Typography } from 'antd'
import { NavLink } from 'react-router-dom'
import '../style/DetailBlog.css'


export const DetailBlog = () => {
    return (
        <Flex className="detail_blog" vertical align="center">
            <Breadcrumb
                items={[
                    {
                        title: <NavLink to={'/client'}>HOME</NavLink>,
                    },
                    {
                        title: <NavLink to={'/client/user'}>INFORMATION</NavLink>,
                    },
                ]}
            />
            <Flex className="content" vertical>
                <Typography.Title>OVERVIEW OF THE WELCOME EVENT FROM THE WASHINGTON STATE DEPARTMENT OF AGRICULTURE</Typography.Title>
                <Typography.Text>10, March, 2026</Typography.Text>
                <Typography.Paragraph>
                    Ngày 9/4 vừa qua Klever Fruit đã có vinh dự được tiếp đón Bộ nông nghiệp Bang Washington (Mỹ) và trao đổi về phương hướng hợp tác kinh doanh trong tương lai.

                    Washington là vùng đất sở hữu điều kiện thiên nhiên thuận lợi cùng nền nông nghiệp tiên tiến mang đến nhiều loại trái cây tươi ngon và đạt tiêu chuẩn an toàn thực phẩm vượt ngưỡng mong đợi.

                    Theo Giám đốc Tiếp thị Quốc tế của Bộ Nông nghiệp Bang Washington thông tin, Việt Nam là một trong những thị trường xuất khẩu nông sản hàng đầu của tiểu bang. Năm 2023, kim ngạch xuất khẩu từ bang Washington vào Việt Nam đạt 157 triệu USD chủ yếu là nông sản, thực phẩm.

                    Cụ thể trong năm 2023, táo, sản phẩm từ sữa, lúa mì, hải sản, cherry, khoai tây chiên, thịt bò… là những sản phẩm hàng đầu của bang Washington xuất khẩu sang Việt Nam.
                    <br />
                    <img src="/data/blog/blog1.png" alt="blog" width="600px" height="337px" />
                    <br />
                    Klever Fruit là thương hiệu số 1 về chuỗi bán lẻ trái cây nhập khẩu hiện nay trên thị trường Việt Nam. Sau hơn 15 phát triển, đến nay Klever Fruit sở hữu một chuỗi 53 cửa hàng trong đó có 41 cửa hàng tại các địa điểm đắc địa tại trung tâm Hà Nội và 12 cửa hàng tại thành phố HCM.
                    <img src="/data/blog/blog1.png" alt="blog" width="600px" height="337px" />
                    <br />
                    Vùng đất bang Washington tạo nên sự hòa quyện thú vị giữa vẻ ngoài cuốn hút cùng hương vị khó quên, đây chính là bản giao hưởng tuyệt mỹ!
                    Trong sự kiện tiếp đón đoàn bộ nông nghiệp bang Washington vừa qua, Klever Fruit lấy chủ đề “Bản giao hưởng sắc trắng và đỏ - Symphony in white and red” để gợi nhớ về vẻ đẹp thiên nhiên bang Washington, cùng những nông sản thượng hạng tại vùng đất kỳ vĩ này.

                    Và đặc biệt hơn cả là cùng nhau đón chờ mùa cherry Washington sắp tới mang hương vị của một ngày hè ngập nắng!
                </Typography.Paragraph>
                <Divider />
                <Flex align="center">
                    <Flex>
                        <Typography.Text ellipsis={true} style={{ width: "60%", fontSize: "14px" }}>Watching: <Typography.Text style={{ fontSize: "16px", fontWeight: 500 }}>OVERVIEW OF THE WELCOME EVENT FROM THE WASHINGTON STATE DEPARTMENT OF AGRICULTURE</Typography.Text></Typography.Text>
                    </Flex>
                    <Flex align="center" className="nav">
                        <Button type="link" ><LeftOutlined />Previous blog</Button>
                        <hr style={{ border: "1px solid black", height: "10px" }} />
                        <Button type="link">Next blog<RightOutlined /></Button>
                    </Flex>
                </Flex>
            </Flex>
        </Flex>
    )
}
