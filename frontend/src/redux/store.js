import {configureStore} from  "@reduxjs/toolkit";
import userSlice from "./userSlice";
import contentSlice from "./contentSlice";
const store = configureStore({
  reducer:{
    // actions
    user:userSlice,
    content:contentSlice

  }
})
export default store;