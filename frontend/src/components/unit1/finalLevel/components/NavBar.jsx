import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ExitDialog from "./ExitDialog";
import { FaHome } from "react-icons/fa";

export default function NavBar({

    onRestart
}) {
    const navigate = useNavigate();
    const [showExitDialog, setShowExitDialog] = useState(false);

    const handleRestart = () => {
        if (onRestart) {
            onRestart();
            setShowExitDialog(false);
        } else {
            window.location.reload();
        }
    };

    return (
        <>
            {/* Exit button — fixed top-right */}
            <button
                type="button"
                onClick={() => setShowExitDialog(true)}
                className="
                    absolute top-5 right-3 z-20
                    rounded-full border-2 border-white/80
                    bg-black/40 p-2
                    text-white shadow-lg
                    backdrop-blur-sm
                    transition-all duration-300
                    hover:scale-105 hover:bg-black/60
                    active:scale-95
                "
            >
                <FaHome size={22} />
            </button>

            <ExitDialog
                isOpen={showExitDialog}
                onResume={() => setShowExitDialog(false)}
                onRestart={handleRestart}
                onExit={() => navigate("/map")}
            />
        </>
    );
}