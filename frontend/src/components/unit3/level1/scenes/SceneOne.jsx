import { motion } from "framer-motion";
import IntroDialog from "./IntroDialog";

import SceneOneImg from "../../../../assets/unit3/level1/intro/SceneOne.png"

export default function SceneOne({
    onNext,
    currentScene,
    totalScenes,
}) {
    return (
        <div className="fixed inset-0 w-full h-full -z-10">
            <img src={SceneOneImg} alt="Scene One"
                className="absolute inset-0 w-full h-full object-cover object-top opacity-90" />
        </div>
    );
}