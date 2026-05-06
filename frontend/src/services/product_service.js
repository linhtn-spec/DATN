import api from "../request/api";
import URL from "../request/url";

/** Get paginated product list with optional filters */
export const listProduct = (
    page,
    name,
    origin,
    categoryId,
    sortName,
    sortPrice,
    sortDate,
    start_price,
    end_price,
    limit
) =>
    api.get(URL.PRODUCT.CRUD, {
        params: {
            page,
            limit,
            name,
            origin,
            categoryId,
            sortName,
            sortPrice,
            sortDate,
            start_price,
            end_price,
        },
    });

/** Get a single product by id */
export const detailProduct = (id) => api.get(`${URL.PRODUCT.CRUD}/${id}`);

/** Create a new product */
export const addProduct = (data) => api.post(URL.PRODUCT.CRUD, data);

/** Update a product by id */
export const updateProduct = ({ id, ...data }) =>
    api.put(`${URL.PRODUCT.CRUD}/${id}`, data);

/** Delete a single product by id */
export const deleteProductOne = (id) => api.delete(`${URL.PRODUCT.CRUD}/${id}`);

/** Delete multiple products by id list */
export const deleteProductList = (ids) =>
    api.delete(URL.PRODUCT.CRUD, { data: { product_id: ids } });

/** Get products filtered by category */
export const productByCategory = (categoryId, page, limit = 8) =>
    api.get(URL.PRODUCT.CRUD, { params: { page, limit, categoryId } });

/** Get "you may like" product recommendations */
export const productMayLike = (id) =>
    api.get(URL.PRODUCT.MAY_LIKE, { params: { id } });

/** Get recommended products based on a product id */
export const recommendProduct = (id) =>
    api.get(`${URL.PRODUCT.RECOMMEND}/${id}`);

/** Get all products as options (unpaginated) */
export const productAll = () => api.get(URL.PRODUCT.OPTIONS);

/** Search products by search parameter */
export const searchProduct = (searchParam, page) =>
    api.get(URL.PRODUCT.SEARCH, { params: { searchParam, page } });

/** Get product suggestions as user types */
export const suggestProduct = (keyword) =>
    api.get(URL.PRODUCT.SUGGEST, { params: { keyword } });