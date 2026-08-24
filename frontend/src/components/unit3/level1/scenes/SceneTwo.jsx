import { motion } from "framer-motion";
import IntroDialog from "./IntroDialog";

import SceneTwoImg from "../../../../assets/unit3/level1/intro/SceneTwo.png"

export default function SceneTwo({
    onNext,
    onBack,
    currentScene,
    totalScenes,
}) {
    return (
        <div className="fixed inset-0 w-full h-full -z-10">
            <img src={SceneTwoImg} alt="Scene Two" className="absolute inset-0 w-full h-full object-cover object-top opacity-90" />
        </div>
    );
}