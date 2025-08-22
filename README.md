# Government Schemes Portal

A comprehensive web application for managing and discovering government schemes in India. This platform allows users to browse available schemes, apply for them, and enables administrators to manage scheme submissions and user inquiries.

## 🚀 Features

### For Users
- **Browse Schemes**: Search and filter government schemes by state, ministry, caste, gender, and age
- **Detailed Information**: View comprehensive details about each scheme including benefits, eligibility criteria, and required documents
- **User Registration**: Create accounts to track applications and save favorite schemes
- **Contact Support**: Submit inquiries and get responses from administrators
- **Responsive Design**: Optimized for desktop and mobile devices

### For Administrators
- **Enhanced Dashboard**: Modern, intuitive admin interface with statistics and analytics
- **Scheme Management**: Create, edit, approve, reject, and delete schemes
- **User Management**: Handle user inquiries and provide responses
- **Content Moderation**: Review user-submitted schemes before publication
- **Real-time Statistics**: Track scheme submissions, approvals, and user engagement

## 🛠️ Technology Stack

### Frontend
- **React.js** - Modern JavaScript library for building user interfaces
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Lucide React** - Beautiful icon library
- **React Toastify** - Toast notifications

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database for data storage
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing

## 📁 Project Structure

\`\`\`
government-schemes-portal/
├── client/                 # Frontend React application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── reducers/      # State management
│   │   └── App.js         # Main application component
│   └── package.json       # Frontend dependencies
├── server/                # Backend Node.js application
│   ├── config/           # Configuration files
│   │   ├── keys.js       # Environment-based config
│   │   ├── dev.js        # Development config
│   │   └── prod.js       # Production config
│   ├── middleware/       # Custom middleware
│   │   ├── auth.js       # JWT authentication
│   │   ├── requireSignin.js  # Sign-in requirement
│   │   └── adminOnly.js  # Admin-only access
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   │   ├── auth.js       # Authentication routes
│   │   ├── admin.js      # Admin management routes
│   │   └── schemes.js    # Scheme-related routes
│   ├── index.js          # Server entry point
│   └── package.json      # Backend dependencies
└── README.md             # Project documentation
\`\`\`

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/DrashtiC07/government-schemes-portal.git
   cd government-schemes-portal
   \`\`\`

2. **Install Backend Dependencies**
   \`\`\`bash
   cd server
   npm install
   \`\`\`

3. **Install Frontend Dependencies**
   \`\`\`bash
   cd ../client
   npm install
   \`\`\`

4. **Environment Configuration**
   
   Create configuration files in `server/config/`:
   
   **server/config/dev.js**
   \`\`\`javascript
   module.exports = {
     MONGO_URI: "mongodb://localhost:27017/government-schemes",
     JWT_SECRET: "your-jwt-secret-key-here"
   };
   \`\`\`
   
   **server/config/prod.js**
   \`\`\`javascript
   module.exports = {
     MONGO_URI: process.env.MONGO_URI,
     JWT_SECRET: process.env.JWT_SECRET
   };
   \`\`\`

5. **Start the Development Servers**
   
   **Backend Server** (runs on http://localhost:5000)
   \`\`\`bash
   cd server
   npm start
   # or for development with auto-restart
   npm run dev
   \`\`\`
   
   **Frontend Server** (runs on http://localhost:3000)
   \`\`\`bash
   cd client
   npm start
   \`\`\`

## 🔧 Configuration

### Environment Variables

For production deployment, set the following environment variables:

- `NODE_ENV=production`
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT token generation
- `PORT` - Server port (default: 5000)

### Database Setup

The application uses MongoDB with the following collections:
- `users` - User accounts and authentication
- `schemes` - Government scheme information
- `contacts` - User inquiries and support messages

## 📱 API Endpoints

### Authentication
- `POST /api/signup` - User registration
- `POST /api/signin` - User login
- `POST /api/verify-otp` - OTP verification

### Schemes
- `GET /api/schemes` - Get all approved schemes
- `GET /api/scheme/:id` - Get specific scheme details
- `POST /api/new-scheme` - Submit new scheme (authenticated users)

### Admin Routes
- `GET /api/admin/schemes` - Get all schemes with status filtering
- `PUT /api/admin/schemes/:id/approve` - Approve scheme
- `PUT /api/admin/schemes/:id/reject` - Reject scheme
- `DELETE /api/admin/schemes/:id` - Delete scheme
- `GET /api/admin/contacts` - Get all user inquiries
- `PUT /api/admin/contacts/:id/reply` - Reply to user inquiry

## 🎨 Features Overview

### Enhanced Admin Dashboard
- **Statistics Overview**: Real-time metrics for schemes and user engagement
- **Tabbed Interface**: Organized sections for schemes, messages, and analytics
- **Advanced Filtering**: Search and filter schemes by status, name, or content
- **Bulk Actions**: Efficiently manage multiple schemes
- **Responsive Design**: Works seamlessly on all device sizes

### User Experience
- **Intuitive Navigation**: Easy-to-use interface for browsing schemes
- **Advanced Search**: Filter schemes by multiple criteria
- **Detailed Scheme Pages**: Comprehensive information about each scheme
- **User Authentication**: Secure login and registration system

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Role-based Access**: Different permissions for users and administrators
- **Input Validation**: Server-side validation for all user inputs
- **CORS Protection**: Configured for secure cross-origin requests

## 🚀 Deployment

### Production Deployment

1. **Build the Frontend**
   \`\`\`bash
   cd client
   npm run build
   \`\`\`

2. **Set Environment Variables**
   \`\`\`bash
   export NODE_ENV=production
   export MONGO_URI="your-mongodb-connection-string"
   export JWT_SECRET="your-jwt-secret"
   \`\`\`

3. **Start the Production Server**
   \`\`\`bash
   cd server
   npm start
   \`\`\`

### Docker Deployment (Optional)

Create a `Dockerfile` in the root directory:
\`\`\`dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
\`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Developer**: Drashti C
- **GitHub**: [@DrashtiC07](https://github.com/DrashtiC07)

## 🐛 Bug Reports & Feature Requests

Please use the [GitHub Issues](https://github.com/DrashtiC07/government-schemes-portal/issues) page to report bugs or request new features.

## 📞 Support

For support and questions, please contact:
- Email: [your-email@example.com]
- GitHub Issues: [Project Issues Page](https://github.com/DrashtiC07/government-schemes-portal/issues)

---

**Made with ❤️ for the people of India**
