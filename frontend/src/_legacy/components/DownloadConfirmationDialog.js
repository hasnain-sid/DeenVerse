import React from "react";
import AlertDialogContainer, {
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
} from "./ui/AlertDialog.js";
import { Download } from "lucide-react";

const DownloadConfirmationDialog = ({ onConfirm, open, setOpen }) => {
    return (
        <AlertDialogContainer open={open} onOpenChange={setOpen}>
            <AlertDialogContent className="max-w-md p-6 rounded-lg shadow-md bg-[#f7f5f2] border border-gray-200 transform transition-all duration-300 ease-out scale-100">
                {/* Icon Container */}
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                        <Download className="w-8 h-8 text-blue-600" />
                    </div>
                </div>

                <AlertDialogHeader className="text-center">
                    <AlertDialogDescription>
                        <div className="font-semibold text-gray-900 text-lg">
                            Are you sure you want to download this Hadith?
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter className="flex justify-center gap-4 mt-6">
                    <AlertDialogCancel
                        onClick={() => setOpen(false)}
                        className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition duration-200 font-medium"
                    >
                        Go Back
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition duration-200 font-medium"
                    >
                        Yes, Download
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialogContainer>
    );
};

export default DownloadConfirmationDialog;
