import Table from 'react-bootstrap/Table';
import "./../style/cart_list.css";
import { MenuUnfoldOutlined } from '@ant-design/icons';
import { Button } from 'react-bootstrap';
import { useState } from 'react';
import checkParent from '../../../functions/checkboxAll';
function Cart_List() {
    const [checkStatus, setCheckStatus] = useState(false);


    return (
        <div className="container cart_list">
            <h2 className='caption'><MenuUnfoldOutlined style={{ fontWeight: "700" }} />Danh sách giỏ hàng</h2>
            <Table bordered hover>
                <thead>
                    <tr>
                        <th colSpan={2} className='wrap_delete'>
                            <div className='d-flex'>
                                <div className='wrap' onClick={checkParent}>
                                    <div className='wrap_parent d-flex align-items-center'>
                                        <input type='checkbox' className='parent' style={{ zIndex: "-1" }} />
                                    </div>
                                </div>
                                <div className="del">
                                    <Button variant='danger'><i className="bi bi-trash-fill"></i></Button>
                                </div>
                            </div>
                        </th>
                        <th colSpan={8} className='wrap_insert'>
                            <Button variant='success'><i className="bi bi-plus-lg"></i></Button>
                        </th>
                    </tr>
                    <tr>
                        <th></th>
                        <th>ID</th>
                        <th>Tên</th>
                        <th>Sản phẩm</th>
                        <th>Trạng thái</th>
                        <th>Ngày tạo</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><input type='checkbox' className='child' /></td>
                        <td>1</td>
                        <td>Otto</td>
                        <td>@mdo</td>
                        <td>@mdo</td>
                        <td>1</td>
                        <td>
                            <Button variant='danger'><i className="bi bi-trash-fill"></i></Button>
                            <Button variant='warning'><i className="bi bi-pencil-square"></i></Button>
                            <Button variant='secondary'><i className="bi bi-file-earmark-minus-fill"></i></Button>
                        </td>
                    </tr>
                    <tr>
                        <td><input type='checkbox' className='child' /></td>
                        <td>1</td>
                        <td>Otto</td>
                        <td>@mdo</td>
                        <td><div className='status_cart'>BẬT</div></td>
                        <td>Mark</td>
                        <td>
                            <Button variant='danger'><i className="bi bi-trash-fill"></i></Button>
                            <Button variant='warning'><i className="bi bi-pencil-square"></i></Button>
                            <Button variant='secondary'><i className="bi bi-file-earmark-minus-fill"></i></Button>
                        </td>
                    </tr>
                </tbody>
            </Table>
        </div>
    );
}

export default Cart_List;
