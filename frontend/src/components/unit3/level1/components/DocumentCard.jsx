import { IoIosCheckmarkCircle, IoIosCloseCircle } from "react-icons/io";

// ============================================================
// DocumentCard
// ------------------------------------------------------------
// มุมเอียงมาจาก doc.rotate (สุ่มไม่ซ้ำกันใน useReceiptGame)
// ใช้ CSS property `rotate` แยกจาก `scale` ของ Tailwind
// → hover ขยายได้โดยยังคงมุมเอียงเดิม ไม่เด้งกลับตรง
//
// เดิมคำนวณมุมจาก doc.id.length แต่ id เป็นตัวเลข (ไม่มี .length)
// เลยได้ -10deg ทุกใบ → เอียงซ้ายหมด
// ============================================================

export default function DocumentCard({
    doc,
    isFound,
    isWrong = false,
    handleClickDoc,
}) {
    const angle = isFound ? 0 : doc.rotate ?? 0;

    return (
        <button
            type="button"
            onClick={() => handleClickDoc(doc)}
            disabled={isFound}
            className={`
                absolute z-20 w-56 h-64
                transition-all duration-300
                ${isFound
                    ? "opacity-30 scale-75"
                    : isWrong
                        ? "cursor-not-allowed opacity-60 grayscale"
                        : "hover:scale-110 hover:z-40"
                }
            `}
            style={{
                left: doc.left,
                top: doc.top,
                rotate: `${angle}deg`,
            }}
        >
            <img
                src={doc.image}
                alt={doc.name}
                className="w-full h-full object-contain drop-shadow-xl"
                draggable={false}
            />

            {/* หาเจอแล้ว */}
            {isFound && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl text-green-500 drop-shadow-lg">
                        <IoIosCheckmarkCircle />
                    </span>
                </div>
            )}

            {/* เลือกผิดไปแล้ว (ไอคอนหมุนกลับให้ตั้งตรงเสมอ แม้การ์ดกลับหัว) */}
            {isWrong && !isFound && (
                <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ rotate: `${-angle}deg` }}
                >
                    <span className="rounded-full bg-white text-6xl text-red-500 drop-shadow-lg">
                        <IoIosCloseCircle />
                    </span>
                </div>
            )}
        </button>
    );
}