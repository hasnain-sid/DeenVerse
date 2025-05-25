import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import './App.css';
import Body from './components/Body';
import { useDispatch, useSelector } from "react-redux";
import { getUser } from "./redux/userSlice.js";
import { useTheme } from './hooks/useTheme';

function App() {
  const dispatch = useDispatch();
  const { user } = useSelector(store => store.user);
  const { currentThemeName } = useTheme(); // Initialize theme

  // Effect to apply the current theme name as a class to the body
  // This should only run when currentThemeName actually changes
  useEffect(() => {
    if (currentThemeName) {
      const body = document.body;
      // Remove old theme classes
      body.classList.remove('theme-default', 'theme-dark', 'theme-sepia', 'theme-cool');
      // Add new theme class
      body.classList.add(`theme-${currentThemeName}`);
    }
  }, [currentThemeName]);

  // Fetch user data if token exists
  useEffect(() => {
    if (!user && localStorage.getItem("token")) {
      dispatch(getUser());
    }
  }, [dispatch, user]);

  return (
    <div className="App">
      <Body/>
      <Toaster/>
    </div>
  );
}

export default App;
