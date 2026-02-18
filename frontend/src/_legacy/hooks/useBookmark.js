import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import { USER_API_END_POINT } from '../utils/constant';

/**
 * Custom hook for managing bookmarks
 * @param {string} hadithId - ID of the hadith
 * @returns {Object} Bookmark state and toggle function
 */
export const useBookmark = (hadithId) => {
  const { user } = useSelector((store) => store.user);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  useEffect(() => {
    if (user && user.saved) {
      setIsBookmarked(user.saved.includes(hadithId));
    }
  }, [hadithId, user?.saved]);

  /**
   * Toggle bookmark status for a hadith
   */
  const toggleBookmark = async () => {
    try {
      if (!user) {
        toast.error("Please login to bookmark hadiths");
        return;
      }
      
      const res = await axios.put(
        `${USER_API_END_POINT}/saved/${hadithId}`,
        {}, 
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      
      if (res.data.success) {
        setIsBookmarked(!isBookmarked);
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update bookmark");
      console.log(error);
    }
  };

  return {
    isBookmarked,
    toggleBookmark
  };
};

export default useBookmark;
