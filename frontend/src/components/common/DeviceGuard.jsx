import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiMonitor, FiRotateCw } from "react-icons/fi";

// ------------------------------------------------------------
// หน้าเกม = /unit1/ ... /unit6/ และ /sceneMission
// (/unit/:unitId ซึ่งเป็นหน้าเนื้อหาบท ไม่นับเป็นหน้าเกม)
// ------------------------------------------------------------
const isGameRoute = (pathname) => /^\/(unit[1-6]\/|sceneMission)/.test(pathname);

// ด้านที่สั้นที่สุดของหน้าจอ < 500px ถือว่าเป็นโทรศัพท์
// (วัดจากด้านสั้นเพื่อให้โทรศัพท์ที่หมุนแนวนอนแล้วยังถูกจับได้)
const PHONE_MAX_SHORT_SIDE = 500;

const getViewport = () => ({ w: window.innerWidth, h: window.innerHeight });

// ระบบรองรับแท็บเล็ต (iPad) / โน้ตบุ๊ก / คอมพิวเตอร์
//  - โทรศัพท์: แจ้งทุกหน้า (ผู้ใช้กด "ใช้งานต่อ" เพื่อข้ามได้)
//  - แท็บเล็ตแนวตั้ง: แจ้งให้หมุนจอ เฉพาะหน้าเกม
export default function DeviceGuard() {
    const { pathname } = useLocation();
    const navigate = useNavigate();

    const [viewport, setViewport] = useState(getViewport);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        const update = () => setViewport(getViewport());

        window.addEventListener("resize", update);
        window.addEventListener("orientationchange", update);

        return () => {
            window.removeEventListener("resize", update);
            window.removeEventListener("orientationchange", update);
        };
    }, []);

    if (dismissed) return null;

    const inGame = isGameRoute(pathname);
    const isPhone = Math.min(viewport.w, viewport.h) < PHONE_MAX_SHORT_SIDE;
    const isPortrait = viewport.h > viewport.w;

    const needsRotate = inGame && !isPhone && isPortrait;

    if (!isPhone && !needsRotate) return null;

    const Icon = isPhone ? FiMonitor : FiRotateCw;

    let title;
    let message;

    if (needsRotate) {
        title = "กรุณาหมุนหน้าจอเป็นแนวนอน";
        message = "เกมนี้เล่นในแนวนอนเพื่อให้มองเห็นฉากได้ครบถ้วน";
    } else if (inGame) {
        title = "แนะนำให้เล่นบนแท็บเล็ตหรือคอมพิวเตอร์";
        message =
            "เกมนี้ออกแบบสำหรับหน้าจอขนาดใหญ่ การเล่นบนโทรศัพท์อาจทำให้มองเห็นหรือกดได้ไม่สะดวก";
    } else {
        title = "ระบบนี้รองรับแท็บเล็ตและคอมพิวเตอร์";
        message =
            "เพื่อประสบการณ์ที่ดีที่สุด กรุณาใช้งานผ่านแท็บเล็ต โน้ตบุ๊ก หรือคอมพิวเตอร์";
    }

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-5 bg-slate-800/95 p-6 text-center text-white backdrop-blur-sm">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-400/20 text-amber-300">
                <Icon size={30} />
            </span>

            <div className="max-w-sm">
                <h2 className="text-xl font-bold">{title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{message}</p>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
                {isPhone && inGame && (
                    <button
                        type="button"
                        onClick={() => navigate("/map")}
                        className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-100"
                    >
                        กลับไปหน้าแผนที่
                    </button>
                )}
                <button
                    type="button"
                    onClick={() => setDismissed(true)}
                    className="rounded-xl border border-white/30 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
                >
                    {inGame ? "เล่นต่อ" : "ใช้งานต่อ"}
                </button>
            </div>
        </div>
    );
}