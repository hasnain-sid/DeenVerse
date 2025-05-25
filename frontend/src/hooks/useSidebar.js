import { useState } from 'react';

/**
 * Custom hook for managing sidebar visibility and content width
 * @param {boolean} initialLeftState - Initial state of left sidebar visibility
 * @param {boolean} initialRightState - Initial state of right sidebar visibility
 * @returns {Object} Sidebar state and functions to manage it
 */
const useSidebar = (initialLeftState = true, initialRightState = true) => {
  const [showLeftSidebar, setShowLeftSidebar] = useState(initialLeftState);
  const [showRightSidebar, setShowRightSidebar] = useState(initialRightState);

  // Toggle individual sidebars
  const toggleLeftSidebar = () => setShowLeftSidebar(!showLeftSidebar);
  const toggleRightSidebar = () => setShowRightSidebar(!showRightSidebar);
  
  // Toggle both sidebars together
  const toggleBothSidebars = () => {
    // If both are showing, hide both. If either is hidden, show both
    const bothVisible = showLeftSidebar && showRightSidebar;
    setShowLeftSidebar(!bothVisible);
    setShowRightSidebar(!bothVisible);
  };

  // Calculate the content class based on sidebar visibility
  const getContentClass = () => {
    if (!showLeftSidebar && !showRightSidebar) return 'w-full';
    if (!showLeftSidebar) return 'w-[80%]';
    if (!showRightSidebar) return 'w-[80%]';
    return 'w-[60%]'; // Default with both sidebars visible
  };

  return {
    showLeftSidebar,
    showRightSidebar,
    toggleLeftSidebar,
    toggleRightSidebar,
    toggleBothSidebars,
    getContentClass
  };
};

export default useSidebar;