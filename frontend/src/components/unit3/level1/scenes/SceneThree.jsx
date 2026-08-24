import { motion } from "framer-motion";
import IntroDialog from "./IntroDialog";

import SceneThree1 from "../../../../assets/unit3/level1/intro/SceneThree(1).png";
import SceneThree2 from "../../../../assets/unit3/level1/intro/SceneThree(2).png";

export default function SceneThree({
    onNext,
    onBack,
    currentScene,
    totalScenes,
}) {
    return (
        <div className="fixed inset-0 w-full h-full -z-10 bg-black">
            {/* Images */}
            <img src={SceneThree1} alt="Scene Three Left" className="absolute inset-y-0 left-0 w-1/2 h-full object-cover opacity-90" />
            <img src={SceneThree2} alt="Scene Three Right" className="absolute inset-y-0 right-0 w-1/2 h-full object-cover opacity-90" />

            {/* Divider */}
            <div className="absolute left-1/2 top-0 h-full w-2 -translate-x-1/2 bg-black" />
        </div>
    );
}