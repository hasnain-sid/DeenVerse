import { fonts } from "./fonts";
import React, { useState, useEffect, useRef } from "react";
import { AiOutlineCaretDown, AiOutlineCaretUp } from "react-icons/ai";

const Dropdown = ({ value }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

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
                className="flex w-34 font-bold text-lg rounded-lg tracking-wider border-2 border-transparent active:border-black duration-300 active:text-black items-center p-2 bg-red-300 items-center rounded-lg"
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
                    {fonts.map((font, i) => (
                        <div
                            key={i}
                            className="flex justify-between hover:bg-red-400 w-full cursor-pointer rounded-r-lg border-l-transparent p-2 hover:border-l-black border-l-4"
                        >
                            <h3 className="font-bold">{font}</h3>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dropdown;
