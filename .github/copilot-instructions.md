# DATN E-Commerce Copilot Instructions

## Project Overview

**DATN** is a full-stack **e-commerce platform** with role-based access control (RBAC), real-time chat, payment processing, and product search.

- **Frontend**: React 18 + Vite (SPA) — Admin & Customer interfaces
- **Backend**: Express.js + Node.js — REST API with MongoDB + Elasticsearch
- **Database**: MongoDB replica set (3 nodes + arbiter)
- **Search**: Elasticsearch synced via Monstache
- **Real-time**: Socket.IO for chat messaging

## Architecture & Data Flow

```
┌─────────────────────────┐
│   React Frontend        │  (localhost:5173 / port 80)
│  - Admin Dashboard      │  Vite + Ant Design + React Query
│  - Customer Interface   │
└───────────┬─────────────┘
            │ HTTP (axios)
            │ baseURL: localhost:8081/api
            │
┌───────────▼─────────────┐
│  Express Backend        │  (localhost:5000)
│  - REST API             │  Node.js ES modules
│  - Auth (JWT + cookies) │
│  - Socket.IO (chat)     │
│  - File Upload          │
└───────────┬─────────────┘
     ┌──────┴──────┐
     │             │
┌────▼─────┐  ┌───▼─────────┐
│ MongoDB   │  │ Elasticsearch│  (Docker)
│ Replica   │  │ Kibana +    │
│ Set (rs0) │  │ Monstache   │
└──────────┘  └─────────────┘
```

## Critical Patterns

### 1. Role-Based Access Control (RBAC)

**Enum definition** (`server-shop/helper/enum.js`):

```javascript
export const Role = {
  CUSTOMER: 0,
  STAFF: 1,
  MANAGER: 2,
  ADMIN: 3,
};
```

**Middleware pattern** (`server-shop/middleware/check_auth.js`):

```javascript
// First verify JWT from cookies
export const checkAuth = async (req, res, next) => {
  const accessToken = filterXSS(req.cookies.access_token);
  // Verify and attach user to req.user
  jwt.verify(
    accessToken,
    process.env.ACCESS_TOKEN_SECRET,
    async (err, decoded) => {
      // ...validation...
      req.user = userWithoutPassword;
      next();
    }
  );
};

// Then apply role check
export const authRole = (roleAllowed) => {
  return (req, res, next) => {
    if (roleAllowed.includes(req.user.role)) next();
    else res.status(401).json({ message: "You have no permission" });
  };
};
```

**Usage in routes**:

```javascript
// Example from user_router.js
router.get("/users", checkAuth, authRole([3]), paginate_user); // Admin only
```

### 2. Service Pattern (Frontend)

All API calls wrap through service files in `src/services/*_service.js`:

```javascript
// Example: src/services/product_service.js
import api from "../request/api";
import URL from "../request/url";

export const listProduct = (page, name, ...) => api.get(URL.PRODUCT.CRUD, {
  params: { page, name, ... }
})
export const addProduct = (data) => api.post(URL.PRODUCT.CRUD, data)
export const updateProduct = ({ id, ...data }) => api.put(URL.PRODUCT.CRUD + `/${id}`, data)
export const deleteProduct = (id) => api.delete(URL.PRODUCT.CRUD + `/${id}`)
```

**Key points:**

- Always import `api` from `src/request/api.js` (configured with baseURL & credentials)
- Use endpoint constants from `src/request/url.js`, never hardcode URLs
- Follow CRUD naming: `list*/add*/update*/delete*` or `list/detail/add/update/delete`

### 3. State Management (Frontend)

**Context + Reducer pattern** (`src/store/<feature>/`):

```
src/store/cart/
  ├── provider.jsx     (React.createContext + Provider wrapper)
  ├── reducer.js       (State logic, switch cases)
  ├── action.js        (Action creators/dispatchers)
  ├── state.js         (Initial state)
  └── index.js         (Exports: Provider, useContext hook)
```

**Usage**: Wrap routes with providers, then `useContext(CartContext)` in components.

### 4. Request Validation (Backend)

Use `express-validator` with automatic error response:

```javascript
// Example from validator files
export const add_product_validator = [
  body("name").notEmpty().isLength({ min: 3, max: 100 }),
  body("price").isFloat({ min: 0 }),
  // ... more validators
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// In router:
router.post("/product", add_product_validator, add_product_controller);
```

### 5. Database Models (Backend)

**Pattern** (`server-shop/models/*_model.js`):

- All schemas use Mongoose pagination plugin (`mongoose-paginate-v2`)
- Models return serialized responses (exclude passwords/sensitive fields)
- Use aggregation pipeline for complex queries (e.g., stats, lookups)

**Example query** from `statitics_controller.js`:

```javascript
const countProductInEachCategory = await product_model.aggregate([
  {
    $lookup: {
      from: "categories",
      localField: "categoryId",
      foreignField: "_id",
      as: "category",
    },
  },
  { $unwind: "$category" },
  { $group: { _id: "$category._id", totalCount: { $sum: 1 } } },
]);
```

### 6. Response Format (Backend)

**Success** (201 for create, 200 for others):

```javascript
res.status(201).json({
  data: { ...product },
  message: "Product created",
  statusCode: 201,
});
```

**Error**:

```javascript
res.status(400).json({ message: "Invalid input", statusCode: 400 });
```

### 7. API Endpoint Organization

**Frontend** (`src/request/url.js`):

```javascript
const URL = {
  PRODUCT: { CRUD: 'product', OPTIONS: 'product/options/all', RECOMMEND: '...' },
  CATEGORY: { CRUD: 'category', OPTIONS: 'category/options' },
  USER: { CRUD: 'users', LOGIN: 'login', GET_ME: 'user', ... },
  ORDER: { CRUD: 'order', BY_USER: 'order/user', ... },
  // ... other resources
};
```

**Backend** (`server-shop/app.js`):

```javascript
app.use("/api/", router_product);
app.use("/api/", router_category);
app.use("/api/", router_user);
app.use("/api/", router_order);
// ... all routers mounted under /api/
```

### 8. Authentication Flow

1. Frontend submits `login` → Backend validates + creates JWT access token
2. Token stored in `httpOnly` cookie (name: `access_token`)
3. Frontend sends cookie automatically (axios configured with `withCredentials: true`)
4. Backend middleware `checkAuth` verifies JWT from cookie, attaches `req.user`
5. Routes chain `checkAuth` → `authRole([...])` for authorization

**Key env vars**: `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, `WHITE_URL_1`, `WHITE_URL_2` (CORS whitelist)

### 9. File Upload (Images)

- Handled via Cloudinary integration (`server-shop/cloudinary/cloudinary.js`)
- Endpoint: `POST /api/upload_image`
- Multipart form data processed by `multer` middleware in `app.js`
- Returns Cloudinary URL

### 10. Real-Time Chat (Socket.IO)

- Server configured in `server-shop/server.js` with CORS origins
- Events: `setup` (join room), `join chat`, `send message`, `receive message`
- Uses `chat_model.js` to persist messages

## Critical Developer Workflows

### Local Development Setup

```bash
# Backend
cd server-shop
npm install
npm run dev                    # Starts on port 5000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev                    # Starts on port 5173 (Vite)

# Seed database (optional)
cd server-shop
npm run seed                   # Runs seeder.js
```

**Prerequisites**: Node.js 18+, MongoDB running, Elasticsearch (docker-compose up in server-shop)

### Testing

```bash
# Backend unit tests
cd server-shop
npm run unit_test             # Jest with Supertest, --runInBand to prevent DB conflicts

# Frontend linting
cd frontend
npm run lint                  # ESLint checks

# Frontend build
npm run build                 # Vite production build → dist/
```

### Docker Deployment

```bash
docker-compose up -d --build  # From root directory
# Services: frontend (nginx, port 80), backend (express, port 5000), MongoDB, ES, etc.
```

## Key Files to Know

| Purpose         | Path                                      | Role                               |
| --------------- | ----------------------------------------- | ---------------------------------- |
| Auth middleware | `server-shop/middleware/check_auth.js`    | RBAC verification                  |
| Role enum       | `server-shop/helper/enum.js`              | Role constants                     |
| API setup       | `frontend/src/request/api.js`             | Axios instance config              |
| API endpoints   | `frontend/src/request/url.js`             | Centralized URL constants          |
| Routes (FE)     | `frontend/src/routes/route.jsx`           | SPA routing + provider composition |
| Store pattern   | `frontend/src/store/<feature>/`           | State management examples          |
| Services        | `frontend/src/services/*_service.js`      | API wrappers                       |
| Controllers     | `server-shop/controllers/*_controller.js` | Endpoint handlers                  |
| Models          | `server-shop/models/*_model.js`           | Mongoose schemas                   |
| Routers         | `server-shop/router/*_router.js`          | Express routes + middleware        |
| Validators      | `server-shop/validator/*_validator.js`    | Input validation chains            |
| App setup       | `server-shop/app.js`                      | Middleware + router mounting       |
| Server entry    | `server-shop/server.js`                   | HTTP + Socket.IO setup             |

## Common Debugging Tips

| Issue                    | Check                                                             |
| ------------------------ | ----------------------------------------------------------------- |
| 401/403 auth errors      | `checkAuth` middleware, JWT secret in .env, cookie presence       |
| 404 on API calls         | `url.js` path matches backend route, axios baseURL                |
| State not updating       | Provider wrapper in routes, context hook usage                    |
| Socket.IO not connecting | CORS origins in server.js, socket event names match               |
| MongoDB connection fail  | Docker compose running, replica set initialized, URL_DB in .env   |
| Image upload fails       | Cloudinary credentials, multer config in app.js, file size limits |

## Project-Specific Conventions

- **Naming**: `snake_case` for functions/variables, `camelCase` for JSX props
- **File exports**: Controllers/services use named exports; routers use default export
- **Error handling**: Controllers return early with `.json()`, no throw/catch chains
- **Pagination**: Always use `mongoose-paginate-v2`; check `paginate/options.js` for defaults
- **Timestamps**: Use `moment.js` for date formatting
- **Imports**: ES modules (`import`), not CommonJS (`require`)
- **XSS protection**: All inputs filtered via `xss` library in middleware

## Cross-Component Communication

- **Frontend**: Context API for shared state (cart, user, logs); services for API calls
- **Backend**: Req/res cycle; Socket.IO events for real-time updates; Models for data access
- **Frontend ↔ Backend**: JWT (cookies) for auth, JSON request/response bodies
- **MongoDB ↔ Elasticsearch**: Monstache daemon syncs automatically (watch mode)

---

**Need clarification on any pattern?** Refer to the key files listed above or ask for specific examples.
