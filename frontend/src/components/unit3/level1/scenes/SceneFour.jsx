import { motion } from "framer-motion";
import IntroDialog from "./IntroDialog";

import SceneFourImg from "../../../../assets/unit3/level1/intro/SceneFour.png"

export default function SceneFour({
    onNext,
    onBack,
    currentScene,
    totalScenes,
}) {
    return (
        <div className="fixed inset-0 w-full h-full -z-10">
            <img src={SceneFourImg} alt="Scene Four" className="absolute inset-0 w-full h-full object-cover object-top opacity-90" />
        </div>
    );
}