import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { GiMoneyStack } from "react-icons/gi";

// ============================================================
// MoneyCard — ลากด้วย Pointer Events (แทน HTML5 drag เดิม)
// ------------------------------------------------------------
// HTML5 drag ให้เบราว์เซอร์วาดภาพเงาโปร่งแสงเอง ปรับให้ชัดไม่ได้
// → ทำการ์ดลอยเองแทน: ทึบ ชัด ขยายเล็กน้อย มีเงา เอียงนิด ๆ
//
// สื่อสารกับ MoneyJar ผ่าน window event
//   "moneyjar:hover" { type | null }  ลากอยู่เหนือโถไหน
//   "moneyjar:drop"  { type }         ปล่อยลงโถไหน
// (MoneyJar ต้องมี data-money-jar="personal|club")
// ============================================================

const DRAG_THRESHOLD = 6; // px — ขยับเกินนี้ถึงนับว่าเริ่มลาก

const emit = (name, detail) =>
    window.dispatchEvent(new CustomEvent(name, { detail }));

function CardBody({ item }) {
    const isTrap = item.type === "trap";

    return (
        <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center text-5xl">
                {isTrap ? "⚠️" : <GiMoneyStack className="text-green-600" />}
            </div>

            <div className="min-w-0 text-left">
                <p className="font-black text-slate-800">{item.text}</p>
                <p className="font-bold text-emerald-700">{item.amount}</p>
            </div>
        </div>
    );
}

export default function MoneyCard({ item, onDragStart }) {
    const startRef = useRef(null);      // จุดที่กดเมาส์ลง
    const draggingRef = useRef(false);  // กำลังลากอยู่ไหม
    const hoverTypeRef = useRef(null);  // โถที่อยู่ใต้เมาส์ตอนนี้

    const [drag, setDrag] = useState(null); // ตำแหน่งการ์ดลอย

    const reset = () => {
        if (draggingRef.current) emit("moneyjar:hover", { type: null });

        startRef.current = null;
        draggingRef.current = false;
        hoverTypeRef.current = null;
        setDrag(null);
    };

    // ถ้าการ์ดถูกลบออกระหว่างลาก (เช่น เกมจบ) ให้ล้างสถานะ
    useEffect(() => () => reset(), []); // eslint-disable-line react-hooks/exhaustive-deps

    const handlePointerDown = (event) => {
        if (event.button !== 0) return; // เฉพาะคลิกซ้าย / แตะ

        const rect = event.currentTarget.getBoundingClientRect();

        startRef.current = {
            x: event.clientX,
            y: event.clientY,
            offsetX: event.clientX - rect.left,
            offsetY: event.clientY - rect.top,
            width: rect.width,
        };

        event.currentTarget.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event) => {
        const start = startRef.current;
        if (!start) return;

        if (!draggingRef.current) {
            const moved = Math.hypot(
                event.clientX - start.x,
                event.clientY - start.y
            );

            if (moved < DRAG_THRESHOLD) return;

            draggingRef.current = true;
            onDragStart(item);
        }

        setDrag({
            x: event.clientX - start.offsetX,
            y: event.clientY - start.offsetY,
            width: start.width,
        });

        // หาโถที่อยู่ใต้เมาส์ (การ์ดลอยตั้ง pointer-events: none ไว้แล้ว)
        const jar = document
            .elementFromPoint(event.clientX, event.clientY)
            ?.closest("[data-money-jar]");

        const type = jar?.dataset.moneyJar || null;

        if (type !== hoverTypeRef.current) {
            hoverTypeRef.current = type;
            emit("moneyjar:hover", { type });
        }
    };

    const handlePointerUp = () => {
        if (draggingRef.current && hoverTypeRef.current) {
            emit("moneyjar:drop", { type: hoverTypeRef.current });
        }

        reset();
    };

    const isDragging = Boolean(drag);

    return (
        <>
            <div
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={reset}
                style={{ touchAction: "none" }}
                className={`
                    select-none rounded-xl border-2 p-4 transition duration-200
                    ${isDragging
                        ? "cursor-grabbing border-dashed border-amber-400 bg-yellow-50/60 opacity-40 shadow-none"
                        : "cursor-grab border-amber-600 bg-yellow-100 shadow-lg hover:scale-[1.01] hover:bg-yellow-50"
                    }
                `}
            >
                <CardBody item={item} />
            </div>

            {/* การ์ดลอยตามเมาส์ — ทึบ ชัด อยู่บนสุด */}
            {isDragging &&
                createPortal(
                    <div
                        style={{
                            position: "fixed",
                            left: drag.x,
                            top: drag.y,
                            width: drag.width,
                            pointerEvents: "none",
                            zIndex: 9999,
                            transform: "rotate(-2deg) scale(1.06)",
                        }}
                        className="
                            rounded-xl border-2 border-amber-600 bg-yellow-100 p-4
                            shadow-[0_18px_40px_rgba(0,0,0,0.35)] ring-4 ring-yellow-300/70
                        "
                    >
                        <CardBody item={item} />
                    </div>,
                    document.body
                )}
        </>
    );
}