import { Footer } from "antd/es/layout/layout";
import "./../style/copyright.css";
function Copyright() {
    return (
        <Footer style={{ textAlign: 'center' }} className="wrap-copyright">
            <div>
                © 2026  S-Cart : An organic fruits store.  All rights reserved
            </div>
            <div>
                Powered by Thai Linh
            </div>
            <div>
                <a href="https://github.com/onlyu66/DATN" target="_blank">Link Github</a>
            </div>
        </Footer>
    );
}
export default Copyright;