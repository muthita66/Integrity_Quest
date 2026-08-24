import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ExitDialog from "./ExitDialog";
import { MdTableRows } from "react-icons/md";

export default function NavBar({
    title = "Unit 1 : The Origin",
    subtitle = "กระจกวิเศษ",
    isFixed = true,
}) {
    const navigate = useNavigate();
    const [showExitDialog, setShowExitDialog] = useState(false);

    return (
        <>
            <header
                className={
                    isFixed
                        ? "fixed top-0 left-0 right-0 z-50 px-5 py-2 md:px-10 sarabun-bold"
                        : "w-full z-50 sarabun-bold"
                }
            >
                <div className="mx-auto flex w-full max-w-6xl items-center justify-between border-4 border-black bg-blue-200 px-5 py-2 shadow-xl">
                    {/* Title */}
                    <div className="flex items-center gap-4">
                        <p className="text-2xl font-black text-blue-900 md:text-lg whitespace-nowrap">
                            {title}
                            <span className="ml-2 text-lg font-black text-blue-800">
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
                        ">
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