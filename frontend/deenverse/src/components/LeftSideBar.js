import React from "react";
import { IoMdHome } from "react-icons/io";
import { GrNotification } from "react-icons/gr";
import { IoSearch } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";
import { FaRegBookmark } from "react-icons/fa";
import { IoNewspaperOutline } from "react-icons/io5";
import { MdVideoCall } from "react-icons/md";


import { CiLogout } from "react-icons/ci";
import { Link } from "react-router-dom";

const LeftSideBar = () => {
    return (
        <div className="w-[20%]">
            <div>
                <div>
                    <img
                        className="ml-3 m-3"
                        width={"40px"}
                        src="https://cdn-icons-png.flaticon.com/128/2918/2918211.png"
                        alt="DeenVerse"
                    />
                </div>
                <div className="my-4">
                    <div className="flex items-ceter my-2 px-4 py-2 hover:bg-gray-200 rounded-full cursor-pointer">
                        <div>
                            <IoMdHome size="24px" />
                        </div>
                        <h1 className="font-bold text-lg ml-2">Home</h1>
                    </div>
                    <div className="flex items-ceter my-2 px-4 py-2 hover:bg-gray-200 rounded-full cursor-pointer">
                        <div className="py-1">
                            <IoSearch size="22px" />
                        </div>
                        <h1 className="font-bold text-lg ml-2">Explore</h1>
                    </div>
                    <div className="flex items-ceter my-2 px-4 py-2 hover:bg-gray-200 rounded-full cursor-pointer">
                        <div className="py-1">
                        <IoNewspaperOutline  size="22px" />

                        </div>
                        <h1 className="font-bold text-lg ml-2">Updates</h1>
                    </div>
                    {/* <div className="flex items-ceter my-2 px-4 py-2 hover:bg-gray-200 rounded-full cursor-pointer">
                        <div className="py-1">
                            <CgProfile size="24px" />
                        </div>
                        <Link to="/profile">
                            <h1 className="font-bold text-lg ml-2">Profile</h1>
                        </Link>
                    </div> */}
                    <div className="flex items-ceter my-2 px-4 py-2 hover:bg-gray-200 rounded-full cursor-pointer">
                        <div className="py-1">
                            <FaRegBookmark size="24px" />
                        </div>
                        <h1 className="font-bold text-lg ml-2">Saved</h1>
                    </div>
                    <div className="flex items-ceter my-2 px-4 py-2 hover:bg-gray-200 rounded-full cursor-pointer">
                        <div className="py-1">
                        <MdVideoCall size="24px" />
                        </div>
                        <h1 className="font-bold text-lg ml-2">Video Call</h1>
                    </div>
                    <div className="flex items-ceter my-2 px-4 py-2 hover:bg-gray-200 rounded-full cursor-pointer">
                        <div className="py-1">
                            <CiLogout size="22px" />
                        </div>
                        <h1 className="font-bold text-lg ml-2">Logout</h1>
                    </div>
                    <button className="px-4 py-2 border-none text-md bg-[#1D9BF0] w-full rounded-full text-white font-bold">
                        Language
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LeftSideBar;
