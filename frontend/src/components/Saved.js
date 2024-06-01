import React, { useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight, FaRegHeart, FaBookmark, FaRegBookmark, FaExpand, FaCompress } from "react-icons/fa";
import { IoShareOutline } from "react-icons/io5";
import { TbMessageReport } from "react-icons/tb";
import axios from "axios";
import toast from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import { USER_API_END_POINT } from "../utils/constant";
import { getUser } from "../redux/userSlice";
import useGetUser from "../hooks/useGetUser";

const Saved = () => {
    const { user, refresh } = useSelector((store) => store.user);
    const [index, setIndex] = useState(0);
    const [click, setClick] = useState(false);
    const [info, setInfo] = useState({});
    const [lang, setLang] = useState("en");
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [savedItems, setSavedItems] = useState(user.saved || []);
    const dispatch = useDispatch();
    const { title, hadeeth, explanation } = info;
    const id = savedItems[index];

    useEffect(() => {
        async function fetchData() {
            try {
                const url = `https://hadeethenc.com/api/v1/hadeeths/one/?language=${lang}&id=${id}`;
                const response = await fetch(url);
                const data = await response.json();
                setInfo(data);
            } catch (err) {
                console.log(err);
            }
        }
        if (id) {
            fetchData();
        }
    }, [index, lang, id]);

    useEffect(() => {
        setClick(false);
        if(user.saved.includes(id))
        {
            setClick(true);
        }
        
    }, [id]);

    const savedHandler = async (e) => {
        setClick(e);
        try {
            const res = await axios.put(
                `${USER_API_END_POINT}/saved/${id}`,
                { id: user?._id },
                { withCredentials: true }
            );
            dispatch(getUser(res?.data?.user));
            if (res.data.success) {
                toast.success(res.data.message);
                setSavedItems(res.data.user.saved);
                if (index >= res.data.user.saved.length) {
                    setIndex(0);
                }
            }
        } catch (error) {
            toast.error(error.response.data.message);
            console.log(error);
        }
    };

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    return (
        <div className={`p-6 rounded-2xl m-3 shadow-lg ${isFullScreen ? 'fixed inset-0 bg-white z-50' : 'bg-gradient-to-r from-green-100 via-blue-100 to-purple-100'}`}>
            <div className="flex justify-between items-center">
                <h1 className="text-green-700 text-3xl font-bold text-center w-full">
                    Hadith Of The Day
                </h1>
                <button className="ml-4 p-2 bg-cyan-400 rounded-full" onClick={toggleFullScreen}>
                    {isFullScreen ? <FaCompress size={24} /> : <FaExpand size={24} />}
                </button>
            </div>
            <hr className="my-4 h-1 w-24 mx-auto bg-cyan-400 border-0"></hr>
            
            <div className="flex justify-center mt-4 mb-4 bg-cyan-300 rounded-full p-2 space-x-4 shadow-md">
                <div className="flex items-center mx-2">
                    <div className="p-2 hover:bg-red-200 rounded-full cursor-pointer transition duration-300">
                        <FaRegHeart color="black" />
                    </div>
                    <p className="ml-1">0</p>
                </div>
                <div className="flex items-center mx-2">
                    <div className="p-2 hover:bg-yellow-100 rounded-full cursor-pointer transition duration-300">
                        {click ? (
                            <FaBookmark color="yellow" onClick={() => savedHandler(false)} />
                        ) : (
                            <FaRegBookmark color="black" onClick={() => savedHandler(true)} />
                        )}
                    </div>
                </div>
                <div className="flex items-center mx-2">
                    <div className="p-2 hover:bg-gray-200 rounded-full cursor-pointer transition duration-300">
                        <IoShareOutline size="21px" color="black" />
                    </div>
                </div>
                <div className="flex items-center mx-2">
                    <div className="p-2 hover:bg-green-200 rounded-full cursor-pointer transition duration-300">
                        <TbMessageReport size="21px" color="black" />
                    </div>
                </div>
            </div>

            <div className="flex justify-between my-4">
                <button
                    className="prev-btn bg-cyan-400 rounded p-2 transition transform hover:scale-105"
                    onClick={() => setIndex((index - 1 + savedItems.length) % savedItems.length)}
                >
                    <FaChevronLeft size={24} />
                </button>

                <button
                    className="next-btn bg-cyan-400 rounded p-2 transition transform hover:scale-105"
                    onClick={() => setIndex((index + 1) % savedItems.length)}
                >
                    <FaChevronRight size={24} />
                </button>
            </div>

            <div className="bg-gray-200 rounded-lg p-4 mt-4 shadow-inner">
                <div className="text-center bg-grey-lighter p-2">
                    <h4 className="text-black m-1 text-lg font-bold">{title}</h4>
                </div>
                <p className="text-blue-700 text-center text-sm font-semibold">{hadeeth}</p>
                <p className="text-black text-justify text-sm font-semibold">{explanation}</p>
            </div>
        </div>
    );
};

export default Saved;
