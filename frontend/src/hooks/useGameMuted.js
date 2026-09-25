import { useSyncExternalStore } from "react";

// เก็บสถานะเปิด/ปิดเสียงไว้ที่เดียว ให้ทุกหน้าและทุก component ใช้ร่วมกัน
// (หน้าเกม, PauseModal, ด่านอื่น ๆ) โดยไม่ต้องส่ง props ต่อกันหลายชั้น

const MUTE_KEY = "gameMuted";
const listeners = new Set();

const readMuted = () => {
    try {
        return localStorage.getItem(MUTE_KEY) === "true";
    } catch {
        return false;
    }
};

let mutedValue = readMuted();

export function setGameMuted(value) {
    mutedValue = value;
    try {
        localStorage.setItem(MUTE_KEY, String(value));
    } catch {
        // ไม่เป็นไรถ้าบันทึกไม่ได้
    }
    listeners.forEach((listener) => listener());
}

const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};

const getSnapshot = () => mutedValue;

export default function useGameMuted() {
    const muted = useSyncExternalStore(subscribe, getSnapshot);
    const toggleMuted = () => setGameMuted(!mutedValue);
    return [muted, toggleMuted];
}