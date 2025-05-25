import React from "react";
import { CiSearch } from "react-icons/ci";
import { useSelector } from "react-redux";

const RightSideBar = () => {
  return (
    <div className="flex flex-col w-full h-full">
      <div className="p-3 w-full">
        {/* Search Bar */}
        <div className="flex items-center p-2 bg-theme-card-background border border-theme-border rounded-full outline-none w-full">
          <CiSearch className="text-theme-icon" />
          <input
            type="text"
            placeholder="Search"
            className="flex bg-transparent outline-none pl-2 w-full text-theme-text-primary"
          />
        </div>
        
        {/* Additional content can be added here */}
        <div className="p-4 w-full bg-theme-card-background border border-theme-border rounded-2xl my-4">
          <h3 className="text-theme-text-primary font-medium mb-2">Recent Searches</h3>
          <p className="text-theme-text-secondary text-sm">Your recent searches will appear here.</p>
        </div>
      </div>
    </div>  );
};

export default RightSideBar;
