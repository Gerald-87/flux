# Flux POS Backend API

A comprehensive Node.js + Express + TypeScript backend for the Flux POS system with MySQL database and Prisma ORM.

## 🚀 Features

- **Multi-tenant Architecture**: Support for multiple vendors with data isolation
- **Role-based Access Control**: Superadmin, Vendor, and Cashier roles
- **Time-based Cashier Access**: Work schedule enforcement for cashiers
- **Complete POS Operations**: Sales, inventory, customers, suppliers, purchases
- **Real-time Stock Management**: Automatic stock updates and movement tracking
- **Comprehensive Analytics**: Sales reports, inventory analytics, profit calculations
- **Loyalty Program**: Customer points and rewards system
- **Receipt Management**: Complete receipt data storage and retrieval
- **Audit Trail**: Full system activity logging
- **Notification System**: Low stock alerts and system notifications

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MySQL 8.0+
- **ORM**: Prisma
- **Authentication**: JWT tokens
- **Password Hashing**: MD5 (as requested)
- **Validation**: express-validator
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate limiting

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/     # Route handlers and business logic
│   ├── middleware/      # Authentication, validation, error handling
│   ├── routes/          # API endpoint definitions
│   ├── utils/           # Helper functions and utilities
│   └── server.ts        # Main application entry point
├── prisma/
│   └── schema.prisma    # Database schema definition
├── logs/                # Application logs
├── uploads/             # File upload storage
└── package.json
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+ installed
- MySQL 8.0+ running
- Git

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Database Setup
```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE flux_pos;
exit

# Configure environment variables
cp .env.example .env
# Edit .env with your database credentials
```

### 3. Database Migration
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with demo data (optional)
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## 🔑 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | MySQL connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT expiration time | 24h |
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment mode | development |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:5173 |

## 📚 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Vendor registration
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Users & Cashiers
- `GET /api/users` - List users
- `POST /api/users` - Create cashier
- `PUT /api/users/:id` - Update user
- `PUT /api/users/:id/schedule` - Update cashier schedule
- `DELETE /api/users/:id` - Delete user

### Products & Inventory
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `PUT /api/products/:id/stock` - Update stock
- `GET /api/products/low-stock` - Low stock alerts
- `DELETE /api/products/:id` - Delete product

### Sales & Transactions
- `GET /api/sales` - List sales
- `POST /api/sales` - Create sale (POS)
- `GET /api/sales/:id` - Get sale details
- `GET /api/sales/:id/receipt` - Get receipt data
- `PUT /api/sales/:id/refund` - Process refund
- `GET /api/sales/analytics` - Sales analytics

### Customers
- `GET /api/customers` - List customers
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `GET /api/customers/:id/sales` - Customer sales history
- `DELETE /api/customers/:id` - Delete customer

### Suppliers & Purchases
- `GET /api/suppliers` - List suppliers
- `POST /api/suppliers` - Create supplier
- `GET /api/purchases` - List purchase orders
- `POST /api/purchases` - Create purchase order
- `PUT /api/purchases/:id/complete` - Complete purchase

### Stock Management
- `GET /api/stock/movements` - Stock movement history
- `POST /api/stock/movements` - Create stock movement
- `GET /api/stock/takes` - List stock takes
- `POST /api/stock/takes` - Create stock take
- `PUT /api/stock/takes/:id/complete` - Complete stock take

### Notifications & Reports
- `GET /api/notifications` - List notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `GET /api/reports` - List reports
- `POST /api/reports/generate` - Generate report

## 🔐 Authentication & Authorization

### JWT Authentication
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Role-based Access
- **Superadmin**: Full system access
- **Vendor**: Access to own business data
- **Cashier**: Limited POS and assigned inventory access

### Time-based Access (Cashiers)
Cashiers with work schedules are automatically restricted to their assigned work hours and days.

## 🗄️ Database Schema

The system uses a comprehensive MySQL schema with:
- **25+ tables** covering all POS operations
- **Multi-tenant design** with vendor isolation
- **Automatic triggers** for stock calculations
- **Audit trails** for all operations
- **Optimized indexes** for performance

Key entities:
- Vendors & Settings
- Users & Cashier Schedules
- Products & Variants
- Stock Locations & Movements
- Sales & Sale Items
- Customers & Loyalty
- Suppliers & Purchases
- Notifications & Reports

## 📊 Demo Data

Run the seed script to populate with demo data:
```bash
npm run db:seed
```

**Demo Accounts:**
- Vendor: `vendor@demo.com` / `password123`
- Cashier 1: `cashier1@demo.com` / `cashier123`
- Cashier 2: `cashier2@demo.com` / `cashier123`

**Sample Data:**
- 50 Products across multiple categories
- 25 Customers with loyalty points
- 30 Sales transactions
- 10 Purchase orders
- 2 Suppliers
- Stock movements and locations

## 🚦 Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed demo data
```

## 📝 Logging

The application uses Winston for structured logging:
- **Console logs** in development
- **File logs** in production (`logs/` directory)
- **Error tracking** with stack traces
- **Request logging** for all API calls

## 🔒 Security Features

- **Helmet.js** for security headers
- **CORS** configuration for cross-origin requests
- **Rate limiting** to prevent abuse
- **Input validation** with express-validator
- **SQL injection protection** via Prisma ORM
- **JWT token expiration** and validation
- **Role-based route protection**

## 🚀 Production Deployment

1. **Environment Setup**
   ```bash
   NODE_ENV=production
   DATABASE_URL=<production-mysql-url>
   JWT_SECRET=<strong-secret-key>
   ```

2. **Build Application**
   ```bash
   npm run build
   ```

3. **Database Migration**
   ```bash
   npm run db:migrate
   ```

4. **Start Server**
   ```bash
   npm start
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the API documentation
- Review the database schema
- Examine the demo data structure
- Test with provided demo accounts
