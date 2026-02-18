import React from 'react'
import LeftSideBar from './LeftSideBar'
import RightSideBar from './RightSideBar'
import { Outlet } from "react-router-dom"
import { Toaster } from 'react-hot-toast'
import { useSelector } from 'react-redux'
import SidebarToggle from '../layout/SidebarToggle'
import useSidebar from '../hooks/useSidebar'

const Home = () => {
  const { user } = useSelector(store => store.user)
  const {
    showLeftSidebar,
    showRightSidebar,
    toggleLeftSidebar,
    toggleRightSidebar,
    toggleBothSidebars,
    getContentClass
  } = useSidebar(true, true);

  return (
    <div className="relative">
      <SidebarToggle 
        showLeftSidebar={showLeftSidebar}
        showRightSidebar={showRightSidebar}
        toggleLeftSidebar={toggleLeftSidebar}
        toggleRightSidebar={toggleRightSidebar}
        toggleBothSidebars={toggleBothSidebars}
      />

      <div className='flex justify-between w-[93%] mx-auto'>
        <Toaster />
        
        {/* Left Sidebar with transition */}
        <div className={`transition-all duration-300 overflow-hidden ${
          showLeftSidebar ? 'w-[20%] opacity-100' : 'w-0 opacity-0'
        }`}>
          {showLeftSidebar && <LeftSideBar />}
        </div>
        
        {/* Content area with dynamic width */}
        <div className={`transition-all duration-300 ${getContentClass()}`}>
          <Outlet />
        </div>
        
        {/* Right Sidebar with transition */}
        <div className={`transition-all duration-300 overflow-hidden ${
          showRightSidebar ? 'w-[20%] opacity-100' : 'w-0 opacity-0'
        }`}>
          {showRightSidebar && <RightSideBar />}
        </div>
      </div>
    </div>  )
}

export default Home