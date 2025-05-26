import React, { useEffect, useState } from "react";
import { IoMdHome } from "react-icons/io";
import { GrNotification } from "react-icons/gr";
import { IoSearch } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";
import { FaRegBookmark } from "react-icons/fa";
import { IoNewspaperOutline } from "react-icons/io5";
import { MdVideoCall } from "react-icons/md";
import { useSelector } from "react-redux";
import { USER_API_END_POINT } from "../utils/constant";
import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { CiLogout } from "react-icons/ci";
import { CiLogin } from "react-icons/ci";

import { Link } from "react-router-dom";
import { getLogout } from "../redux/userSlice";

const LeftSideBar = () => {
  const { user } = useSelector((store) => store.user);
  const [linkk, setLinkk] = useState("/");
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      setLinkk("/");
    } else {
      setLinkk("/login");
    }
  }, [user]);
  const logoutHandler = async () => {
    try {
      const res = await axios.get(
        `${USER_API_END_POINT}/logout`,

        {
          withCredentials: true,
        }
      );
      dispatch(getLogout());
      if (res.data.success) {
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.success(error.response.data.message);
      console.log(error);
    }
  };
  return (
    <div className="w-auto">
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
          <div className="flex  items-ceter my-2 px-4 py-2 hover:bg-gray-200 rounded-full cursor-pointer">
            <div className="flex">
              <IoMdHome size="24px" />
            </div>
            <Link to={`/`}>
              <h1 className="font-bold text-lg ml-2">Home</h1>
            </Link>
          </div>
          <div className="flex items-ceter my-2 px-4 py-2 hover:bg-gray-200 rounded-full cursor-pointer">
            <div className="py-1">
              <IoSearch size="22px" />
            </div>
            <h1 className="font-bold text-lg ml-2">Explore</h1>
          </div>
          <div className="flex items-ceter my-2 px-4 py-2 hover:bg-gray-200 rounded-full cursor-pointer">
            <div className="py-1">
              <IoNewspaperOutline size="22px" />
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
                    </div> */}          <div className="flex items-ceter my-2 px-4 py-2 hover:bg-gray-200 rounded-full cursor-pointer">
            <div className="py-1">
              <FaRegBookmark size="24px" />
            </div>
            <Link to={`/saved`}>
              <h1 className="font-bold text-lg ml-2">Saved</h1>
            </Link>
          </div>
          <div className="flex items-ceter my-2 px-4 py-2 hover:bg-gray-200 rounded-full cursor-pointer">
            <div className="py-1 ">
              <MdVideoCall size="24px" />
            </div>
            <Link to={`/quran-learning`}>
              <h1 className="font-bold text-md mt-[-2px] ml-2">Learn Quran</h1>
            </Link>
          </div>
          <Link to={`${linkk}`}>
            <div className="flex items-ceter my-2 px-4 py-2 hover:bg-gray-200 rounded-full cursor-pointer">
              {user ? (
                <div className="py-1">
                  <CiLogout size="22px" />
                </div>
              ) : (
                <div className="py-1">
                  <CiLogin size="22px" />
                </div>
              )}
              <h1
                className="font-bold text-lg ml-2"
                onClick={() => logoutHandler()}
              >
                {user ? "Logout" : "Login"}
              </h1>
            </div>
          </Link>

          <button className="px-4 py-2 border-none text-md bg-[#1D9BF0] w-full rounded-full text-white font-bold">
            Language
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeftSideBar;
