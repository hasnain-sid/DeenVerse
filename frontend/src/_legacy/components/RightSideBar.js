import React from "react";
import { CiSearch } from "react-icons/ci";
import Dropdown from "./Dropdown.js";
import { fonts } from "./fonts.js";
// import transs from "./Daily.js"
import { useSelector } from "react-redux";
import { getLang } from "../redux/contentSlice.js";
import { useDispatch } from "react-redux";
import { scrollbar } from "tailwind-scrollbar";
import { Outlet } from "react-router-dom";
const RightSideBar = () => {
  const { translations } = useSelector((store) => store.content);

  return (
    <div className="flex flex-col">
      <div className="p-3 w-auto ">
        <div className="flex text-gray-700 items-center p-2 bg-gray-100 rounded-full outline-none w-full ">
          <CiSearch />

          <input
            type="text"
            placeholder="Search"
            className=" flex bg-transparent outline-none pl-2 w-full"
          />
        </div>
        <div className=" p-4 h-auto w-auto items-start bg-gray-100 rounded-2xl my-4  flex flex-col md:flex md:flex-row md:justify-center">
          <div
            className=" 
        mr-2 w-auto"
          >
            <Dropdown value={"Style"} data={fonts} type={"font"} />
          </div>
          <div className="mt-2 md:mt-0">
            <Dropdown
              value={"Language"}
              data={translations}
              type={"language"}
            />
          <div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightSideBar;
