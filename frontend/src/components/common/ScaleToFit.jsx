import { useEffect, useState } from "react";

// ------------------------------------------------------------
// ScaleToFit — ย่อ/ขยาย "ฉากที่ออกแบบด้วยขนาดคงที่" ให้พอดีหน้าจอ
//
// ใช้กับหน้าเกมที่ข้างในเป็นขนาดพิกเซลตายตัว (เช่น กล่องเกม 1152×676)
// โดยไม่ต้องแก้โค้ดข้างใน: ข้างในยังเห็นเป็นขนาดเดิมทุกอย่าง
// แล้วทั้งก้อนถูก scale ตามความกว้าง/ความสูงของหน้าต่าง (รักษาสัดส่วน)
//
// props
//   designWidth / designHeight : ขนาดที่ออกแบบไว้ (px)
//   padding   : ระยะเผื่อรอบฉากจากขอบหน้าต่าง (px, แต่ละด้าน)
//   minScale / maxScale : ขอบเขตการย่อ/ขยาย (maxScale = 1 → ไม่ขยายเกินขนาดเดิม)
//   className : ใส่ให้กล่องนอก (เช่น "relative z-10")
//
// ข้อควรระวัง: ลูกที่ใช้ position: fixed หรือหน่วย vw/vh ภายในฉาก
// จะไม่อ้างอิงหน้าต่างอีกต่อไป (fixed จะอ้างอิงกล่องที่ถูก scale แทน)
// ------------------------------------------------------------

const computeScale = ({ designWidth, designHeight, padding, minScale, maxScale }) => {
    const availableWidth = window.innerWidth - padding * 2;
    const availableHeight = window.innerHeight - padding * 2;

    const raw = Math.min(
        availableWidth / designWidth,
        availableHeight / designHeight
    );

    return Math.min(maxScale, Math.max(minScale, raw));
};

export default function ScaleToFit({
    designWidth,
    designHeight,
    padding = 24,
    minScale = 0.3,
    maxScale = 1.25,
    className = "",
    children,
}) {
    const options = { designWidth, designHeight, padding, minScale, maxScale };

    const [scale, setScale] = useState(() => computeScale(options));

    useEffect(() => {
        const update = () =>
            setScale(
                computeScale({
                    designWidth,
                    designHeight,
                    padding,
                    minScale,
                    maxScale,
                })
            );

        update();

        window.addEventListener("resize", update);
        window.addEventListener("orientationchange", update);

        return () => {
            window.removeEventListener("resize", update);
            window.removeEventListener("orientationchange", update);
        };
    }, [designWidth, designHeight, padding, minScale, maxScale]);

    return (
        // กล่องนอก: ขนาดหลัง scale แล้ว เพื่อให้ layout (การจัดกึ่งกลาง) ถูกต้อง
        <div
            className={className}
            style={{
                width: designWidth * scale,
                height: designHeight * scale,
            }}
        >
            {/* กล่องใน: ขนาดที่ออกแบบไว้ แล้วย่อ/ขยายจากมุมซ้ายบน */}
            <div
                style={{
                    position: "relative",
                    width: designWidth,
                    height: designHeight,
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                }}
            >
                {children}
            </div>
        </div>
    );
}