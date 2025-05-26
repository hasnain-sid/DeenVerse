import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import './App.css';
import './utils/themeStyles.css'; // Import theme-specific styles
import './utils/dropdownStyles.css'; // Import dropdown styles
import './utils/arabicFontStyles.css'; // Import Arabic font styles
import Body from './components/Body';
import { useDispatch, useSelector } from "react-redux";
import { getUser } from "./redux/userSlice.js";
import { useTheme } from './hooks/useTheme';

function App() {
  const dispatch = useDispatch();
  const { user } = useSelector(store => store.user);
  
  // Initialize theme via useTheme hook
  useTheme();

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
