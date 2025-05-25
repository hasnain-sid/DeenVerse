# DeenVerse - Hadith Of The Day

![DeenVerse Logo](https://deen-verse-front.vercel.app/logo.png)

DeenVerse is a web application that delivers a daily Hadith (sayings and teachings of Prophet Muhammad ﷺ) with features for sharing, saving, and interacting with Islamic content. The application uses React for the frontend and Node.js/Express for the backend.

## 🌐 Live Demo

The application is deployed and can be accessed at:  
[https://deen-verse-front.vercel.app/](https://deen-verse-front.vercel.app/)

## ✨ Features

- 📜 Display a random Hadith each day
- ❤️ Like, bookmark, and share Hadiths
- 🖼️ Toggle fullscreen mode for better reading
- 🌍 View Hadith in multiple languages
- 💾 Download the Hadith as an image
- 👥 User profiles with follow/unfollow functionality
- 🔒 Secure authentication system

## 🛠️ Tech Stack

### Frontend
- React.js
- Redux for state management
- @material-tailwind/react components
- Axios for API requests
- html-to-image & downloadjs for image export

### Backend
- Node.js
- Express.js
- MongoDB
- JWT for authentication

## 🚀 Getting Started

### Prerequisites

- Node.js (v14+) and npm installed
- MongoDB instance (local or Atlas)
- Git

### Backend Setup

1. Clone the repository:
   ```sh
   git clone https://github.com/hasnain-sid/DeenVerse.git
   cd DeenVerse/backend
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=8081
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   ```

4. Configure CORS in `index.js`:
   ```javascript
   const corsOptions = {
     origin: 'http://localhost:3000', // Your frontend URL
     credentials: true,
   };
   app.use(cors(corsOptions));
   ```

5. Start the backend server:
   ```sh
   npm start
   # or with nodemon
   nodemon index.js
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```sh
   cd ../frontend
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Update `constant.js` to point to your backend:
   ```javascript
   export const USER_API_END_POINT = "http://localhost:8081/api/v1/user"
   ```

4. Start the frontend server:
   ```sh
   npm start
   ```

5. Open your browser and navigate to `http://localhost:3000`

## 📱 Application Structure

```
DeenVerse/
├── backend/               # Backend codebase
│   ├── controller/        # API route controllers
│   ├── middlewares/       # Express middlewares
│   ├── models/            # MongoDB models
│   ├── routes/            # API route definitions
│   ├── services/          # Business logic
│   ├── utils/             # Helper functions
│   └── index.js           # Entry point
│
└── frontend/              # Frontend codebase
    ├── public/            # Static files
    └── src/
        ├── components/    # React components
        ├── pages/         # Page components
        ├── redux/         # Redux store setup
        ├── services/      # API service functions
        ├── utils/         # Helper functions
        └── App.js         # Root component
```

## 🧪 API Endpoints

### User Authentication
- `POST /api/v1/user/register` - Register a new user
- `POST /api/v1/user/login` - Login user
- `GET /api/v1/user/logout` - Logout user

### User Interactions
- `POST /api/v1/user/follow` - Follow a user
- `POST /api/v1/user/unfollow` - Unfollow a user
- `GET /api/v1/user/profile/:id` - Get user profile
- `GET /api/v1/user/others` - Get other users' profiles
- `POST /api/v1/user/saved/:id` - Save/unsave content

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Open a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👏 Acknowledgements

- [Material Tailwind](https://www.material-tailwind.com/)
- [React Icons](https://react-icons.github.io/react-icons/)
- [React Hot Toast](https://react-hot-toast.com/)



