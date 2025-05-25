import React, { useState, useEffect, useRef, useCallback } from "react";
import { AiOutlineCaretDown, AiOutlineCaretUp } from "react-icons/ai";
import { AiOutlineCheck } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { getLang, setFontFamily } from "../redux/contentSlice";

const Dropdown = ({ value, data, type }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedEle, setSelectedEle] = useState(null);
    const dropdownRef = useRef(null);
    const dispatch = useDispatch();
    
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
    
    const handleClickOutside = useCallback((event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsOpen(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, handleClickOutside]);return (
        <div ref={dropdownRef} className="relative">
            <button
                onClick={() => setIsOpen(prev => !prev)}
                className="flex w-full min-w-[120px] font-bold text-lg rounded-lg tracking-wider border-2 border-theme-border active:border-theme-accent duration-300 items-center p-1 bg-theme-card-background text-theme-text-primary"
            >
                <span className="flex-grow text-left px-2">{value}</span>
                {!isOpen ? (
                    <AiOutlineCaretDown className="h-6 w-6 text-theme-icon" />
                ) : (
                    <AiOutlineCaretUp className="h-6 w-6 text-theme-icon" />
                )}
            </button>
            {isOpen && (
                <div className="absolute mt-1 flex flex-col w-full min-w-[160px] items-start rounded-lg p-2 bg-theme-card-background border border-theme-border shadow-lg z-10">
                    {data?.map((ele, i) => (
                        <div
                            key={i}
                            className="flex justify-between items-center hover:bg-theme-hover w-full cursor-pointer rounded-r-lg border-l-transparent p-2 hover:border-l-theme-accent border-l-4"
                            onClick={() => setHandler(type, ele)}
                        >
                            {selectedEle === ele && <AiOutlineCheck className="mr-2 text-theme-accent" />}
                            <h3 className="font-bold text-theme-text-primary">{ele}</h3>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dropdown;
