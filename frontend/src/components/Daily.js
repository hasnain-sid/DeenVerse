import React, { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Bookmark, Share2, MessageSquare } from 'lucide-react';
import { useSelector, useDispatch } from "react-redux";
import { getContent, getTranslations, getLang } from "../redux/contentSlice";
import { arr } from "../utils/database_data.js";
import toast from "react-hot-toast";
import DownloadConfirmationDialog from "./DownloadConfirmationDialog";
import HadithControls from "./HadithControls";
import { useTheme } from "../hooks/useTheme";
import useBookmark from "../hooks/useBookmark";
import { shareContent } from "../utils/helpers";

const Daily = () => {
    // Redux
    const dispatch = useDispatch();
    const { lang, fontFamily: reduxFontFamily, fontSize: reduxFontSize } = useSelector((store) => store.content);

    // Custom hooks
    const { 
        currentTheme,
        isThemeMenuOpen,
        handleFontSizeChange,
        handleThemeChange,
        handleFontFamilyChange,
        toggleThemeMenu
    } = useTheme();    // State
    const [index, setIndex] = useState(0);
    const [info, setInfo] = useState({});
    const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Extract info data
    const { title, hadeeth, explanation } = info;
    const { id } = arr[index];

    // Use bookmark hook
    const { isBookmarked, toggleBookmark } = useBookmark(id);

    // Effects
    useEffect(() => {
        dispatch(getContent(id));
    }, [id, dispatch]);

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
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
                toast.error("Failed to load hadith data");
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [index, lang, id, dispatch]);    // Handlers
    const handleShareContent = async () => {
        await shareContent("daily-content", "hadith-of-the-day.png");
    };
    
    // Language change handler
    const handleLanguageChange = useCallback((langCode) => {
        dispatch(getLang(langCode));
    }, [dispatch]);    return (
        <div className="min-h-screen bg-theme-background transition-colors duration-300 p-4 safe-padding-top safe-padding-bottom">
            <div className="max-w-4xl mx-auto bg-theme-card rounded-lg shadow-lg transition-all duration-300">
                {/* Controls Bar */}
                <HadithControls 
                    currentTheme={currentTheme}
                    fontFamily={reduxFontFamily}
                    isThemeMenuOpen={isThemeMenuOpen}
                    onFontFamilyChange={handleFontFamilyChange}
                    onToggleThemeMenu={toggleThemeMenu}
                    onThemeChange={handleThemeChange}
                    onLanguageChange={handleLanguageChange}
                    showIcons={true}
                />

                <div className="p-fluid-4 xs:p-fluid-6">
                    <div className="flex items-center justify-center">
                        <h1 className="text-fluid-3xl xs:text-fluid-4xl font-bold text-theme-accent text-center">
                            Hadith Of The Day
                        </h1>
                    </div>
                    <div className="w-16 xs:w-24 h-0.5 bg-theme-accent mx-auto my-4" />
                </div>                <div className="flex justify-center gap-4 xs:gap-6 py-4">
                    <button
                        className="p-2 hover:bg-theme-hover rounded-md text-theme-text-primary touch-target"
                        onClick={toggleBookmark}
                        aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                    >
                        <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-yellow-400 text-yellow-400' : 'text-theme-icon'}`} />
                    </button>
                    <button
                        className="p-2 hover:bg-theme-hover rounded-md text-theme-text-primary touch-target"
                        onClick={() => setIsShareDialogOpen(true)}
                        aria-label="Share hadith"
                    >
                        <Share2 className="h-5 w-5 text-theme-icon" />
                    </button>
                    <button
                        className="p-2 hover:bg-theme-hover rounded-md text-theme-text-primary touch-target"
                        aria-label="Comment on hadith"
                    >
                        <MessageSquare className="h-5 w-5 text-theme-icon" />
                    </button>
                </div>                <div className="flex justify-between px-4 py-2">
                    <button
                        className="p-2 border border-theme-border rounded-md hover:bg-theme-hover text-theme-text-primary touch-target"
                        onClick={() => setIndex((index - 1 + arr.length) % arr.length)}
                        aria-label="Previous hadith"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                        className="p-2 border border-theme-border rounded-md hover:bg-theme-hover text-theme-text-primary touch-target"
                        onClick={() => setIndex((index + 1) % arr.length)}
                        aria-label="Next hadith"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>                <div className="p-4 xs:p-6">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-48">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-theme-accent"></div>
                        </div>
                    ) : (
                        <div 
                            id="daily-content"
                            className="rounded-lg p-4 xs:p-6 bg-theme-card text-theme-text-primary"
                            style={{ 
                                fontSize: `${reduxFontSize}%`,
                                fontFamily: reduxFontFamily
                            }}
                        >
                            <h2 className="text-fluid-xl xs:text-fluid-2xl font-bold mb-4 text-center text-theme-text-primary">
                                {title}
                            </h2>
                            <p className={`text-theme-hadith text-center mb-4 ${lang === 'ar' ? 'rtl-content' : ''}`}>
                                {hadeeth}
                            </p>
                            <p className={`text-theme-text-secondary max-w-[75ch] mx-auto ${lang === 'ar' ? 'rtl-content' : ''}`}>
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

export default Daily;
