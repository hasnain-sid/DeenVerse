import React from 'react';
import { SidebarOpen, PanelLeftClose, PanelRightClose, Maximize2, Minimize2 } from 'lucide-react';

/**
 * Component for toggling sidebar visibility
 * @param {Object} props - Component props
 * @param {boolean} props.showLeftSidebar - Whether left sidebar is visible
 * @param {boolean} props.showRightSidebar - Whether right sidebar is visible
 * @param {Function} props.toggleLeftSidebar - Function to toggle left sidebar
 * @param {Function} props.toggleRightSidebar - Function to toggle right sidebar
 * @param {Function} props.toggleBothSidebars - Function to toggle both sidebars
 */
const SidebarToggle = ({
  showLeftSidebar,
  showRightSidebar,
  toggleLeftSidebar,
  toggleRightSidebar,
  toggleBothSidebars
}) => {
  return (
    <>
      {/* Left sidebar toggle */}
      <div className="fixed top-4 left-4 z-50">
        <button 
          onClick={toggleLeftSidebar} 
          className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
        >
          {showLeftSidebar ? <PanelLeftClose size={20} /> : <SidebarOpen size={20} />}
        </button>
      </div>
      
      {/* Right sidebar toggle */}
      <div className="fixed top-4 right-4 z-50">
        <button 
          onClick={toggleRightSidebar}
          className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
        >
          {showRightSidebar ? <PanelRightClose size={20} /> : <SidebarOpen size={20} />}
        </button>
      </div>
      
      {/* Both sidebars toggle */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
        <button 
          onClick={toggleBothSidebars}
          className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
        >
          {showLeftSidebar && showRightSidebar ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </button>
      </div>
    </>
  );
};

export default SidebarToggle;
