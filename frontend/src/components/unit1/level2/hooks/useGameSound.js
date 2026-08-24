import {
    useCallback,
    useEffect,
    useRef,
} from "react";

import uiSoundSfx from "../../../../assets/sounds/ui_sounds.mp3";
import bubblePopSound from "../../../../assets/sounds/bubble_pop.mp3";

export default function useGameSound() {
    const hoverSoundRef = useRef(null);
    const popSoundRef = useRef(null);

    useEffect(() => {
        hoverSoundRef.current = new Audio(
            uiSoundSfx
        );

        popSoundRef.current = new Audio(
            bubblePopSound
        );

        hoverSoundRef.current.volume = 0.5;
        popSoundRef.current.volume = 1;

        return () => {
            if (hoverSoundRef.current) {
                hoverSoundRef.current.pause();
                hoverSoundRef.current.src = "";
            }

            if (popSoundRef.current) {
                popSoundRef.current.pause();
                popSoundRef.current.src = "";
            }
        };
    }, []);

    const playHoverSound = useCallback(() => {
        const audio = hoverSoundRef.current;

        if (!audio) {
            return;
        }

        audio.currentTime = 0;

        audio.play().catch((error) => {
            console.warn(
                "ไม่สามารถเล่นเสียง Hover ได้:",
                error
            );
        });
    }, []);

    const playPopSound = useCallback(() => {
        const audio = popSoundRef.current;

        if (!audio) {
            return;
        }

        audio.currentTime = 0;

        audio.play().catch((error) => {
            console.warn(
                "ไม่สามารถเล่นเสียงฟองได้:",
                error
            );
        });
    }, []);

    return {
        playHoverSound,
        playPopSound,
    };
}