import React from "react";
import { CiSearch } from "react-icons/ci";
import Dropdown from "./Dropdown.js"
import { fonts } from "./fonts.js";
// import transs from "./Daily.js"
import { useSelector } from "react-redux";
import { getLang } from "../redux/contentSlice.js";
import { useDispatch } from "react-redux";
const RightSideBar = () => {
    const { translations} = useSelector((store) => store.content);

     return (
        <div className="p-3 w-[30%]">
            <div className="flex text-gray-700 items-center p-2 bg-gray-100 rounded-full outline-none w-full">
                <CiSearch />

                <input
                    type="text"
                    placeholder="Search"
                    className=" flex bg-transparent outline-none pl-2 w-full"
                />
            </div>
            <div className="p-4 h-44 bg-gray-100 rounded-2xl my-4  flex">
                <div className="mr-2">
                <Dropdown value = {"Style"} data=  {fonts} type = {"font"} />
                </div>
                <div>
                <Dropdown value = {"Language"} data =  {translations} type = {"language"}/>
                </div>
                 
                 
            </div>
        </div>
    );
};

export default RightSideBar;
