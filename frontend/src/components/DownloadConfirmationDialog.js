import React, { useEffect } from "react";
import AlertDialogContainer, {
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
} from "./ui/AlertDialog.js";
import { Download } from "lucide-react";
import useClickOutside from "../hooks/useClickOutside"; // Import the hook
import "../utils/dialogStyles.css"; // Import dialog styles

const DownloadConfirmationDialog = ({ onConfirm, open, setOpen }) => {
    const dialogRef = useClickOutside(() => setOpen(false), open); // Use the hook
    
    // Prevent body scrolling when dialog is open
    useEffect(() => {
        if (open) {
            document.body.classList.add('overflow-hidden');
        } else {
            document.body.classList.remove('overflow-hidden');
        }
        
        return () => {
            document.body.classList.remove('overflow-hidden');
        };
    }, [open]);

    return (
        <AlertDialogContainer open={open} onOpenChange={setOpen}>
            {/* Pass the ref to the AlertDialogContent */}
            <AlertDialogContent
                ref={dialogRef}
                className="w-full max-w-md bg-theme-card-bg p-8 rounded-xl shadow-2xl transform transition-all duration-300 ease-out dialog-content"
            >
                {/* Icon Container */}
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-theme-primary-accent bg-opacity-20 flex items-center justify-center">
                        <Download className="w-10 h-10 text-theme-primary-accent" />
                    </div>
                </div>

                <AlertDialogHeader className="text-center">
                    <h1 className="font-bold text-2xl sm:text-3xl text-theme-text-primary mb-2">
                        Download Hadith
                    </h1>
                    <AlertDialogDescription>
                        <p className="text-theme-text-secondary">
                            Are you sure you want to download this Hadith?
                        </p>
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                    <AlertDialogCancel
                        onClick={() => setOpen(false)}
                        className="w-full sm:w-auto px-4 py-3 rounded-lg border border-theme-border text-theme-text-primary hover:bg-theme-border hover:bg-opacity-20 transition-colors font-medium"
                    >
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className="w-full sm:w-auto bg-theme-button-primary-bg text-theme-button-primary-text font-semibold py-3 px-4 rounded-lg hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-theme-button-primary-bg focus:ring-offset-2 focus:ring-offset-theme-card-bg transition-colors"
                    >
                        Yes, Download
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialogContainer>
    );
};

export default DownloadConfirmationDialog;
