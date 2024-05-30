import React, { useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight, FaQuoteRight } from "react-icons/fa";
import { FaBookmark } from "react-icons/fa";
import { USER_API_END_POINT } from "../utils/constant";
import axios from "axios";
import toast from "react-hot-toast";
import Avatar from "react-avatar";
import { IoShareOutline } from "react-icons/io5";
import { FaRegHeart } from "react-icons/fa";
import { TbMessageReport } from "react-icons/tb";

import { FaRegBookmark } from "react-icons/fa";
import { AiOutlineRetweet } from "react-icons/ai";
// import { arr } from "../utils/database_data.js";
import lamp from "./lamp.png";
import { useSelector, useDispatch } from "react-redux";
import {getRefresh,getUser} from "../redux/userSlice";

import useGetUser from '../hooks/useGetUser'

const Saved = () => {
    // console.log(arr);
    console.log('21')
    const { user ,refresh} = useSelector((store) => store.user);
    var arr = user.saved;
//     useEffect(() => {
      
      
//       arr = user.saved;
//  }, [0]);
    console.log(arr)
    const [index, setIndex] = useState(0);
    const [click, setClick] = useState(false);
    const [info, setInfo] = useState([]);
    const [selected, setSelected] = useState("Choose One");
    const { title, hadeeth, explanation } = info;
    const [lang, setLang] = useState("en");
    const id  = arr[index];
    const dispatch = useDispatch();
    

    useEffect(() => {
        async function fetchData() {
          // console.log('2')
            try {
                const url = `https://hadeethenc.com/api/v1/hadeeths/one/?language=${lang}&id=${id}`;
                const response = await fetch(url);
                const data = await response.json();
                setInfo(data);
                // console.log(data);
            } catch (err) {
                console.log(err);
            }
        }
        fetchData();
    }, [index, lang]);
    // const saved = user.saved;
    useEffect(() => {
        // dispatch(getRefresh())
        // console.log('lololo')
    },[refresh])
    useGetUser(user);
    const savedHandler = async (e) => {
        setClick(e);
        // useGetUser(getRefresh())
        // dispatch(useGetUser())
        // console.log('heeeloeoe')
        // console.log(saved);
        try {
            const res = await axios.put(
                `${USER_API_END_POINT}/saved/${id}`,
                { id: user?._id },
                {
                    withCredentials: true,
                }
            );
            // console.log(res.data.user);
            dispatch(getUser(res?.data?.user))
            if (res.data.success) {
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.success(error.response.data.message);
            console.log(error);
        }
    };

    return (
        <div>
            <div className="p-3 bg-white rounded-2xl m-3 ">
                <div className="  items-center">
                    <h1 className="absolute top-6 ml-40 flex text-green-700 text-3xl font-bold">
                        Hadith Of The Day
                    </h1>
                    <hr className=" absolute top-10 ml-60 h-1  w-24 my-6 bg-cyan-400 border-0 "></hr>
                </div>
                <div className="flex justify-between">
                    <button
                        className="prev-btn bg-cyan-400 rounded"
                        onClick={() => {
                            setIndex((index - 1 + arr.length) % arr.length);
                        }}
                    >
                        <FaChevronLeft size={24} />
                    </button>

                    <button
                        className="next-btn bg-cyan-400 rounded"
                        onClick={() => {
                            setIndex((index + 1) % arr.length);
                        }}
                    >
                        <FaChevronRight size={24} />
                    </button>
                </div>

                <div className="flex justify-between">
                    <div className=" flex  justify-evenly p-1">
                        <img
                            className="ml-3 h-16 rounded-full border-solid justify-evently"
                             

                            src={lamp}
                            alt="img"
                         />
                    </div>
                    <div className="flex justify-between mt-8 mb-2  bg-cyan-300 rounded-full">
                        <div className="flex items-center">
                            <div className="p-2 hover:bg-red-200 rounded-full cursor-pointer">
                                <FaRegHeart color="black" />
                            </div>

                            <p>0</p>
                        </div>

                        <div className="flex items-center">
                            <div className="p-2 hover:bg-yellow-100 rounded-full cursor-pointer">
                                {click ? (
                                    <FaBookmark
                                        color="yellow"
                                        onClick={() => savedHandler(false)}
                                    />
                                ) : (
                                    <FaRegBookmark
                                        color="black"
                                        onClick={() => savedHandler(true)}
                                    />
                                )}
                            </div>

                            {/* <p>0</p> */}
                        </div>
                        <div className="flex items-center">
                            <div className="p-2 hover:bg-gray-200 rounded-full cursor-pointer">
                                <IoShareOutline size="21px" color="black" />
                            </div>
                        </div>
                        <div className="flex items-center">
                            <div className="p-2 hover:bg-green-200 rounded-full cursor-pointer">
                                <TbMessageReport size="21px" color="black" />
                            </div>
                        </div>
                    </div>
                    <div className=" flex  justify-evenly p-1">
                        <img
                            className="ml-3 h-16 rounded-full border-solid justify-evently"
                            src={lamp}
                            alt="img"
                        />
                    </div>
                </div>

                <div className="   bg-gray-200  rounded-lg p-2">
                    <div className="flex text-center bg-grey-lighter p-2">
                        <h4 className="flex text-black  m-1  text-lg font-bold">
                            {title}
                        </h4>
                    </div>

                    <p className="text-blue-700  text-center text-sm font-semibold">
                        {hadeeth}
                    </p>
                    <p className="text-black text-justify text-sm font-semibold">
                        {explanation}
                    </p>
                </div>
            </div>
        </div>
    );
};

 

export default Saved;
