import React from 'react'
import Daily from './Daily'
import {scrollbar} from "tailwind-scrollbar";
const Content = () => {
  return (
    <div  className="ml-5 w-[50%]  scrollbar scrollbar-thumb-sky-700">
    {/* { document.body.style.overflow = "hidden"} */}
    <Daily/>
    {/* <Daily/> */}
    {/* <Daily/> */}
    </div>
  )
}

export default Content