import { useEffect, useRef } from "react";

export default function useBackgroundMusic(src, { volume = 0.05, muted = false } = {}) {
    const audioRef = useRef(null);

    useEffect(() => {
        const audio = new Audio(src);
        audio.loop = true; // เล่นวนไม่ให้เงียบ
        audio.volume = volume; // 0 ถึง 1
        audioRef.current = audio;

        const playOnInteract = () => audio.play().catch(() => { });

        // บางเบราว์เซอร์ไม่ยอมให้เล่นเสียงเองอัตโนมัติ
        // ถ้าโดนบล็อก จะเริ่มเล่นตอนผู้เล่นคลิกครั้งแรกแทน
        audio.play().catch(() => {
            window.addEventListener("pointerdown", playOnInteract, { once: true });
        });

        // ออกจากหน้าเกมแล้วหยุดเพลง
        return () => {
            window.removeEventListener("pointerdown", playOnInteract);
            audio.pause();
            audio.src = "";
            audioRef.current = null;
        };
    }, [src, volume]);

    // เปิด/ปิดเสียงตามปุ่ม
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.muted = muted;
        if (!muted && audio.paused) {
            audio.play().catch(() => { });
        }
    }, [muted]);

    return audioRef;
}