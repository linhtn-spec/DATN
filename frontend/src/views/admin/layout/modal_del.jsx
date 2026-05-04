import { useMutation } from '@tanstack/react-query';
import { Button, Flex, Modal } from 'antd';
import { useContext } from 'react';
import { TypeDeleteAdmin } from '../../../constants/deleteTypes';
import { queryClient } from '../../../main';
import { deleteBannerList, deleteBannerOne } from '../../../services/banner_service';
import { deleteCategoryList, deleteCategoryOne } from '../../../services/category_service';
import { deleteBlogList, deleteBlogOne } from '../../../services/blog_service';
import { deleteProductList, deleteProductOne } from '../../../services/product_service';
import { deleteSale } from '../../../services/sale_service';
import { ACTION_MODAL } from '../../../store/modal';
import { ModalContext } from '../../../store/modal/provider';
import Notification from '../../../utils/configToastify';
import '../style/modal_del.css';
function DeleteModal(props) {
    const id = props.id_del;
    const type = props.type_del;
    const { state, dispatch } = useContext(ModalContext)
    const isOpen = state?.currentModal
    const onClose = () => {
        dispatch({ type: ACTION_MODAL.CLOSE_MODAL })
    }

    const deleteOneCategory = useMutation({
        mutationFn: (id) => deleteCategoryOne(id),
        onSuccess: () => {
            Notification({ message: "Xóa danh mục thành công!", type: "success" })
            queryClient.invalidateQueries({ queryKey: ['category_admin'] })
        },
        onError: (error) => {
            Notification({ message: error?.response?.data || "Xóa danh mục thất bại!", type: "error" })
        }
    })

    const deleteListCategory = useMutation({
        mutationFn: (id) => deleteCategoryList(id),
        onSuccess: () => {
            Notification({ message: "Xóa các danh mục thành công!", type: "success" })
            queryClient.invalidateQueries({ queryKey: ['category_admin'] })
        },
        onError: (error) => {
            Notification({ message: error?.response?.data || "Xóa các danh mục thất bại!", type: "error" })
        }
    })

    const deleteOneBanner = useMutation({
        mutationFn: (id) => deleteBannerOne(id),
        onSuccess: () => {
            Notification({ message: "Xóa banner thành công!", type: "success" })
            queryClient.invalidateQueries({ queryKey: ['banner_admin'] })
        },
        onError: (error) => {
            Notification({ message: error?.response?.data || "Xóa banner thất bại!", type: "error" })
        }
    })

    const deleteListBanner = useMutation({
        mutationFn: (id) => deleteBannerList(id),
        onSuccess: () => {
            Notification({ message: "Xóa các banner thành công!", type: "success" })
            queryClient.invalidateQueries({ queryKey: ['banner_admin'] })
        },
        onError: (error) => {
            Notification({ message: error?.response?.data || "Xóa các banner thất bại!", type: "error" })
        }
    })

    const deleteOneProduct = useMutation({
        mutationFn: (id) => deleteProductOne(id),
        onSuccess: () => {
            Notification({ message: "Xóa sản phẩm thành công!", type: "success" })
            queryClient.invalidateQueries({ queryKey: ['products_admin'] })
        },
        onError: (error) => {
            Notification({ message: error?.response?.data || "Xóa sản phẩm thất bại!", type: "error" })
        }
    })

    const deleteListProduct = useMutation({
        mutationFn: (id) => deleteProductList(id),
        onSuccess: () => {
            Notification({ message: "Xóa các sản phẩm thành công!", type: "success" })
            queryClient.invalidateQueries({ queryKey: ['products_admin'] })
        },
        onError: (error) => {
            Notification({ message: error?.response?.data || "Xóa các sản phẩm thất bại!", type: "error" })
        }
    })

    const deleteSaleOne = useMutation({
        mutationFn: (id) => deleteSale(id),
        onSuccess: () => {
            Notification({ message: "Xóa khuyến mãi thành công!", type: "success" })
            queryClient.invalidateQueries({ queryKey: ['sales_admin_list'] })
        },
        onError: () => {
            Notification({ message: "Xóa khuyến mãi thất bại!", type: "error" })
        }
    })

    const deleteOneBlog = useMutation({
        mutationFn: (id) => deleteBlogOne(id),
        onSuccess: () => {
            Notification({ message: "Xóa bài viết thành công!", type: "success" })
            queryClient.invalidateQueries({ queryKey: ['blog_admin'] })
        },
        onError: (error) => {
            Notification({ message: error?.response?.data?.message ?? 'Xóa bài viết thất bại!', type: "error" })
        }
    })

    const deleteListBlog = useMutation({
        mutationFn: (id) => deleteBlogList(id),
        onSuccess: () => {
            Notification({ message: "Xóa các bài viết thành công!", type: "success" })
            queryClient.invalidateQueries({ queryKey: ['blog_admin'] })
        },
        onError: (error) => {
            Notification({ message: error?.response?.data?.message ?? 'Xóa các bài viết thất bại!', type: "error" })
        }
    })

    const handleDelete = () => {
        switch (type) {
            case TypeDeleteAdmin.CATEGORY_ONE:
                deleteOneCategory.mutate(id)
                break;
            case TypeDeleteAdmin.CATEGORY_LIST:
                deleteListCategory.mutate(id)
                break;
            case TypeDeleteAdmin.BANNER_ONE:
                deleteOneBanner.mutate(id)
                break;
            case TypeDeleteAdmin.BANNER_LIST:
                deleteListBanner.mutate(id)
                break;
            case TypeDeleteAdmin.PRODUCT_ONE:
                deleteOneProduct.mutate(id)
                break;
            case TypeDeleteAdmin.PRODUCT_LIST:
                deleteListProduct.mutate(id)
                break;
            case TypeDeleteAdmin.SALE:
                deleteSaleOne.mutate(id)
                break;
            case TypeDeleteAdmin.BLOG_ONE:
                deleteOneBlog.mutate(id)
                break;
            case TypeDeleteAdmin.BLOG_LIST:
                deleteListBlog.mutate(id)
                break;
            default:
                break
        }

    }
    return (
        <Modal open={isOpen} closable={false} footer={null} width={500} centered={true} className='deleteModal'>
            <Flex vertical align='center' justify='center' gap={20}>
                <p className='words'>Bạn có muốn XÓA {typeof id !== 'string' ? 'những mục này' : "mục này"} không?</p>
                <Flex gap='large'>
                    <Button htmlType="submit" danger type='primary'
                        onClick={() => { handleDelete(), onClose() }}>Xóa</Button>
                    <Button onClick={onClose}>Hủy</Button>
                </Flex>
            </Flex>
        </Modal >
    );
}
export default DeleteModal;