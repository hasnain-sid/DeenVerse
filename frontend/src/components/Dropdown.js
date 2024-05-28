import React, { useState } from "react";
import { AiOutlineCaretUp, AiOutlineCaretDown } from "react-icons/ai";
import {fonts} from "./fonts";
const Dropdown = ({value}) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div>
            <button onClick={() => setIsOpen((prev) => !prev)} className="flex w-34 font-bold text-lg rouded-lg tracking-wider border-2 border-transparent active:border-black duration-300 active:text-black items-center p-2 bg-red-300   items-center  rounded-lg">
                {value}
                {!isOpen ? (
                    <AiOutlineCaretDown className="h-8" />

                ) : (
                    <AiOutlineCaretUp className="h-8" />
                )}
            </button>
            {isOpen && (
                <div className="bg-red-300  absolute mt-1 flex flex-col w-32 items-start rounded-lg p-2 ">
                    {fonts.map((font,i) => (
                        <div key={i} className="flex justify between hover:bg-red-400 w-full cursor-pointer rounded-r-lg border-l-transparent p-2 hover:border-l-black border-l-4">
                            <h3 className="font-bold ">
                                {font}
                            </h3>
                        </div>
                    )

                     )}
                </div>
            )}
        </div>
    );
};
export default Dropdown;
