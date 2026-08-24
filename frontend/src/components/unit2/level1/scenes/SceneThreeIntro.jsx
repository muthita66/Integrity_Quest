import { IoMdSkipForward } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import IntroDialog from "../../intro/IntroDialog";
import sceneThree from "../../../../assets/unit2/level1/intro/sceneThree.png";

export default function SceneThree({
    onNext,
    onBack,
    handleSkip,
    currentScene,
    totalScenes,
}) {
    return (
        <div className="relative w-full h-screen overflow-hidden">
            {/* Illustration */}
            <img
                src={sceneThree}
                alt="Scene Three"
                className="absolute inset-0 w-full h-full object-cover object-top"
            />

            <button
                type="button"
                onClick={handleSkip}
                className={`
                    absolute top-4 right-4 z-20
                    rounded-full border-2 border-white/80
                    bg-black/40 p-2
                    text-white shadow-lg
                    backdrop-blur-sm
                    transition-all duration-300
                    hover:scale-105 hover:bg-black/60
                    active:scale-95
                    ${currentScene < totalScenes - 1 ? "" : "invisible"}
                `}
            >
                <IoMdSkipForward className="text-2xl" />
            </button>

            {/* Dialog */}
            <div className="absolute bottom-10 left-0 w-full z-20">
                <IntroDialog
                    speaker="ไกด์การเงิน"
                    title="ตลาดมหาวิทยาลัย"
                    text="คุณเริ่มภารกิจสำรวจตลาดเพื่อรวบรวมข้อมูลสินค้าและวิเคราะห์ความจำเป็นกับความต้องการ ก่อนตัดสินใจเลือกซื้ออย่างมีเหตุผล"
                    onNext={onNext}
                    onBack={onBack}
                    showBack={true}
                    currentScene={currentScene}
                    totalScenes={totalScenes}
                />
            </div>
        </div>
    );
}