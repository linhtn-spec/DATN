import { GithubOutlined, HeartFilled } from "@ant-design/icons";
import "./../style/copyright.css";

function Copyright() {
    return (
        <div className="wrap-copyright">
            <div className="copyright-inner">
                <span className="copyright-text">
                    © 2026 <strong>S-Cart</strong> · Cửa hàng trái cây hữu cơ. Tất cả quyền được bảo lưu.
                </span>
                <span className="copyright-divider">·</span>
                <span className="copyright-made">
                    Phát triển với <HeartFilled className="heart-icon" /> bởi <strong>Thái Linh</strong>
                </span>
                <span className="copyright-divider">·</span>
                <a
                    href="https://github.com/linhtn-spec/DATN"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="copyright-link"
                >
                    <GithubOutlined /> GitHub
                </a>
            </div>
        </div>
    );
}

export default Copyright;