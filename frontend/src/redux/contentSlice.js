import {createSlice} from "@reduxjs/toolkit"
 
const contentSlice = createSlice({
  name: 'content',
  initialState:{
    content:null,
    translations:['English'],
    lang:'en',

  
    // refresh:false,
  },
  reducers:{
    // multiple actions
    getContent:(state, action) =>{
      state.content = action.payload;
    },
    getTranslations:(state,action) =>{
      state.translations = action.payload;
    },
    getLang:(state, action) =>{
      state.lang = action.payload
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
export const {getContent,getTranslations,getLang} = contentSlice.actions;
export default contentSlice.reducer;