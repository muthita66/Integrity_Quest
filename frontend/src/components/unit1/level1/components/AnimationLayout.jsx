import React from "react";
import { IoPlaySkipForwardCircleSharp } from "react-icons/io5";

export default function AnimationLayout({ children, onSkip, showSkip }) {
    return (
        <div className="relative w-full h-full overflow-hidden rounded-[30px]">
            {/* Background & Content */}
            {children}

            {/* Skip Button */}
            {showSkip && (
                <button
                    onClick={onSkip}
                    className="absolute top-4 right-4 z-50 hover:text-white/70 text-white text-xl font-bold px-4 py-2 rounded-xl transition flex items-center gap-1"
                >
                    <IoPlaySkipForwardCircleSharp size={32} />
                </button>
            )}
        </div>
    );
}
