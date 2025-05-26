import { useEffect, useRef } from 'react';

/**
 * Custom hook to execute a handler function when a click occurs outside of the referenced DOM element.
 * @param {Function} handler - The function to call when a click outside is detected.
 * @param {boolean} [isActive=true] - Whether the hook is currently active and should listen for outside clicks.
 * @returns {React.RefObject} - The ref object to attach to the DOM element.
 */
const useClickOutside = (handler, isActive = true) => {
  const domNodeRef = useRef();

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const maybeHandler = (event) => {
      if (domNodeRef.current && !domNodeRef.current.contains(event.target)) {
        handler();
      }
    };

    document.addEventListener('mousedown', maybeHandler);

    return () => {
      document.removeEventListener('mousedown', maybeHandler);
    };
  }, [handler, isActive, domNodeRef]); // Added domNodeRef to dependencies

  return domNodeRef;
};

export default useClickOutside;
