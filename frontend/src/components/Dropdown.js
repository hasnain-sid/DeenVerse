import React, { useState, useEffect, useRef } from "react";
import { AiOutlineCaretDown, AiOutlineCaretUp } from "react-icons/ai";
import { AiOutlineCheck } from "react-icons/ai"; // Import the check icon
import { useDispatch } from "react-redux";
import { getLang } from "../redux/contentSlice";
const Dropdown = ({ value, data , type}) => {
    // console.log(value,data,type)
    const [isOpen, setIsOpen] = useState(false);
    const [selectedEle, setSelectedEle] = useState(null); // State to keep track of the selected font
    const dropdownRef = useRef(null);
    const dispatch = useDispatch();
    
    const setHandler =async (type,ele) => {
        setSelectedEle(ele)
        if(type === 'language')
            if(ele == 'English')ele = "en";
            else if(ele == 'Hindi')ele = 'hi';
            else if(ele == 'Arabic')ele = 'ar';
            dispatch(getLang(ele))
        
    }
    const handleClickOutside = (event) => {
        if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target)
        ) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div ref={dropdownRef}>
            <button
                onClick={() => setIsOpen((prev) => !prev)}
                className="flex w-34 font-bold text-lg rounded-lg tracking-wider border-2 border-transparent active:border-black duration-300 active:text-black items-center p-1 bg-red-300 items-center rounded-lg"
            >
                {value}
                {!isOpen ? (
                    <AiOutlineCaretDown className="h-8" />
                ) : (
                    <AiOutlineCaretUp className="h-8" />
                )}
            </button>
            {isOpen && (
                <div className="bg-red-300 absolute mt-1 flex flex-col w-32 items-start rounded-lg p-2">
                    {data.map((ele, i) => (
                        <div
                            key={i}
                            className="flex justify-between items-center hover:bg-red-400 w-full cursor-pointer rounded-r-lg border-l-transparent p-2 hover:border-l-black border-l-4"
                            onClick={() => setHandler(type,ele)} // Set selected font on click
                        >
                            {selectedEle === ele && <AiOutlineCheck className="mr-2" />} {/* Conditionally render check icon */}
                            <h3 className="font-bold">{ele}</h3>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dropdown;
