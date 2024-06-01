import {createSlice} from "@reduxjs/toolkit"
 
const contentSlice = createSlice({
  name: 'content',
  initialState:{
    content:null,
    lang:['en'],
  
    // refresh:false,
  },
  reducers:{
    // multiple actions
    getContent:(state, action) =>{
      state.content = action.payload;
    },
    getLang:(state,action) =>{
      state.lang = action.payload;
    }
    
    // // getMySaved:(state, action) =>{
    // //   state.saved = action.payload;
    // // },
    // getRefresh:(state) =>{
    //   state.refresh = !state.refresh;
    // },
    // getLogout:(state, action) =>{
    //   state.user = null;
    // }

  }
});
export const {getContent,getLang} = contentSlice.actions;
export default contentSlice.reducer;