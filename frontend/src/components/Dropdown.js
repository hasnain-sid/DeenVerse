import React, { useState, useEffect, useRef, useCallback } from "react";
import { AiOutlineCaretDown, AiOutlineCaretUp } from "react-icons/ai";
import { AiOutlineCheck } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { getLang, setFontFamily } from "../redux/contentSlice";
import { CSSTransition } from "react-transition-group";
import useClickOutside from "../hooks/useClickOutside";

const Dropdown = ({ 
  value, 
  data, 
  type,
  isOpen, 
  setIsOpen, 
  trigger,
  headerText,
  align = 'right',
  minWidth
}) => {
    const [selectedEle, setSelectedEle] = useState(null);
    const dispatch = useDispatch();
    const dropdownRef = useClickOutside(() => setIsOpen(false), isOpen);
    
    const alignmentClass = align === 'left' 
      ? 'left-0' 
      : align === 'center' 
        ? 'left-1/2 -translate-x-1/2' 
        : 'right-0';
    
    const setHandler = useCallback((type, ele) => {
        setSelectedEle(ele);
        
        if (type === 'language') {
            let langCode = ele;
            if (ele === 'English') langCode = "en";
            else if (ele === 'Hindi') langCode = 'hi';
            else if (ele === 'Arabic') langCode = 'ar';
            
            dispatch(getLang(langCode));
        } else if (type === 'font') {
            dispatch(setFontFamily(ele));
        }
    }, [dispatch]);
    
    const handleItemClick = (onClick) => {
        if (onClick) onClick();
        setIsOpen(false);
    };
    
    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger element (button, etc) */}
            {React.cloneElement(trigger, { 
                onClick: () => setIsOpen(!isOpen),
                'aria-expanded': isOpen,
                'aria-haspopup': true
            })}
            
            {/* Dropdown Menu */}
            <CSSTransition
                in={isOpen}
                timeout={200}
                classNames="dropdown-menu"
                unmountOnExit
            >
                <div 
                className={`dropdown-menu ${alignmentClass} top-full mt-1`}
                style={minWidth ? { minWidth } : {}}
                >
                {headerText && (
                    <div className="dropdown-header">{headerText}</div>
                )}
                
                {data?.map((ele, i) => (
                    <React.Fragment key={i}>
                    {ele.type === 'divider' ? (
                        <div className="dropdown-divider" />
                    ) : (
                        <button
                        onClick={() => handleItemClick(ele.onClick)}
                        className={`dropdown-item ${ele.active ? 'active' : ''}`}
                        disabled={ele.disabled}
                        >
                        {selectedEle === ele && <AiOutlineCheck className="mr-2" />}
                        <span className="font-bold">{ele}</span>
                        </button>
                    )}
                    </React.Fragment>
                ))}
                </div>
            </CSSTransition>
        </div>
    );
};

export default Dropdown;
