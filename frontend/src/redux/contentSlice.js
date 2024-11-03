import { createSlice } from "@reduxjs/toolkit";

const contentSlice = createSlice({
  name: "content",
  initialState: {
    content: null,
    translations: ["English"],
    lang: "en",
    theme: 'Default',
    fontSize: 100,
    fontFamily: 'STIX Two Text',
  },
  reducers: {
    getContent: (state, action) => {
      state.content = action.payload;
    },
    getTranslations: (state, action) => {
      state.translations = action.payload;
    },
    getLang: (state, action) => {
      state.lang = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    setFontSize: (state, action) => {
      state.fontSize = action.payload;
    },
    setFontFamily: (state, action) => {
      state.fontFamily = action.payload;
    },
  },
});

export const { getContent, getTranslations, getLang, setTheme, setFontSize, setFontFamily } = contentSlice.actions;
export default contentSlice.reducer;
