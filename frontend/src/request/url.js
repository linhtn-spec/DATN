const URL = {
    PRODUCT: {
        CRUD: 'product',
        OPTIONS: 'product/options/all',
        RECOMMEND: 'product/recommend',
        MAY_LIKE: 'product/may_like/test',
        SEARCH: 'search',
        SUGGEST: 'suggest'
    },
    CATEGORY: {
        CRUD: 'category',
        OPTIONS: 'category/options'
    },
    BANNER: {
        CRUD: 'banner',
        OPTIONS: 'banner/options'
    },
    BLOG: {
        CRUD: "blog",
    },
    USER: {
        CRUD: 'users',
        LOGIN: 'login',
        REGISTER: 'register',
        DELETE: "users/delete/",
        DETAIL: "users/detail/",
        UPDATE: "users/update/",
        GET_ME: 'user',
        REFRESH_ACCESS_TOKEN: 'refresh_access_token',
        REFRESH_TOKEN: 'refresh_token',
        LOGOUT: 'logout',
        FORGOT: 'forget-password',
        RESET: 'reset-password',
        LOGIN_GOOGLE: 'login/google/success',
        LOGOUT_GOOGLE: 'logout/google',
        RESET_PASSWORD_CURRENT: 'reset-password-current',
        ALL: "users/options/all",
        CUSTOMERS: "customers"
    },
    ORDER: {
        CRUD: 'order',
        DELETE_LIST: 'order/delete_list',
        OPTIONS: 'order/options',
        BY_USER: "order/user",
        BY_USER_PAGINATE: "order/user/paginate"
    },
    CHAT: {
        CRUD: 'chat',
    },
    UPLOAD: "upload_image",
    PAYMENT: "create_payment_url",
    FAVOURITE: "favourite",
    RATING: {
        CRUD: "rating",
        PRODUCT: 'rating/product'
    },
    COMMENT: {
        CRUD: "comment",
        ALL: "comment/options/all",
        PRODUCT: "comment/product/all",
        PRODUCT_PAGINATE: "comment/product/paginate"
    },
    SALE: {
        CRUD: 'sale',
        LASTEST: 'sale/lastest/products'
    },
    CONSIGNMENT: {
        CRUD: 'consignment'
    },
    STATITICS: {
        COUNT_PRODUCT_CATEGORY: 'count_product_category',
        ORDER: 'count_order',
        TOTAL: "count_statitics",
        ORDER_PER_MONTH: 'order_per_month',
        ORDER_PER_DAY: 'order_per_day',
        UNSOLD: "unsold",
        STATITICS_PER_DAY: 'statitics_perday'
    }
}
export default URL;