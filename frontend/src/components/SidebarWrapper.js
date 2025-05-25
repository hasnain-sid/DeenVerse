import React, { useState, useEffect } from 'react';

/**
 * This component wraps sidebar content and only renders it when needed,
 * helping to break potential infinite update loops
 */
const SidebarWrapper = ({ isVisible, children, position = 'left' }) => {
  // Use state to track whether we should render the content
  const [shouldRender, setShouldRender] = useState(false);

  // Only render the content when the sidebar becomes visible or was already visible
  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
    }
  }, [isVisible]);

  return (
    <div className={`sidebar-wrapper sidebar-${position}`}>
      {shouldRender ? children : null}
    </div>
  );
};

export default SidebarWrapper;
