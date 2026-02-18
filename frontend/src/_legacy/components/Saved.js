import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Bookmark, Share2, MessageSquare, Expand, Minimize } from 'lucide-react';
import { useSelector, useDispatch } from "react-redux";
import { getContent, getTranslations } from "../redux/contentSlice";
import { arr } from "../utils/database_data.js";
import toast from "react-hot-toast";
import DownloadConfirmationDialog from "./DownloadConfirmationDialog";
import HadithControls from "./HadithControls";
import useTheme from "../hooks/useTheme";
import useBookmark from "../hooks/useBookmark";
import { shareContent } from "../utils/helpers";
import { themes } from "../utils/themes";

const Saved = () => {
    // Redux
    const dispatch = useDispatch();
    const { user } = useSelector((store) => store.user);
    const { lang, fontFamily: reduxFontFamily, fontSize: reduxFontSize } = useSelector((store) => store.content);

    // Custom hooks
    const { 
        currentTheme,
        isThemeMenuOpen,
        handleFontSizeChange,
        handleThemeChange,
        handleFontFamilyChange,
        toggleThemeMenu
    } = useTheme();

    // State
    const [index, setIndex] = useState(0);
    const [info, setInfo] = useState({});
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [savedIds, setSavedIds] = useState([]);

    // Get saved hadiths from user
    useEffect(() => {
        if (user && user.saved && user.saved.length > 0) {
            setSavedIds(user.saved);
        }
    }, [user]);

    // Extract info data
    const { title, hadeeth, explanation } = info;
    const currentId = savedIds.length > 0 ? savedIds[index] : null;

    // Use bookmark hook
    const { isBookmarked, toggleBookmark } = useBookmark(currentId);

    // Effects
    useEffect(() => {
        if (currentId) {
            dispatch(getContent(currentId));
        }
    }, [currentId, dispatch]);

    useEffect(() => {
        async function fetchData() {
            if (!currentId) return;
            
            setIsLoading(true);
            try {
                const url = `https://hadeethenc.com/api/v1/hadeeths/one/?language=${lang}&id=${currentId}`;
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
                toast.error("Failed to load hadith data");
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [index, lang, currentId, dispatch]);

    // Handlers
    const handleShareContent = async () => {
        await shareContent("saved-content", "saved-hadith.png");
    };

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    const goToNextHadith = () => {
        if (savedIds.length > 0) {
            setIndex((index + 1) % savedIds.length);
        }
    };

    const goToPrevHadith = () => {
        if (savedIds.length > 0) {
            setIndex((index - 1 + savedIds.length) % savedIds.length);
        }
    };

    // Show message if no saved hadiths
    if (savedIds.length === 0) {
        return (
            <div className={`min-h-screen ${themes[currentTheme].background} transition-colors duration-300 p-4 flex justify-center items-center`}>
                <div className={`max-w-lg p-8 ${themes[currentTheme].card} rounded-lg shadow-lg text-center ${themes[currentTheme].text}`}>
                    <h2 className="text-2xl font-bold mb-4">No Saved Hadiths</h2>
                    <p>You haven't saved any hadiths yet. Browse the daily hadiths and bookmark your favorites to see them here.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${themes[currentTheme].background} transition-colors duration-300 p-4`}>
            <div className={`max-w-4xl mx-auto ${themes[currentTheme].card} rounded-lg shadow-lg transition-all duration-300 ${
                isFullScreen ? 'fixed inset-0 z-50 rounded-none' : ''
            }`}>
                {/* Controls Bar */}
                <HadithControls 
                    currentTheme={currentTheme}
                    fontFamily={reduxFontFamily}
                    isThemeMenuOpen={isThemeMenuOpen}
                    onFontFamilyChange={handleFontFamilyChange}
                    onDecreaseFontSize={() => handleFontSizeChange(-10)}
                    onIncreaseFontSize={() => handleFontSizeChange(10)}
                    onToggleThemeMenu={toggleThemeMenu}
                    onThemeChange={handleThemeChange}
                />

                <div className="p-6">
                    <div className="flex items-center justify-between">
                        <h1 className={`text-3xl font-bold ${themes[currentTheme].accent} text-center flex-grow`}>
                            Saved Hadiths
                        </h1>
                        <button
                            className={`p-2 ${themes[currentTheme].hover} rounded-md ${themes[currentTheme].text}`}
                            onClick={toggleFullScreen}
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
                        onClick={toggleBookmark}
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
                        onClick={goToPrevHadith}
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className={`${themes[currentTheme].text} p-2`}>
                        {index + 1} / {savedIds.length}
                    </span>
                    <button
                        className={`p-2 border rounded-md ${themes[currentTheme].hover} ${themes[currentTheme].border} ${themes[currentTheme].text}`}
                        onClick={goToNextHadith}
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-48">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        <div 
                            id="saved-content"
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
                    )}
                </div>
            </div>

            <DownloadConfirmationDialog
                open={isShareDialogOpen}
                setOpen={setIsShareDialogOpen}
                onConfirm={() => {
                    handleShareContent();
                    setIsShareDialogOpen(false);
                }}
            />
        </div>
    );
};

export default Saved;
