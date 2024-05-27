import React from 'react'
import LeftSideBar from './LeftSideBar'
import Content from './Content'
import RightSideBar from './RightSideBar'
import {Outlet} from "react-router-dom"

const Home = () => {
  return (
    <div className='flex justify-between w-[93%] mx-auto '>
      {/* {document.body.style.overflow = "hidden"} */}
      {/* {document.body.classList.add("no-scroll")} */}
      <LeftSideBar/>
      {/* <Content/> */}
      <Outlet/>
      <RightSideBar/>
    </div>
  )
}

export default Home