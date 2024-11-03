import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Bookmark, Share2, MessageSquare, Expand, Minimize, MoreVertical } from 'lucide-react';
import { useSelector, useDispatch } from "react-redux";
import { getUser } from "../redux/userSlice";
import { getContent, getTranslations, setTheme, setFontSize, setFontFamily } from "../redux/contentSlice";
import { arr } from "../utils/database_data.js";
import { toPng } from "html-to-image";
import download from "downloadjs";
import axios from "axios";
import toast from "react-hot-toast";
import { USER_API_END_POINT } from "../utils/constant";
import DownloadConfirmationDialog from "./DownloadConfirmationDialog";

const Daily = () => {
    // Redux
    const dispatch = useDispatch();
    const { user } = useSelector((store) => store.user);
    const { lang, theme: reduxTheme, fontSize: reduxFontSize, fontFamily: reduxFontFamily } = useSelector((store) => store.content);

    // State
    const [index, setIndex] = useState(0);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [info, setInfo] = useState({});
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
    const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
    const [currentTheme, setCurrentTheme] = useState('default');

    // Extract info data
    const { title, hadeeth, explanation } = info;
    const { id } = arr[index];

    const themes = {
        default: {
            background: 'bg-white',
            text: 'text-gray-900',
            card: 'bg-white',
            border: 'border-gray-200',
            hover: 'hover:bg-gray-100',
            accent: 'text-green-700',
            hadith: 'text-blue-600',
            controls: 'bg-white/95'
        },
        dark: {
            background: 'bg-gray-900',
            text: 'text-gray-50',
            card: 'bg-gray-800',
            border: 'border-gray-700',
            hover: 'hover:bg-gray-700',
            accent: 'text-green-400',
            hadith: 'text-blue-400',
            controls: 'bg-gray-800/95'
        },
        sepia: {
            background: 'bg-amber-50',
            text: 'text-gray-900',
            card: 'bg-amber-50',
            border: 'border-amber-200',
            hover: 'hover:bg-amber-100',
            accent: 'text-green-700',
            hadith: 'text-blue-600',
            controls: 'bg-amber-50/95'
        },
        cool: {
            background: 'bg-blue-50',
            text: 'text-gray-900',
            card: 'bg-blue-50',
            border: 'border-blue-200',
            hover: 'hover:bg-blue-100',
            accent: 'text-green-700',
            hadith: 'text-blue-600',
            controls: 'bg-blue-50/95'
        }
    };

    const fontFamilies = [
        "STIX Two Text",
        "Arial",
        "Times New Roman",
        "Verdana",
        "Georgia"
    ];

    // Effects
    useEffect(() => {
        dispatch(getContent(id));
    }, [id, dispatch]);

    useEffect(() => {
        async function fetchData() {
            try {
                const url = `https://hadeethenc.com/api/v1/hadeeths/one/?language=${lang}&id=${id}`;
                const response = await fetch(url);
                const data = await response.json();

                const transs = data.translations
                    .filter((ele) => ["hi", "ar", "en"].includes(ele))
                    .map((ele) => {
                        if (ele === "hi") return "Hindi";
                        else if (ele === "ar") return "Arabic";
                        else if (ele === "en") return "English";
                    });
                dispatch(getTranslations(transs));
                setInfo(data);
            } catch (err) {
                console.log(err);
            }
        }
        fetchData();
    }, [index, lang, id, dispatch]);

    useEffect(() => {
        setIsBookmarked(false);
        if (user?.saved.includes(id)) {
            setIsBookmarked(true);
        }
    }, [id, user?.saved]);

    // Handlers
    const handleFontSizeChange = (increment) => {
        const newSize = reduxFontSize + increment;
        if (newSize >= 70 && newSize <= 130) {
            dispatch(setFontSize(newSize));
        }
    };

    const handleThemeChange = (themeName) => {
        setCurrentTheme(themeName);
        dispatch(setTheme(themeName));
        setIsThemeMenuOpen(false);
    };

    const handleFontFamilyChange = (event) => {
        dispatch(setFontFamily(event.target.value));
    };

    const shareContent = async () => {
        try {
            const content = document.getElementById("daily-content");
            const dataUrl = await toPng(content);
            download(dataUrl, "hadith-of-the-day.png");
            toast.success("Image downloaded successfully!");
        } catch (err) {
            console.error("Error generating image:", err);
            toast.error("Failed to generate image");
        }
    };

    const handleBookmark = async () => {
        try {
            const res = await axios.put(
                `${USER_API_END_POINT}/saved/${id}`,
                { id: user?._id },
                { withCredentials: true }
            );
            dispatch(getUser(res?.data?.user));
            setIsBookmarked(!isBookmarked);
            if (res.data.success) {
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response.data.message);
            console.log(error);
        }
    };

    return (
        <div className={`min-h-screen ${themes[currentTheme].background} transition-colors duration-300 p-4`}>
            <div className={`max-w-4xl mx-auto ${themes[currentTheme].card} rounded-lg shadow-lg transition-all duration-300 ${
                isFullScreen ? 'fixed inset-0 z-50 rounded-none' : ''
            }`}>
                {/* Controls Bar */}
                <div className={`sticky top-0 z-10 ${themes[currentTheme].controls} backdrop-blur border-b ${themes[currentTheme].border}`}>
                    <div className="flex items-center justify-between p-3">
                        <select 
                            value={reduxFontFamily}
                            onChange={handleFontFamilyChange}
                            className={`w-40 px-3 py-2 rounded-md border ${themes[currentTheme].border} ${themes[currentTheme].text} ${themes[currentTheme].card}`}
                        >
                            {fontFamilies.map(font => (
                                <option key={font} value={font}>{font}</option>
                            ))}
                        </select>

                        <div className="flex items-center gap-2">
                            <button 
                                className={`px-3 py-1 rounded-md ${themes[currentTheme].hover} ${themes[currentTheme].text}`}
                                onClick={() => handleFontSizeChange(-10)}
                            >
                                A-
                            </button>
                            <button 
                                className={`px-3 py-1 rounded-md ${themes[currentTheme].hover} ${themes[currentTheme].text}`}
                                onClick={() => handleFontSizeChange(10)}
                            >
                                A+
                            </button>
                            <div className="relative">
                                <button
                                    className={`p-2 rounded-md ${themes[currentTheme].hover} ${themes[currentTheme].text}`}
                                    onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </button>
                                
                                {isThemeMenuOpen && (
                                    <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border ${themes[currentTheme].card} ${themes[currentTheme].border}`}>
                                        {Object.keys(themes).map((themeName) => (
                                            <button
                                                key={themeName}
                                                onClick={() => handleThemeChange(themeName)}
                                                className={`w-full px-4 py-2 text-left ${themes[currentTheme].text} ${
                                                    currentTheme === themeName ? themes[currentTheme].hover : ''
                                                } hover:${themes[currentTheme].hover}`}
                                            >
                                                {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="flex items-center justify-between">
                        <h1 className={`text-3xl font-bold ${themes[currentTheme].accent} text-center flex-grow`}>
                            Hadith Of The Day
                        </h1>
                        <button
                            className={`p-2 ${themes[currentTheme].hover} rounded-md ${themes[currentTheme].text}`}
                            onClick={() => setIsFullScreen(!isFullScreen)}
                        >
                            {isFullScreen ? (
                                <Minimize className="h-5 w-5" />
                            ) : (
                                <Expand className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                    <div className="w-24 h-0.5 bg-cyan-400 mx-auto my-4" />
                </div>

                <div className="flex justify-center gap-6 py-4">
                    <button
                        className={`p-2 ${themes[currentTheme].hover} rounded-md ${themes[currentTheme].text}`}
                        onClick={handleBookmark}
                    >
                        <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-yellow-400' : ''}`} />
                    </button>
                    <button
                        className={`p-2 ${themes[currentTheme].hover} rounded-md ${themes[currentTheme].text}`}
                        onClick={() => setIsShareDialogOpen(true)}
                    >
                        <Share2 className="h-5 w-5" />
                    </button>
                    <button
                        className={`p-2 ${themes[currentTheme].hover} rounded-md ${themes[currentTheme].text}`}
                    >
                        <MessageSquare className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex justify-between px-4 py-2">
                    <button
                        className={`p-2 border rounded-md ${themes[currentTheme].hover} ${themes[currentTheme].border} ${themes[currentTheme].text}`}
                        onClick={() => setIndex((index - 1 + arr.length) % arr.length)}
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                        className={`p-2 border rounded-md ${themes[currentTheme].hover} ${themes[currentTheme].border} ${themes[currentTheme].text}`}
                        onClick={() => setIndex((index + 1) % arr.length)}
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6">
                    <div 
                        id="daily-content"
                        className={`rounded-lg p-6 ${themes[currentTheme].card} ${themes[currentTheme].text}`}
                        style={{ 
                            fontSize: `${reduxFontSize}%`,
                            fontFamily: reduxFontFamily
                        }}
                    >
                        <h2 className="text-xl font-bold mb-4 text-center">
                            {title}
                        </h2>
                        <p className={`${themes[currentTheme].hadith} text-center mb-4 font-mono`}>
                            {hadeeth}
                        </p>
                        <p className={themes[currentTheme].text}>
                            {explanation}
                        </p>
                    </div>
                </div>
            </div>

            <DownloadConfirmationDialog
                open={isShareDialogOpen}
                setOpen={setIsShareDialogOpen}
                onConfirm={() => {
                    shareContent();
                    setIsShareDialogOpen(false);
                }}
            />
        </div>
    );
};

export default Daily;