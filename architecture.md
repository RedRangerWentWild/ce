# CredEat Architecture Plan

## 1. Database Schema (MongoDB)

### Users Collection
- `_id`: ObjectId
- `email`: String (Unique)
- `password_hash`: String
- `full_name`: String
- `role`: String ("student", "vendor", "admin")
- `wallet_balance`: Float (Default: 0.0)
- `created_at`: DateTime

### Meals Collection
- `_id`: ObjectId
- `date`: String (YYYY-MM-DD)
- `type`: String ("breakfast", "lunch", "dinner")
- `menu_items`: List[String]
- `price`: Float (Credit value if skipped)
- `is_active`: Boolean
- `created_at`: DateTime

### MealSelections Collection
- `_id`: ObjectId
- `user_id`: ObjectId (Ref: Users)
- `meal_id`: ObjectId (Ref: Meals)
- `status`: String ("attending", "skipped")
- `timestamp`: DateTime

### Transactions Collection
- `_id`: ObjectId
- `sender_id`: ObjectId (Ref: Users)
- `receiver_id`: ObjectId (Ref: Users, Optional for system credits)
- `amount`: Float
- `type`: String ("skip_credit", "vendor_payment", "admin_adjustment")
- `description`: String
- `timestamp`: DateTime

### Complaints Collection
- `_id`: ObjectId
- `user_id`: ObjectId (Ref: Users)
- `category`: String ("hygiene", "quality", "other")
- `description`: String
- `image_url`: String (Optional)
- `status`: String ("pending", "resolved")
- `created_at`: DateTime

## 2. Backend API Structure (FastAPI)

### Auth (`/api/auth`)
- `POST /register`: Create new user
- `POST /login`: Get JWT token
- `GET /me`: Get current user profile

### Meals (`/api/meals`)
- `GET /`: Get upcoming meals (with user selection status)
- `POST /`: Create meal (Admin only)
- `POST /{meal_id}/select`: Mark as attending or skipped (Student only)
    - *Logic:* If skipped, credit user wallet. If changed back to attending, deduct credits.

### Wallet (`/api/wallet`)
- `GET /`: Get balance and transaction history
- `POST /transfer`: Transfer credits to vendor (Student -> Vendor)

### Complaints (`/api/complaints`)
- `POST /`: Submit complaint (with image upload)
- `GET /`: List complaints (Admin/Vendor view)
- `PATCH /{id}/resolve`: Mark as resolved

### Analytics (`/api/analytics`)
- `GET /wastage`: Get wastage stats (Admin only)

## 3. Frontend Architecture (React)

### Contexts
- `AuthContext`: Manage user session and role.
- `ToastContext`: Global notifications (Sonner).

### Pages
- **Public:**
    - `Login`: Email/Password form.
    - `Register`: Role selection (for demo purposes).
- **Student:**
    - `Dashboard`: Weekly meal view, Toggle Skip/Eat.
    - `Wallet`: Balance card, Transaction list, Pay Vendor button.
    - `Complaints`: Form to submit issues.
- **Vendor:**
    - `Dashboard`: QR Code (static for MVP), Transaction Ledger, Total Earnings.
- **Admin:**
    - `Dashboard`: Wastage charts, Meal management, Complaint resolution.

### Components (Shadcn)
- `Card`: For dashboard widgets.
- `Button`: Primary actions.
- `Dialog`: For payment confirmation and forms.
- `Table`: For transaction history.
- `Tabs`: To switch between views.
- `Badge`: For status indicators.
