import React, { useEffect } from 'react'
import LeftSideBar from './LeftSideBar'
import Content from './Content'
import RightSideBar from './RightSideBar'
import {Outlet} from "react-router-dom"
import { Toaster } from 'react-hot-toast'
import { useSelector } from 'react-redux';
// import useGetSaved from '../hooks/useGetSaved'
const Home = () => {

  const {user} = useSelector(store=>store.user)
 
  // useGetSaved(user?._id)

  return (
    <div className='flex justify-between w-[93%] mx-auto '>
      <Toaster/>
      <LeftSideBar/>
      {/* <Content/> */}
      <Outlet/>
      <RightSideBar/>
    </div>
  )
}

export default Home