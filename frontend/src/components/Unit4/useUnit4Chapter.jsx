import { BASE_URL } from "../../config";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// ============================================================
// useUnit4Chapter(index)
// ------------------------------------------------------------
// ใช้ในหน้า intro ของแต่ละบทใน Unit 4 เพื่อกันการเข้าทาง URL ตรง ๆ
// ตอนที่บทยังไม่ปลดล็อก (กติกาเดียวกับ Unit4Book / ก้อนหินบนแผนที่)
//
//   index = 0 → บทที่ 1, 1 → บทที่ 2, 2 → บทที่ 3
//   (จับคู่กับ Level ของ Unit 4 ใน DB ตามลำดับ order_no)
//
// คืนค่า { checking, level }
//   checking : กำลังตรวจสิทธิ์อยู่ (ให้แสดงหน้าโหลด)
//   level    : ข้อมูล level จาก DB (มี level_id ไว้ใช้เริ่มเกม)
// ถ้ายังล็อก → แจ้งเตือนแล้วพากลับไปหน้าสารบัญ /unit4/book
// ============================================================

const API_URL = `${BASE_URL}`;
const UNIT_ID = 4;

// ต้องตรงกับ Unit4Book.jsx — เปลี่ยนเป็น false พร้อมกันเมื่อทุกบทบันทึกลง DB แล้ว
const LEGACY_LOCAL_FALLBACK = false;
const LEGACY_KEYS = ["level1", "level2", "level3"];

const readLegacy = () => {
    if (!LEGACY_LOCAL_FALLBACK) return {};
    try {
        return JSON.parse(localStorage.getItem("unit4")) || {};
    } catch {
        return {};
    }
};

export default function useUnit4Chapter(index) {
    const navigate = useNavigate();
    const [checking, setChecking] = useState(true);
    const [level, setLevel] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/", { replace: true });
            return;
        }

        let isMounted = true;

        const check = async () => {
            try {
                const response = await fetch(`${API_URL}/api/user-progress`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.status === 401) {
                    navigate("/", { replace: true });
                    return;
                }

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "โหลดความคืบหน้าไม่สำเร็จ");
                }

                const unit = (data.data || []).find(
                    (u) => Number(u.unit_id) === UNIT_ID
                );

                const levels = [...(unit?.levels || [])].sort(
                    (a, b) => Number(a.order_no) - Number(b.order_no)
                );

                const current = levels[index] || null;
                const unitLocked = !unit || unit.is_locked === true;

                const dbUnlocked =
                    Boolean(current) &&
                    (index === 0 || current.is_locked === false);

                const legacyUnlocked =
                    index === 0 || Boolean(readLegacy()[LEGACY_KEYS[index]]);

                const unlocked = !unitLocked && (dbUnlocked || legacyUnlocked);

                if (!isMounted) return;

                if (!unlocked) {
                    alert(
                        unitLocked
                            ? "🔒 Unit นี้ยังไม่ปลดล็อก"
                            : "🔒 บทนี้ยังไม่ปลดล็อก\nกรุณาผ่านบทก่อนหน้าก่อน"
                    );
                    navigate(unitLocked ? "/map" : "/unit4/book", { replace: true });
                    return;
                }

                setLevel(current);
                setChecking(false);
            } catch (error) {
                console.error("Check Unit 4 chapter error:", error);
                if (!isMounted) return;
                alert("ไม่สามารถตรวจสอบความคืบหน้าได้ กรุณาลองใหม่อีกครั้ง");
                navigate("/unit4/book", { replace: true });
            }
        };

        check();

        return () => {
            isMounted = false;
        };
    }, [index, navigate]);

    return { checking, level };
}

// หน้าโหลดสั้น ๆ ระหว่างตรวจสิทธิ์ (หน้าตาเดียวกับหน้าสารบัญ)
export function Unit4Checking() {
    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: 18,
                color: "var(--text-primary)",
            }}
        >
            กำลังเปิดแฟ้มคดี...
        </div>
    );
}