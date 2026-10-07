import { useEffect, useRef, useState } from "react";

// ------------------------------------------------------------
// FitToViewport — ย่อเนื้อหา "เมื่อใหญ่เกินหน้าจอ" เท่านั้น
//
// ต่างจาก ScaleToFit: ไม่ต้องระบุขนาดที่ออกแบบไว้ — วัดขนาดจริงของเนื้อหาเอง
// และใช้กับป๊อปอัป/การ์ดที่อยู่กึ่งกลางจอ (เช่น การ์ดคำถามบอส กว้าง 590px)
// บนจอปกติจะไม่ย่อ (scale = 1) ย่อเฉพาะตอนจอเล็ก/เตี้ยจนล้นหน้าต่าง
//
// props
//   padding  : ระยะเผื่อจากขอบหน้าต่าง (px, แต่ละด้าน)
//   maxScale : เพดานการขยาย (ค่าเริ่มต้น 1 = ไม่ขยายเกินขนาดเดิม)
//   className: ใส่ให้กล่องนอก
// ------------------------------------------------------------

const MIN_SCALE = 0.3;

export default function FitToViewport({
    padding = 16,
    maxScale = 1,
    className = "",
    children,
}) {
    const contentRef = useRef(null);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const el = contentRef.current;
        if (!el) return;

        // offsetWidth/offsetHeight ไม่รวม transform จึงวัดขนาดจริงได้เสมอ
        const update = () => {
            const width = el.offsetWidth;
            const height = el.offsetHeight;
            if (!width || !height) return;

            const next = Math.min(
                maxScale,
                (window.innerWidth - padding * 2) / width,
                (window.innerHeight - padding * 2) / height
            );

            setScale(Math.max(MIN_SCALE, next));
        };

        update();

        const observer = new ResizeObserver(update);
        observer.observe(el);

        window.addEventListener("resize", update);
        window.addEventListener("orientationchange", update);

        return () => {
            observer.disconnect();
            window.removeEventListener("resize", update);
            window.removeEventListener("orientationchange", update);
        };
    }, [padding, maxScale]);

    return (
        <div
            className={className}
            style={{
                transform: `scale(${scale})`,
                transformOrigin: "center center",
            }}
        >
            <div ref={contentRef}>{children}</div>
        </div>
    );
}