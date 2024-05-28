import {createSlice} from "@reduxjs/toolkit"
 
const userSlice = createSlice({
  name: 'user',
  initialState:{
    user:null,
  
    saved:null,
    // tweets:null,
    refresh:false,
  },
  reducers:{
    // multiple actions
    getUser:(state, action) =>{
      state.user = action.payload;
    },
    
    getMySaved:(state, action) =>{
      state.saved = action.payload;
    },
    getRefresh:(state) =>{
      state.refresh = !state.refresh;
    }

  }
});
export const {getUser,getMySaved,getRefresh} = userSlice.actions;
export default userSlice.reducer;