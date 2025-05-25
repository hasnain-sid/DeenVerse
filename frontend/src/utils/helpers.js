import { toPng } from 'html-to-image';
import download from 'downloadjs';
import toast from 'react-hot-toast';

/**
 * Shares/downloads content by converting it to an image
 * @param {string} elementId - ID of the element to download
 * @param {string} filename - Name of the file to download
 * @returns {Promise<void>}
 */
export const shareContent = async (elementId = 'daily-content', filename = 'hadith-of-the-day.png') => {
  try {
    const content = document.getElementById(elementId);
    if (!content) {
      toast.error("Content element not found");
      return;
    }
    
    toast.loading("Generating image...");
    const dataUrl = await toPng(content);
    toast.dismiss();
    download(dataUrl, filename);
    toast.success("Image downloaded successfully!");
  } catch (err) {
    console.error("Error generating image:", err);
    toast.error(err.message || "Failed to generate image");
  }
};

/**
 * Calculates dynamic content class based on sidebar visibility
 * @param {boolean} showLeftSidebar - Whether left sidebar is visible
 * @param {boolean} showRightSidebar - Whether right sidebar is visible 
 * @returns {string} Tailwind CSS class for content width
 */
export const getContentWidth = (showLeftSidebar, showRightSidebar) => {
  if (!showLeftSidebar && !showRightSidebar) return 'w-full';
  if (!showLeftSidebar) return 'w-[80%]';
  if (!showRightSidebar) return 'w-[80%]';
  return 'w-[60%]'; // Default with both sidebars visible
};
