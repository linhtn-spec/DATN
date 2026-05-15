import "./../style/footer.css";
function Footers() {

    return (
        <div className="wrap-footer">
            <footer className="footer container">
                <div>
                    <img src="/data/logo/scart-mid.png" alt="logo" width={240} height={120} />
                    <p>S-Cart: Cửa hàng trái cây hữu cơ</p>
                    <hr></hr>
                </div>
                <div>
                    <h3>Về chúng tôi</h3>
                    <p>Địa chỉ: Cầu Giấy, Hà Nội</p>
                    <p>Hotline: 0362253173</p>
                    <p>Email: s-cart@ecommerce.com</p>
                </div>
                <div>
                    <h3>Dịch vụ</h3>
                    <p>Chính sách bảo mật</p>
                    <p>Điều khoản & Điều kiện</p>
                    <p>Thanh toán</p>
                </div>
                <div>
                    <h3>Hỗ trợ</h3>
                    <p>Hướng dẫn mua hàng</p>
                    <p>Câu hỏi thường gặp</p>
                    <p>S-cart là gì?</p>
                </div>
            </footer>
        </div>
    );
}
export default Footers;