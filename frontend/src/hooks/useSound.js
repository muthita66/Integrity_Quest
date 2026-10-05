import { useEffect, useRef, useCallback } from "react";

/**
 * Custom hook สำหรับเล่นเสียงในเกม
 * @param {string} src - path ของไฟล์เสียง
 * @param {object} options - { volume, loop }
 * @returns {{ play, stop, audioRef }}
 */
export function useSound(src, { volume = 1, loop = false, preload = false, retryOnInteract = false } = {}) {
    const audioRef = useRef(null);
    const retryRef = useRef(null);
    useEffect(() => {
        if (!preload) return;
        const audio = new Audio(src);
        audio.preload = 'auto';
        audio.load();
        audioRef.current = audio;
        return () => {
            audio.pause();
            audio.src = '';
            if (audioRef.current === audio) audioRef.current = null;
        };
    }, [src, preload]);

    const play = useCallback(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio(src);
        }
        audioRef.current.volume = volume;
        audioRef.current.loop = loop;
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {
            if (!retryOnInteract || retryRef.current) return;
            const retry = () => {
                retryRef.current = null;
                audioRef.current?.play().catch(() => {});
            };
            retryRef.current = retry;
            window.addEventListener('pointerdown', retry, { once: true });
        });
    }, [src, volume, loop, retryOnInteract]);

    const stop = useCallback(() => {
        if (retryRef.current) {
            window.removeEventListener('pointerdown', retryRef.current);
            retryRef.current = null;
        }
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    }, []);

    return { play, stop, audioRef };
}
