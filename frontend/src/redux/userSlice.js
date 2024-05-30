import {createSlice} from "@reduxjs/toolkit"
 
const userSlice = createSlice({
  name: 'user',
  initialState:{
    user:null,
  
    // saved:null,
    logout:null,
    refresh:false,
  },
  reducers:{
    // multiple actions
    getUser:(state, action) =>{
      state.user = action.payload;
    },
    
    // getMySaved:(state, action) =>{
    //   state.saved = action.payload;
    // },
    getRefresh:(state) =>{
      state.refresh = !state.refresh;
    },
    getLogout:(state, action) =>{
      state.user = null;
    }

  }
});
export const {getUser,getRefresh,getLogout} = userSlice.actions;
export default userSlice.reducer;