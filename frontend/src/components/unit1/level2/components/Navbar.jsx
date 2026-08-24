import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ExitDialog from "./ExitDialog";
import { MdTableRows } from "react-icons/md";

export default function NavBar({
    title = "Level2 : Bubble",
    subtitle = "จิตวิทยาคนโกง",
}) {
    const navigate = useNavigate();
    const [showExitDialog, setShowExitDialog] = useState(false);

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-20 px-5 py-4 md:px-10 sarabun-bold">
                <div className="mx-auto flex w-full max-w-6xl items-center justify-between border-4 border-black bg-purple-300 px-5 py-3 shadow-xl">
                    {/* Title */}
                    <div className="flex items-center gap-4">
                        <p className="text-2xl font-black text-black md:text-lg whitespace-nowrap">
                            {title}
                            <span className="ml-2 text-lg font-black text-black">
                                {subtitle}
                            </span>
                        </p>
                    </div>

                    {/* Exit */}
                    <button
                        type="button"
                        onClick={() => setShowExitDialog(true)}
                        className="
                rounded-full border-2 border-white/80
                bg-black/40 p-2
                text-white shadow-lg
                backdrop-blur-sm
                transition-all duration-300
                hover:scale-105 hover:bg-black/60
                active:scale-95
            "
                    >
                        <MdTableRows size={20} />
                    </button>
                </div>
            </header>

            <ExitDialog
                isOpen={showExitDialog}
                onResume={() => setShowExitDialog(false)}
                onRestart={() => window.location.reload()}
                onExit={() => navigate("/map")}
            />
        </>
    );
}