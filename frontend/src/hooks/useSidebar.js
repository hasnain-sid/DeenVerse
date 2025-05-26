import { useState, useCallback, useRef } from 'react';

/**
 * Custom hook to manage sidebar visibility states
 */
const useSidebar = (initialLeftState = false, initialRightState = false) => {
  // Use refs to store initial states to avoid re-renders during initialization
  const initialLeftRef = useRef(initialLeftState);
  const initialRightRef = useRef(initialRightState);
  
  // Initialize state only once using the refs
  const [showLeftSidebar, setShowLeftSidebar] = useState(initialLeftRef.current);
  const [showRightSidebar, setShowRightSidebar] = useState(initialRightRef.current);
  
  // Throttle updates to prevent rapid consecutive state changes
  const lastToggleTime = useRef(0);
  const THROTTLE_MS = 300;
  
  const isThrottled = () => {
    const now = Date.now();
    if (now - lastToggleTime.current < THROTTLE_MS) return true;
    lastToggleTime.current = now;
    return false;
  };
  
  const toggleLeftSidebar = useCallback(() => {
    if (isThrottled()) return;
    setShowLeftSidebar(prev => !prev);
  }, []);

  const toggleRightSidebar = useCallback(() => {
    if (isThrottled()) return;
    setShowRightSidebar(prev => !prev);
  }, []);

  const toggleBothSidebars = useCallback(() => {
    if (isThrottled()) return;
    setShowLeftSidebar(prev => !prev);
    setShowRightSidebar(prev => !prev);
  }, []);

  return {
    showLeftSidebar,
    showRightSidebar,
    toggleLeftSidebar,
    toggleRightSidebar,
    toggleBothSidebars,
    setShowLeftSidebar, // Export setShowLeftSidebar
    setShowRightSidebar, // Export setShowRightSidebar
  };
};

export default useSidebar;