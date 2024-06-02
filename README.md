
```markdown
# Hadith Of The Day

This project is a web application that displays a "Hadith of the Day" with features for sharing, saving, and interacting with the Hadith. The application uses React for the frontend and `@material-tailwind/react` for UI components.

## Features

- Display a random Hadith each day.
- Like, save, and share the Hadith.
- Toggle fullscreen mode.
- View Hadith in multiple languages.
- Download the Hadith as an image.

## Prerequisites

- Node.js and npm installed
- A running backend server for user authentication and content management

## Getting Started

### Backend Setup

1. Clone the backend repository:
   ```sh
   git clone <backend-repo-url>
   cd <backend-repo-directory>
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Update `constant.js` file:
   - Open `constant.js` file located in the backend directory.
   - Update the `USER_API_END_POINT` and any other necessary constants with your local or production values.
     ```javascript
     export const USER_API_END_POINT = "http://localhost:5000/api"; // Example URL
     ```

4. Configure CORS in `index.js` file:
   - Open `index.js` file located in the backend directory.
   - Update the CORS configuration to allow requests from your frontend URL.
     ```javascript
     const corsOptions = {
       origin: 'http://localhost:3000', // Example URL
       credentials: true,
     };
     app.use(cors(corsOptions));
     ```

5. Start the backend server:
   ```sh
   npm start
   ```

### Frontend Setup

1. Clone the frontend repository:
   ```sh
   git clone <frontend-repo-url>
   cd <frontend-repo-directory>
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Update `constant.js` file:
   - Open `constant.js` file located in the frontend directory.
   - Ensure the `USER_API_END_POINT` is pointing to your backend server.
     ```javascript
     export const USER_API_END_POINT = "http://localhost:5000/api"; // Example URL
     ```

4. Start the frontend server:
   ```sh
   npm start
   ```

## Usage

- The application will be available at `http://localhost:3000`.
- Interact with the Hadith of the day, like, save, and share it.

## Dependencies

- React
- @material-tailwind/react
- axios
- react-hot-toast
- redux
- react-redux
- react-icons
- html-to-image
- downloadjs

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License.
```

Replace the placeholder URLs (like `<backend-repo-url>` and `<frontend-repo-url>`) with the actual URLs of your repositories before pasting. This `README.md` file provides an overview of the project, setup instructions for both the backend and frontend, and basic usage information.
