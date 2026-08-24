import { useRef, useCallback } from "react";

/**
 * Custom hook สำหรับเล่นเสียงในเกม
 * @param {string} src - path ของไฟล์เสียง
 * @param {object} options - { volume, loop }
 * @returns {{ play, stop, audioRef }}
 */
export function useSound(src, { volume = 1, loop = false } = {}) {
    const audioRef = useRef(null);

    const play = useCallback(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio(src);
        }
        audioRef.current.volume = volume;
        audioRef.current.loop = loop;
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
    }, [src, volume, loop]);

    const stop = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    }, []);

    return { play, stop, audioRef };
}
