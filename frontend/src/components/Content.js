import React from "react";
// import Daily from './Daily'
import { scrollbar } from "tailwind-scrollbar";
import { Outlet } from "react-router-dom";
const Content = () => {
  return (
    <div className="ml-5 w-auto border-2 border-green-700  scrollbar scrollbar-thumb-sky-700 ">
      {/* { document.body.style.overflow = "hidden"} */}
      <Outlet />
      {/* <Daily/> */}
      {/* <Daily/> */}
      {/* <Daily/> */}
    </div>
  );
};

export default Content;
