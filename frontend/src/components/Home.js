import React, { useCallback, useMemo, useRef } from 'react'; // Added useRef
import { Outlet } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import SidebarToggle from '../layout/SidebarToggle';
import useSidebar from '../hooks/useSidebar';
import { Menu, X, User } from 'lucide-react';
import LeftSideBar from './LeftSideBar';
import RightSideBar from './RightSideBar';
import SidebarWrapper from './SidebarWrapper';
import useClickOutside from '../hooks/useClickOutside'; // Import the hook

// Static initial value outside component
const initialDesktopOpenValue = typeof window !== 'undefined' ? window.innerWidth >= 1024 : false;

const Home = () => {
  const {
    showLeftSidebar,
    showRightSidebar,
    toggleLeftSidebar: originalToggleLeft,
    toggleRightSidebar: originalToggleRight,
    toggleBothSidebars,
    setShowLeftSidebar, // Added for useClickOutside
    setShowRightSidebar, // Added for useClickOutside
  } = useSidebar(initialDesktopOpenValue, initialDesktopOpenValue);

  const leftSidebarRef = useClickOutside(() => {
    if (window.innerWidth < 1024 && showLeftSidebar) { // Only for mobile and if open
      setShowLeftSidebar(false);
    }
  }, showLeftSidebar);

  const rightSidebarRef = useClickOutside(() => {
    if (window.innerWidth < 1024 && showRightSidebar) { // Only for mobile and if open
      setShowRightSidebar(false);
    }
  }, showRightSidebar);

  const handleMobileToggleLeft = useCallback(() => {
    if (showRightSidebar) {
      originalToggleRight();
    }
    originalToggleLeft();
  }, [showRightSidebar, originalToggleLeft, originalToggleRight]);

  const handleMobileToggleRight = useCallback(() => {
    if (showLeftSidebar) {
      originalToggleLeft();
    }
    originalToggleRight();
  }, [showLeftSidebar, originalToggleLeft, originalToggleRight]);

  const closeMobileSidebars = useCallback(() => {
    if (showLeftSidebar) originalToggleLeft();
    if (showRightSidebar) originalToggleRight();
  }, [showLeftSidebar, showRightSidebar, originalToggleLeft, originalToggleRight]);

  const desktopContentClass = useMemo(() => {
    if (showLeftSidebar && showRightSidebar) return 'lg:w-[60%]';
    if (showLeftSidebar || showRightSidebar) return 'lg:w-[80%]';
    return 'lg:w-full';
  }, [showLeftSidebar, showRightSidebar]);

  return (
    <div className="relative min-h-screen bg-theme-background text-theme-text-primary">
      {/* Mobile Toggles - visible only on small screens */}
      <div className="lg:hidden">
        <button
          onClick={handleMobileToggleLeft}
          aria-label="Toggle Left Sidebar"
          className="fixed top-4 left-4 z-50 p-2 bg-theme-card-background text-theme-text-primary rounded-full shadow-lg hover:bg-theme-hover focus:outline-none focus:ring-2 focus:ring-theme-primary-accent"
        >
          {showLeftSidebar ? <X size={24} /> : <Menu size={24} />}
        </button>
        
        <button
          onClick={handleMobileToggleRight}
          aria-label="Toggle Right Sidebar"
          className="fixed top-4 right-4 z-50 p-2 bg-theme-card-background text-theme-text-primary rounded-full shadow-lg hover:bg-theme-hover focus:outline-none focus:ring-2 focus:ring-theme-primary-accent"
        >
          {showRightSidebar ? <X size={24} /> : <User size={24} />}
        </button>
      </div>

      {/* Desktop Toggles - hidden on small screens, visible on lg and up */}
      <div className="hidden lg:block">
        <SidebarToggle 
          showLeftSidebar={showLeftSidebar}
          showRightSidebar={showRightSidebar}
          toggleLeftSidebar={originalToggleLeft}
          toggleRightSidebar={originalToggleRight}
          toggleBothSidebars={toggleBothSidebars}
        />
      </div>

      {/* Overlay for mobile - shown when either sidebar is open on small screens */}
      {(showLeftSidebar || showRightSidebar) && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={closeMobileSidebars}
          aria-hidden="true"
        ></div>
      )}

      {/* Main content container */}
      <div className={`flex justify-between w-full max-w-screen-2xl mx-auto pt-20 lg:pt-8 px-4 sm:px-6 lg:px-8`}>
        <Toaster />
        
        {/* Left Sidebar - Now with wrapper */}
        <aside ref={leftSidebarRef} className={[
          "fixed top-0 left-0 h-full z-40 bg-theme-card-background shadow-xl transition-transform duration-300 ease-in-out",
          "w-4/5 max-w-xs sm:w-1/2 md:w-1/3",
          showLeftSidebar ? "translate-x-0" : "-translate-x-full",
          "lg:relative lg:translate-x-0 lg:h-auto lg:z-auto lg:bg-transparent lg:shadow-none",
          "lg:transition-all lg:duration-300",
          showLeftSidebar ? "lg:w-[20%] lg:opacity-100 lg:mr-4" : "lg:w-0 lg:opacity-0 lg:mr-0",
          "overflow-y-auto lg:overflow-visible flex-shrink-0"
        ].join(' ')}>
          <SidebarWrapper isVisible={showLeftSidebar} position="left">
            <LeftSideBar />
          </SidebarWrapper>
        </aside>
        
        {/* Content Area */}
        <main className={`transition-all duration-300 w-full ${desktopContentClass}`}>
          <Outlet />
        </main>
        
        {/* Right Sidebar - Now with wrapper */}
        <aside ref={rightSidebarRef} className={[
          "fixed top-0 right-0 h-full z-40 bg-theme-card-background shadow-xl transition-transform duration-300 ease-in-out",
          "w-4/5 max-w-xs sm:w-1/2 md:w-1/3",
          showRightSidebar ? "translate-x-0" : "translate-x-full",
          "lg:relative lg:translate-x-0 lg:h-auto lg:z-auto lg:bg-transparent lg:shadow-none",
          "lg:transition-all lg:duration-300",
          showRightSidebar ? "lg:w-[20%] lg:opacity-100 lg:ml-4" : "lg:w-0 lg:opacity-0 lg:ml-0",
          "overflow-y-auto lg:overflow-visible flex-shrink-0"
        ].join(' ')}>
          <SidebarWrapper isVisible={showRightSidebar} position="right">
            <RightSideBar />
          </SidebarWrapper>
        </aside>
      </div>
    </div>
  );
};

export default Home;