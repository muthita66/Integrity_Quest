import scbSlip from "../../../assets/unit4/mission-scb.png";
import kbankSlip from "../../../assets/unit4/mission-kbank.png";
import krungsriSlip from "../../../assets/unit4/mission-krungsri.png";
import krungthaiSlip from "../../../assets/unit4/mission-krungthai.png";
import integritySlip from "../../../assets/unit4/mission-integrity.png";

// หลักฐานที่ใช้ร่วมกันในฉากนำเข้า เกม และหน้าสรุปผล
export const SLIPS = [
    {
        id: 1,
        bank: "SCB",
        from: "Smart Tech Co.,Ltd",
        amount: "12,500.00 ฿",
        answer: "fake",
        image: scbSlip,
        clue: "เวลาและรายละเอียดบางส่วนไม่สอดคล้องกัน เมื่อตรวจจุดสังเกตครบแล้วจึงพบว่าเป็นสลิปปลอม",
    },
    {
        id: 2,
        bank: "KBank",
        from: "Fast Money",
        amount: "8,900.00 ฿",
        answer: "real",
        image: kbankSlip,
        clue: "เวลา วันที่ QR Code และเลขที่รายการสอดคล้องกัน รายละเอียดครบถ้วน จึงเป็นสลิปจริง",
    },
    {
        id: 3,
        bank: "Krungsri",
        from: "ABC Company",
        amount: "15,000.00 ฿",
        answer: "fake",
        image: krungsriSlip,
        clue: "มีจุดผิดปกติในรายละเอียดของรายการและรูปแบบข้อมูล จึงเป็นสลิปปลอม",
    },
    {
        id: 4,
        bank: "Krungthai",
        from: "Online Shop",
        amount: "5,200.00 ฿",
        answer: "fake",
        image: krungthaiSlip,
        clue: "เลขที่รายการและรูปแบบข้อมูลไม่สอดคล้องกับสลิปธนาคาร จึงเป็นสลิปปลอม",
    },
    {
        id: 5,
        bank: "Integrity Bank",
        from: "Tech Plus",
        amount: "7,500.00 ฿",
        answer: "real",
        image: integritySlip,
        clue: "รายละเอียดครบทั้งเวลา วันที่ QR Code และเลขที่รายการ โดยไม่มีจุดผิดปกติ จึงเป็นสลิปจริง",
    },
];

export const HINTS = [
    { title: "เวลา", detail: "ตรวจว่าชั่วโมง นาที และวินาทีเป็นค่าที่เป็นไปได้" },
    { title: "วันที่", detail: "ดูรูปแบบวันที่และความสอดคล้องกับวันทำรายการ" },
    { title: "QR Code", detail: "สังเกตความคมชัดและรูปแบบของ QR Code" },
    { title: "เลขที่รายการ", detail: "ตรวจรูปแบบและความต่อเนื่องของเลขอ้างอิง" },
];
