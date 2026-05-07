import { createBrowserRouter, Outlet } from "react-router-dom";
import { AuthProvider } from "../components/AuthProvider";
import { ProtectRoute } from "../components/ProtectRoute";
import { LayoutAdmin } from "../layouts/LayoutAdmin";
import { LayoutClient } from "../layouts/LayoutClient";
import { CartProvider } from "../store/cart";
import { FavouriteProvider } from "../store/favourite";
import { ModalProvider } from "../store/modal/provider";
import { OrderProvider } from "../store/order/provider";
import { LastViewProductProvider } from "../store/productLastView";
import { LogProvider } from "../store/typeLog/provider";
import { ROLE } from "../constants/roles";
import { RoleRoute } from "../components/RoleRoute";

// Admin pages
import PageNotFound from "../views/admin/page/404notfound";
import { Overview } from "../views/admin/page/OverviewAdmin";
import { BannerList } from "../views/admin/page/banner/banner-list/Banner";
import CreateBanner from "../views/admin/page/banner/create-banner/CreateBanner";
import UpdateBanner from "../views/admin/page/banner/update-banner/UpdateBanner";
import { CategoryList } from "../views/admin/page/category/category-list/Category";
import CreateCategory from "../views/admin/page/category/create-category/CreateCategory";
import UpdateCategory from "../views/admin/page/category/update-category/UpdateCategory";
import { ManageChat } from "../views/admin/page/chat/ManageChat";
import { SupportChat } from "../views/admin/page/chat/SupportChat";
import { UnifiedChatLayout } from "../views/admin/page/chat/UnifiedChatLayout";
import { DetailConsignment } from "../views/admin/page/consignment/DetailConsignment";
import { ListOfConsignment } from "../views/admin/page/consignment/ListOfConsignment";
import { DetailCustomer } from "../views/admin/page/customer/DetailCustomer";
import { Infomation } from "../views/admin/page/customer/Information";
import { ListOfCustomer } from "../views/admin/page/customer/ListOfCustomer";
import { DetailOrderCustomer } from "../views/admin/page/customer/customer_order/DetailOrderCustomer";
import { ListOfOrderCustomer } from "../views/admin/page/customer/customer_order/ListOfOrderCustomer";
import { DetailOrder } from "../views/admin/page/order/DetailOrder";
import { ListOfOrder } from "../views/admin/page/order/ListOfOrder";
import CreateProduct from "../views/admin/page/product/create-product/CreateProduct";
import { DetailProduct } from "../views/admin/page/product/detail-product/DetailProduct";
import { DetailRating } from "../views/admin/page/product/detail-product/rating/DetailRating";
import { ListOfRating } from "../views/admin/page/product/detail-product/rating/ListOfRating";
import UpdateProduct from "../views/admin/page/product/detail-product/update-product/UpdateProduct";
import { ProductList } from "../views/admin/page/product/product-list/ProductList";
import { DetailSale } from "../views/admin/page/sale/DetailSale";
import { ListOfSale } from "../views/admin/page/sale/ListOfSale";
import { CrudUser } from "../views/admin/page/user/CrudUser";
import { ListOfUser } from "../views/admin/page/user/ListOfUser";
import { ListOfRatingGlobal } from "../views/admin/page/rating/ListOfRatingGlobal";
import { ListOfRatingUser } from "../views/admin/page/customer/rating/ListOfRatingUser";
import { BlogList } from "../views/admin/page/blog/blog-list/Blog";
import CreateBlog from "../views/admin/page/blog/create-blog/CreateBlog";
import UpdateBlog from "../views/admin/page/blog/update-blog/UpdateBlog";
import { ShippingConfig } from "../views/admin/page/shipping/ShippingConfig";
import FinanceDashboard from "../views/admin/page/finance/FinanceDashboard";
import { TaxConfig } from "../views/admin/page/tax/TaxConfig";
import ExpiryAlert from "../views/admin/page/inventory/ExpiryAlert";
import StockAdjustment from "../views/admin/page/inventory/StockAdjustment";

// Auth pages
import Forget from "../views/authentication/forget/forget";
import Login from "../views/authentication/login/login";
import Register from "../views/authentication/register/register";
import Reset from "../views/authentication/reset/reset";
import VerifyEmail from "../views/authentication/verify-email/VerifyEmail";

// Client pages
import { ChangePassword } from "../views/client/page/ChangePassword";
import { DetailUser } from "../views/client/page/DetailUser";
import { OrderDetail } from "../views/client/page/Orders/OrderDetail";
import { OrderList } from "../views/client/page/Orders/OrderList";
import ProductDetail from "../views/client/page/ProductDetail";
import { Wishlist } from "../views/client/page/Wishlist";
import Cart from "../views/client/page/cart";
import Category from "../views/client/page/category";
import Checkout from "../views/client/page/checkout";
import CheckoutConfirm from "../views/client/page/checkout_confirm";
import Home from "../views/client/page/home";
import OrderSuccess from "../views/client/page/order_success";
import Search from "../views/client/page/search";
import Shop from "../views/client/page/shop";
import Sale from "../views/client/page/Sale";

// ---------------------------------------------------------------------------
// Route definitions split by area for easier maintenance
// ---------------------------------------------------------------------------

const authRoutes = [
  {
    path: "/",
    element: (
      <ProtectRoute>
        <LogProvider>
          <Login />
        </LogProvider>
      </ProtectRoute>
    ),
  },
  {
    path: "forget-password",
    element: (
      <ProtectRoute>
        <LogProvider>
          <Forget />
        </LogProvider>
      </ProtectRoute>
    ),
  },
  {
    path: "change-password/:token",
    element: (
      <ProtectRoute>
        <LogProvider>
          <Reset />
        </LogProvider>
      </ProtectRoute>
    ),
  },
  {
    path: "register",
    element: (
      <ProtectRoute>
        <LogProvider>
          <Register />
        </LogProvider>
      </ProtectRoute>
    ),
  },
  {
    path: "verify-email/:token",
    element: (
      <ProtectRoute>
        <LogProvider>
          <VerifyEmail />
        </LogProvider>
      </ProtectRoute>
    ),
  },
];

const adminRoutes = [
  {
    path: "admin",
    element: (
      <ProtectRoute>
        <AuthProvider>
          <ModalProvider>
            <LogProvider>
              <LayoutAdmin />
            </LogProvider>
          </ModalProvider>
        </AuthProvider>
      </ProtectRoute>
    ),
    children: [
      // ── STAFF (1) and above ──────────────────────────────────────────────
      {
        element: <RoleRoute minRole={ROLE.STAFF} />,
        children: [
          {
            path: "orders",
            element: <Outlet />,
            children: [
              { index: true, element: <ListOfOrder /> },
              { path: ":order_id", element: <DetailOrder /> },
            ],
          },
          {
            path: "customers",
            element: <Outlet />,
            children: [
              { index: true, element: <ListOfCustomer /> },
              {
                path: ":user_id",
                element: <Infomation />,
                children: [
                  { index: true, element: <DetailCustomer /> },
                  {
                    path: "orders",
                    element: <Outlet />,
                    children: [
                      { index: true, element: <ListOfOrderCustomer /> },
                      { path: ":order_id", element: <DetailOrderCustomer /> },
                    ],
                  },
                  {
                    path: "ratings",
                    element: <ListOfRatingUser />
                  },
                ],
              },
            ],
          },
          {
            path: "customer-support",
            element: <UnifiedChatLayout />,
            children: [
              { index: true, element: <SupportChat /> },
              { path: ":chat_id", element: <SupportChat /> },
            ],
          },
          {
            path: "category",
            element: <Outlet />,
            children: [
              { index: true, element: <CategoryList /> },
              { path: "create", element: <CreateCategory /> },
              { path: ":category_id", element: <UpdateCategory /> },
            ],
          },
          {
            path: "product",
            element: <Outlet />,
            children: [
              { index: true, element: <ProductList /> },
              { path: "create", element: <CreateProduct /> },
              {
                path: ":product_id",
                element: <DetailProduct />,
                children: [
                  { index: true, element: <UpdateProduct /> },
                  {
                    path: "ratings",
                    element: <Outlet />,
                    children: [
                      { index: true, element: <ListOfRating /> },
                      { path: ":rating_id", element: <DetailRating /> },
                    ],
                  },
                ],
              },
            ],
          },
        ]
      },

      // ── MANAGER (2) and above ────────────────────────────────────────────
      {
        element: <RoleRoute minRole={ROLE.MANAGER} />,
        children: [
          {
            path: "banner",
            element: <Outlet />,
            children: [
              { index: true, element: <BannerList /> },
              { path: "create", element: <CreateBanner /> },
              { path: ":banner_id", element: <UpdateBanner /> },
            ],
          },
          {
            path: "sales",
            element: <Outlet />,
            children: [
              { index: true, element: <ListOfSale /> },
              { path: "create", element: <DetailSale /> },
              { path: ":sale_id", element: <DetailSale /> },
            ],
          },
          {
            path: "consignment",
            element: <Outlet />,
            children: [
              { index: true, element: <ListOfConsignment /> },
              { path: "create", element: <DetailConsignment /> },
              { path: ":consignment_id", element: <DetailConsignment /> },
            ],
          },
          {
            path: "inventory",
            element: <Outlet />,
            children: [
              { path: "expiry", element: <ExpiryAlert /> },
              { path: "adjustment", element: <StockAdjustment /> },
            ],
          },
          {
            path: "users",
            element: <Outlet />,
            children: [
              { index: true, element: <ListOfUser /> },
              { path: "create", element: <CrudUser /> },
              { path: ":user_id", element: <CrudUser /> },
            ],
          },
          {
            path: "blog",
            element: <Outlet />,
            children: [
              { index: true, element: <BlogList /> },
              { path: "create", element: <CreateBlog /> },
              { path: ":blog_id", element: <UpdateBlog /> },
            ],
          },
          {
            path: "shipping",
            element: <ShippingConfig />,
          },
          {
            path: "tax",
            element: <TaxConfig />,
          },
        ]
      },

      // ── ADMIN (3) only ───────────────────────────────────────────────────
      {
        element: <RoleRoute minRole={ROLE.ADMIN} />,
        children: [
          { path: "overview", element: <Overview /> },
          { path: "finance", element: <FinanceDashboard /> },
        ]
      }
    ],
  },
];

const clientRoutes = [
  {
    path: "/client",
    element: (
      <ProtectRoute>
        <AuthProvider>
          <ModalProvider>
            <CartProvider>
              <LogProvider>
                <FavouriteProvider>
                  <LayoutClient />
                </FavouriteProvider>
              </LogProvider>
            </CartProvider>
          </ModalProvider>
        </AuthProvider>
      </ProtectRoute>
    ),
    children: [
      { index: true, element: <Home /> },
      { path: "home", element: <Home /> },
      { path: "search", element: <Search /> },
      { path: "shop", element: <Shop /> },
      { path: "sale", element: <Sale /> },
      { path: "cart", element: <Cart /> },
      { path: "category/:category_id", element: <Category /> },
      {
        path: "product/:id",
        element: (
          <LastViewProductProvider>
            <ProductDetail />
          </LastViewProductProvider>
        ),
      },
      {
        path: "user",
        element: <Outlet />,
        children: [
          { index: true, element: <DetailUser /> },
          { path: "wishlist", element: <Wishlist /> },
          { path: "change-password", element: <ChangePassword /> },
          {
            path: "orders",
            element: <Outlet />,
            children: [
              { index: true, element: <OrderList /> },
              { path: ":order_id", element: <OrderDetail /> },
            ],
          },
        ],
      },
      {
        path: "checkout",
        element: <Outlet />,
        children: [
          {
            index: true,
            element: (
              <OrderProvider>
                <Checkout />
              </OrderProvider>
            ),
          },
          {
            path: "confirm",
            element: (
              <OrderProvider>
                <CheckoutConfirm />
              </OrderProvider>
            ),
          },
          { path: "success", element: <OrderSuccess /> },
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------------------

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Outlet />,
    children: [
      ...authRoutes,
      ...adminRoutes,
      ...clientRoutes,
      { path: "*", element: <PageNotFound /> },
    ]
  }
]);
