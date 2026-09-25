import { useEffect, useState } from "react";
import {
    FaArrowRight,
    FaBookOpen,
    FaBuildingColumns,
    FaCircleCheck,
    FaEnvelopeOpenText,
    FaFingerprint,
    FaGamepad,
    FaHouse,
    FaKey,
    FaLock,
    FaMagnifyingGlass,
    FaMoon,
    FaRocket,
    FaShieldHalved,
} from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import "../../styles/theme.css";

/* ประกายดาวลอยอยู่พื้นหลัง — ตำแหน่ง/ขนาด/จังหวะกะพริบแยกกันไม่ให้เป็นแพตเทิร์นซ้ำ */
const SPARKLES = [
    { top: "9%", left: "8%", size: 18, delay: "0s" },
    { top: "24%", left: "19%", size: 10, delay: "1.4s" },
    { top: "47%", left: "12%", size: 13, delay: "0.9s" },
    { top: "72%", left: "7%", size: 15, delay: "2.2s" },
    { top: "88%", left: "18%", size: 9, delay: "3.1s" },
    { top: "14%", right: "12%", size: 13, delay: "0.7s" },
    { top: "36%", right: "6%", size: 9, delay: "2.6s" },
    { top: "58%", right: "9%", size: 21, delay: "1.9s" },
    { top: "80%", right: "16%", size: 11, delay: "3s" },
    { top: "92%", right: "6%", size: 14, delay: "1.1s" },
];

/* ไอคอนเกี่ยวกับความปลอดภัยลอยจาง ๆ ด้านนอกการ์ด (ซ่อนบนจอเล็ก) */
const FLOATERS = [
    { Icon: FaShieldHalved, top: "15%", left: "4%", size: 50, delay: "0s" },
    { Icon: FaFingerprint, top: "43%", left: "2%", size: 40, delay: "-2s" },
    { Icon: FaMagnifyingGlass, top: "70%", left: "5%", size: 44, delay: "-4s" },
    { Icon: FaLock, top: "20%", right: "4.5%", size: 44, delay: "-1s" },
    { Icon: FaEnvelopeOpenText, top: "47%", right: "2.5%", size: 42, delay: "-3s" },
    { Icon: FaKey, top: "74%", right: "5%", size: 46, delay: "-5s" },
];

/* เคล็ดลับกันโดนโกง — เป็นโน้ตแปะข้างภาพบนจอกว้าง / เป็นแถบวนบนจอเล็ก */
const TIPS = [
    { text: "สลิปสวย ไม่ได้แปลว่าเงินเข้าจริง", tone: "yellow" },
    { text: "งานง่าย รายได้สูง? หยุดคิดก่อนตอบ", tone: "pink" },
    { text: "ใครขอยืมบัญชี = ชวนเป็นบัญชีม้า", tone: "mint" },
    { text: "ลิงก์แปลก ๆ ในแชต อย่าเพิ่งกด", tone: "lilac" },
];

/* ฉากห้องทำงานตอนเย็นก่อนวันแรก — วาดด้วย SVG ล้วน ไม่ต้องพึ่งไฟล์ภาพ
   จังหวะเด่นของหน้านี้: ห้องเริ่มมืดลง แล้วโคมไฟ + หน้าจอแล็ปท็อปค่อย ๆ สว่างขึ้น */
function NightBeforeScene() {
    return (
        <svg
            viewBox="0 0 560 280"
            xmlns="http://www.w3.org/2000/svg"
            role="presentation"
            focusable="false"
        >
            <defs>
                <linearGradient id="u4s-sky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#A597D4" />
                    <stop offset=".48" stopColor="#F0B4B0" />
                    <stop offset="1" stopColor="#FFDCAE" />
                </linearGradient>
                <linearGradient id="u4s-wall" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#F8D3BA" />
                    <stop offset="1" stopColor="#E9AC8A" />
                </linearGradient>
                <linearGradient id="u4s-desk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#BC7C5B" />
                    <stop offset="1" stopColor="#87503C" />
                </linearGradient>
                <linearGradient id="u4s-curtain" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#EAB9CA" />
                    <stop offset="1" stopColor="#C88AA5" />
                </linearGradient>
                <linearGradient id="u4s-screen" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#4C3858" />
                    <stop offset="1" stopColor="#2B1F37" />
                </linearGradient>
                <linearGradient id="u4s-gold" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#FBEFC9" />
                    <stop offset=".4" stopColor="#EACD86" />
                    <stop offset=".75" stopColor="#C9A24A" />
                    <stop offset="1" stopColor="#9A6C1C" />
                </linearGradient>
                <linearGradient id="u4s-shade" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#E89B6C" />
                    <stop offset="1" stopColor="#B9683F" />
                </linearGradient>
                <linearGradient id="u4s-cone" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#FFE9A8" stopOpacity=".62" />
                    <stop offset="1" stopColor="#FFE9A8" stopOpacity="0" />
                </linearGradient>
                <radialGradient id="u4s-sunglow">
                    <stop offset="0" stopColor="#FFF3B0" stopOpacity=".95" />
                    <stop offset="1" stopColor="#FFF3B0" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="u4s-lampglow">
                    <stop offset="0" stopColor="#FFE9A8" stopOpacity=".95" />
                    <stop offset=".45" stopColor="#FFDCA0" stopOpacity=".38" />
                    <stop offset="1" stopColor="#FFDCA0" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="u4s-vignette" cx=".71" cy=".56" r=".9">
                    <stop offset="0" stopColor="#2B1B3A" stopOpacity="0" />
                    <stop offset=".5" stopColor="#2B1B3A" stopOpacity="0" />
                    <stop offset="1" stopColor="#2B1B3A" stopOpacity=".3" />
                </radialGradient>
                <clipPath id="u4s-win">
                    <rect x="100" y="22" width="360" height="160" rx="10" />
                </clipPath>
                <mask id="u4s-moon" maskUnits="userSpaceOnUse" x="0" y="0" width="560" height="280">
                    <rect width="560" height="280" fill="#fff" />
                    <circle cx="175" cy="63" r="17" fill="#000" />
                </mask>
            </defs>

            {/* ผนังห้อง */}
            <rect width="560" height="280" fill="url(#u4s-wall)" />

            {/* ---------- ท้องฟ้านอกหน้าต่าง ---------- */}
            <g clipPath="url(#u4s-win)">
                <rect x="100" y="22" width="360" height="160" fill="url(#u4s-sky)" />

                <g className="u4s-stars" fill="#FFF8DC">
                    <circle cx="142" cy="44" r="1.8" className="u4s-twinkle" style={{ animationDelay: "0s" }} />
                    <circle cx="204" cy="36" r="1.3" className="u4s-twinkle" style={{ animationDelay: "1.1s" }} />
                    <circle cx="238" cy="58" r="1.6" className="u4s-twinkle" style={{ animationDelay: "2.2s" }} />
                    <circle cx="306" cy="38" r="1.3" className="u4s-twinkle" style={{ animationDelay: ".6s" }} />
                    <circle cx="352" cy="52" r="1.7" className="u4s-twinkle" style={{ animationDelay: "1.7s" }} />
                    <circle cx="426" cy="42" r="1.4" className="u4s-twinkle" style={{ animationDelay: "2.6s" }} />
                    <circle cx="128" cy="92" r="1.2" className="u4s-twinkle" style={{ animationDelay: "3s" }} />
                    <circle cx="268" cy="82" r="1.1" className="u4s-twinkle" style={{ animationDelay: "1.4s" }} />
                </g>

                {/* พระจันทร์เสี้ยวขึ้นทางซ้าย */}
                <circle cx="165" cy="70" r="32" fill="#FFF3B0" opacity=".16" />
                <circle cx="165" cy="70" r="19" fill="#FFF6D6" mask="url(#u4s-moon)" />

                {/* ตะวันลับขอบตึกทางขวา */}
                <circle cx="372" cy="140" r="78" fill="url(#u4s-sunglow)" />
                <circle cx="372" cy="140" r="30" fill="#FFF0A8" />

                {/* ตึกไกล */}
                <g fill="#D9AACB" opacity=".82">
                    <rect x="100" y="150" width="30" height="32" />
                    <rect x="128" y="136" width="24" height="46" />
                    <rect x="150" y="152" width="34" height="30" />
                    <rect x="182" y="124" width="22" height="58" />
                    <rect x="202" y="148" width="36" height="34" />
                    <rect x="236" y="134" width="26" height="48" />
                    <rect x="260" y="154" width="40" height="28" />
                    <rect x="298" y="140" width="24" height="42" />
                    <rect x="320" y="152" width="34" height="30" />
                    <rect x="352" y="158" width="30" height="24" />
                    <rect x="380" y="154" width="44" height="28" />
                    <rect x="422" y="146" width="40" height="36" />
                </g>

                {/* ตึกใกล้ */}
                <g fill="#B58BB0">
                    <rect x="108" y="164" width="30" height="18" />
                    <rect x="136" y="152" width="24" height="30" />
                    <rect x="158" y="168" width="30" height="14" />
                    <rect x="190" y="158" width="32" height="24" />
                    <rect x="222" y="170" width="28" height="12" />
                    <rect x="250" y="156" width="30" height="26" />
                    <rect x="280" y="172" width="34" height="10" />
                    <rect x="314" y="160" width="28" height="22" />
                    <rect x="342" y="174" width="30" height="8" />
                    <rect x="372" y="166" width="34" height="16" />
                    <rect x="406" y="156" width="26" height="26" />
                    <rect x="432" y="168" width="32" height="14" />
                </g>

                {/* ไฟในหน้าต่างตึก */}
                <g fill="#FFE7A0">
                    <rect x="141" y="158" width="3" height="4" />
                    <rect x="148" y="158" width="3" height="4" className="u4s-twinkle" style={{ animationDelay: "1s" }} />
                    <rect x="141" y="167" width="3" height="4" className="u4s-twinkle" style={{ animationDelay: "2.4s" }} />
                    <rect x="148" y="173" width="3" height="4" />
                    <rect x="196" y="164" width="3" height="4" />
                    <rect x="204" y="164" width="3" height="4" />
                    <rect x="212" y="164" width="3" height="4" className="u4s-twinkle" style={{ animationDelay: "1.8s" }} />
                    <rect x="196" y="172" width="3" height="4" className="u4s-twinkle" style={{ animationDelay: ".4s" }} />
                    <rect x="256" y="162" width="3" height="4" />
                    <rect x="264" y="162" width="3" height="4" />
                    <rect x="256" y="170" width="3" height="4" className="u4s-twinkle" style={{ animationDelay: "2.9s" }} />
                    <rect x="272" y="170" width="3" height="4" />
                    <rect x="320" y="166" width="3" height="4" />
                    <rect x="328" y="168" width="3" height="4" className="u4s-twinkle" style={{ animationDelay: "1.3s" }} />
                    <rect x="412" y="162" width="3" height="4" />
                    <rect x="420" y="162" width="3" height="4" />
                    <rect x="412" y="170" width="3" height="4" className="u4s-twinkle" style={{ animationDelay: "3.3s" }} />
                    <rect x="438" y="174" width="3" height="4" />
                    <rect x="448" y="174" width="3" height="4" />
                </g>

                {/* เงาสะท้อนบนกระจก */}
                <path d="M170 22 H214 L142 182 H98 Z" fill="#fff" opacity=".1" />
            </g>

            {/* กรอบหน้าต่าง */}
            <rect x="100" y="22" width="360" height="160" rx="10" fill="none" stroke="#FFF3E4" strokeWidth="8" />
            <path d="M280 22 V182 M100 102 H460" stroke="#FFF3E4" strokeWidth="5" />

            {/* ม่าน + ราว */}
            <path d="M64 8 H124 C112 60 132 120 118 196 H64 Z" fill="url(#u4s-curtain)" />
            <path d="M84 10 C80 80 92 130 82 196 M102 10 C96 70 112 130 100 196" stroke="#fff" strokeOpacity=".28" strokeWidth="2" fill="none" />
            <path d="M496 8 H436 C448 60 428 120 442 196 H496 Z" fill="url(#u4s-curtain)" />
            <path d="M476 10 C480 80 468 130 478 196 M458 10 C464 70 448 130 460 196" stroke="#fff" strokeOpacity=".28" strokeWidth="2" fill="none" />
            <rect x="52" y="5" width="456" height="6" rx="3" fill="#87503C" />
            <circle cx="52" cy="8" r="5.5" fill="#C08A2E" />
            <circle cx="508" cy="8" r="5.5" fill="#C08A2E" />

            {/* ขอบหน้าต่างด้านล่าง */}
            <rect x="88" y="180" width="384" height="12" rx="6" fill="#FFF0E0" />
            <rect x="92" y="190" width="376" height="4" rx="2" fill="#87503C" opacity=".2" />

            {/* นาฬิกาแขวนผนัง : สามทุ่มพอดี */}
            <g>
                <circle cx="527" cy="68" r="20" fill="#FFF8EE" stroke="#87503C" strokeWidth="4" />
                <path d="M527 51 V54 M527 82 V85 M510 68 H513 M541 68 H544" stroke="#B9683F" strokeWidth="2" strokeLinecap="round" />
                <path d="M527 68 H516 M527 68 V55" stroke="#4D3651" strokeWidth="2.6" strokeLinecap="round" />
                <circle cx="527" cy="68" r="2.4" fill="#C08A2E" />
            </g>

            {/* ---------- โต๊ะทำงาน ---------- */}
            <rect x="0" y="206" width="560" height="74" fill="url(#u4s-desk)" />
            <rect x="0" y="206" width="560" height="5" fill="#FFEBD2" opacity=".3" />
            <path d="M0 232 C120 226 220 238 340 232 S500 226 560 234 M0 256 C90 262 200 250 310 258 S470 262 560 254" stroke="#fff" strokeOpacity=".07" strokeWidth="2" fill="none" />

            {/* ต้นไม้ */}
            <path d="M42 190 C30 170 26 158 30 146 C42 156 44 172 42 190Z" fill="#86B08A" />
            <path d="M42 190 C54 170 62 160 60 148 C48 156 44 172 42 190Z" fill="#5F9070" />
            <path d="M42 190 C40 168 42 152 44 140 C50 158 46 174 42 190Z" fill="#74A27C" />
            <path d="M27 190 H57 L53 214 H31 Z" fill="#FFF0E0" />
            <path d="M27.8 194 H56.2 L55.4 198 H28.6 Z" fill="#D8895E" />

            {/* แก้วกาแฟ + ไอน้ำ */}
            <path d="M132 199 H138 a5 5 0 0 1 0 10 H132" stroke="#FFF6EC" strokeWidth="3" fill="none" />
            <rect x="108" y="194" width="24" height="20" rx="5" fill="#FFF6EC" />
            <rect x="108" y="203" width="24" height="3" fill="#D8895E" />
            <ellipse cx="120" cy="195" rx="11" ry="3" fill="#7B4B3A" />
            <g className="u4s-steam" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round">
                <path d="M115 189 C111 183 119 179 115 173" />
                <path d="M122 188 C118 182 126 178 122 171" />
            </g>

            {/* แล็ปท็อป */}
            <rect x="168" y="138" width="132" height="70" rx="7" fill="#3A2A3F" />
            <rect x="174" y="144" width="120" height="58" rx="3" fill="url(#u4s-screen)" />
            <rect x="156" y="207" width="156" height="7" rx="3.5" fill="#E6D2BE" />
            <rect x="222" y="207" width="24" height="3" rx="1.5" fill="#C9B39D" />

            {/* แฟ้มคดี 04 */}
            <rect x="322" y="176" width="54" height="38" rx="4" fill="#EBC186" />
            <rect x="322" y="169" width="24" height="9" rx="3" fill="#DDAF6F" />
            <rect x="330" y="186" width="38" height="18" rx="2" fill="#FFFDF5" />
            <text x="346" y="199.5" fontFamily="Cinzel, serif" fontSize="12" fontWeight="700" fill="#8A5F14" textAnchor="middle">
                04
            </text>
            <circle cx="366" cy="187" r="7.5" fill="none" stroke="#C4503C" strokeWidth="1.8" opacity=".8" />
            <path d="M362.5 187 L365 189.6 L369.5 184.6" fill="none" stroke="#C4503C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity=".8" />

            {/* กระเป๋าเอกสาร */}
            <path d="M470 178 V172 a4 4 0 0 1 4 -4 H494 a4 4 0 0 1 4 4 V178" fill="none" stroke="#4A2A3E" strokeWidth="4" />
            <rect x="452" y="176" width="64" height="38" rx="7" fill="#6B3F52" />
            <path d="M452 193 H516" stroke="#4A2A3E" strokeWidth="2" />
            <rect x="470" y="189" width="8" height="10" rx="2" fill="url(#u4s-gold)" />
            <rect x="490" y="189" width="8" height="10" rx="2" fill="url(#u4s-gold)" />
            <rect x="456" y="179" width="56" height="3" rx="1.5" fill="#fff" opacity=".12" />

            {/* โคมไฟตั้งโต๊ะ */}
            <ellipse cx="414" cy="212" rx="20" ry="5" fill="#5A3A55" />
            <path d="M414 210 L436 170 L398 136" fill="none" stroke="#5A3A55" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="436" cy="170" r="3.6" fill="#C08A2E" />
            <path d="M380 152 A18 18 0 0 1 416 152 Z" fill="url(#u4s-shade)" />
            <path d="M385 148 A14 14 0 0 1 396 139" fill="none" stroke="#fff" strokeOpacity=".4" strokeWidth="2" strokeLinecap="round" />
            <rect x="378" y="151" width="40" height="3" rx="1.5" fill="#A85A34" />

            {/* ของบนโต๊ะด้านหน้า : สมุด + ปากกา */}
            <g>
                <rect x="186" y="234" width="88" height="34" rx="3" fill="#6B4A6E" />
                <rect x="190" y="230" width="80" height="32" rx="2" fill="#FFF8EA" />
                <path d="M198 238 H262 M198 244 H262 M198 250 H240" stroke="#E4D2B6" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M262 226 L296 256" stroke="#C08A2E" strokeWidth="3.4" strokeLinecap="round" />
                <path d="M292 252.6 L296 256" stroke="#4D3651" strokeWidth="3.4" strokeLinecap="round" />
            </g>

            {/* แว่นขยาย */}
            <g>
                <path d="M366 250 L380 264" stroke="#6B3F52" strokeWidth="6" strokeLinecap="round" />
                <circle cx="356" cy="240" r="14" fill="#fff" fillOpacity=".3" stroke="#C08A2E" strokeWidth="4" />
                <path d="M348 235 a10 10 0 0 1 8 -5" fill="none" stroke="#fff" strokeOpacity=".85" strokeWidth="2" strokeLinecap="round" />
            </g>

            {/* โทรศัพท์วางอยู่ */}
            <g transform="rotate(8 424 250)">
                <rect x="410" y="228" width="28" height="46" rx="6" fill="#3A2A3F" />
                <rect x="413" y="232" width="22" height="38" rx="3.5" fill="#F7E9D9" />
                <rect x="416.5" y="237" width="15" height="9" rx="2" fill="#fff" stroke="#E4D2B6" strokeWidth="1" />
                <circle cx="421" cy="241.5" r="2.6" fill="url(#u4s-gold)" />
                <path d="M416.5 252 H431.5 M416.5 257 H428" stroke="#D9C4A6" strokeWidth="1.8" strokeLinecap="round" />
            </g>

            {/* แสงไล่เงาขอบภาพ + ห้องมืดก่อนเปิดไฟ */}
            <rect width="560" height="280" fill="url(#u4s-vignette)" />
            <rect className="u4s-dim" width="560" height="280" fill="#2A1B3A" />

            {/* หน้าจอแล็ปท็อปติดขึ้นมา */}
            <g className="u4s-screen-on">
                <circle cx="234" cy="174" r="32" fill="#FFDC8C" opacity=".22" />
                <rect x="182" y="150" width="20" height="3" rx="1.5" fill="#fff" opacity=".25" />
                <rect x="206" y="150" width="12" height="3" rx="1.5" fill="#fff" opacity=".18" />
                <path d="M234 154 L252 160 V174 C252 186 244 192 234 196 C224 192 216 186 216 174 V160 Z" fill="url(#u4s-gold)" />
                <path d="M225 174 L232 181 L244 167" fill="none" stroke="#4C3858" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </g>

            {/* โคมไฟติด : เป็นแสงเดียวที่ไม่โดนความมืดทับ */}
            <g className="u4s-lamp-on">
                <path d="M388 158 H408 L472 214 H336 Z" fill="url(#u4s-cone)" />
                <circle className="u4s-glow" cx="398" cy="158" r="96" fill="url(#u4s-lampglow)" />
                <circle cx="398" cy="157" r="5.5" fill="#FFF6C4" />
            </g>
        </svg>
    );
}

export default function PreBookIntro() {
    const navigate = useNavigate();
    const [lit, setLit] = useState(false); // โคมไฟ
    const [toast, setToast] = useState("hidden"); // "hidden" | "scam" | "caught"

    /* จังหวะเปิดหน้า: ห้องมืด -> โคมไฟติด -> ตราประทับ -> แจ้งเตือนเด้ง */
    useEffect(() => {
        const calm = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        const timers = [
            setTimeout(() => setLit(true), calm ? 0 : 500),
            setTimeout(() => setToast("scam"), calm ? 0 : 3200),
        ];
        return () => timers.forEach(clearTimeout);
    }, []);

    /* แจ้งเตือนหายเองเหมือนแบนเนอร์จริง */
    useEffect(() => {
        if (toast === "hidden") return undefined;
        const t = setTimeout(() => setToast("hidden"), toast === "scam" ? 9000 : 6500);
        return () => clearTimeout(t);
    }, [toast]);

    return (
        <main className="unit4-preintro">
            <div className="unit4-preintro-beam" aria-hidden="true" />
            <div className="unit4-preintro-glow unit4-preintro-glow-one" aria-hidden="true" />
            <div className="unit4-preintro-glow unit4-preintro-glow-two" aria-hidden="true" />
            <div className="unit4-preintro-glow unit4-preintro-glow-three" aria-hidden="true" />

            {SPARKLES.map(({ size, delay, ...pos }, i) => (
                <span
                    key={i}
                    className="unit4-preintro-sparkle"
                    aria-hidden="true"
                    style={{ ...pos, "--s": `${size}px`, "--d": delay }}
                />
            ))}

            {FLOATERS.map(({ Icon, size, delay, ...pos }, i) => (
                <span
                    key={i}
                    className="unit4-preintro-floater"
                    aria-hidden="true"
                    style={{ ...pos, fontSize: size, "--d": delay }}
                >
                    <Icon />
                </span>
            ))}

            <button
                className="unit4-preintro-home"
                onClick={() => navigate("/map")}
                aria-label="กลับไปหน้าหลัก"
            >
                <FaHouse size={15} />
                <span>หน้าหลัก</span>
            </button>

            <section className="unit4-preintro-card" aria-labelledby="unit4-preintro-title">
                {/* ป้ายหน้าแฟ้มคดี */}
                <div className="unit4-preintro-label">
                    <span className="unit4-preintro-label-a">INTEGRITY QUEST</span>
                    <span className="unit4-preintro-label-b">CASE FILE 04</span>
                </div>

                {/* มุมกรอบ เหมือนหน้าปกคู่มือ */}
                <i className="unit4-preintro-corner unit4-preintro-corner-tl" aria-hidden="true" />
                <i className="unit4-preintro-corner unit4-preintro-corner-tr" aria-hidden="true" />
                <i className="unit4-preintro-corner unit4-preintro-corner-bl" aria-hidden="true" />
                <i className="unit4-preintro-corner unit4-preintro-corner-br" aria-hidden="true" />

                <div className="unit4-preintro-stage">
                    <ul className="unit4-preintro-notes" aria-label="เคล็ดลับกันโดนโกง">
                        {TIPS.map((tip, i) => (
                            <li
                                key={tip.text}
                                className={`unit4-preintro-note unit4-preintro-note-${i + 1} is-${tip.tone}`}
                            >
                                <span className="unit4-preintro-pin" aria-hidden="true" />
                                {tip.text}
                            </li>
                        ))}
                    </ul>

                    <div className="unit4-preintro-scene" data-lit={lit}>
                        <span className="unit4-preintro-tape unit4-preintro-tape-l" aria-hidden="true" />
                        <span className="unit4-preintro-tape unit4-preintro-tape-r" aria-hidden="true" />

                        <NightBeforeScene />

                        {/* แตะโคมไฟเพื่อเปิด/ปิดไฟ */}
                        <button
                            type="button"
                            className="unit4-preintro-lamp"
                            aria-pressed={lit}
                            aria-label={lit ? "ปิดโคมไฟ" : "เปิดโคมไฟ"}
                            onClick={() => setLit((v) => !v)}
                        />

                        <div className="unit4-preintro-stamp" aria-hidden="true">
                            <span>NEW CASE</span>
                            <b>คดีที่ 04</b>
                        </div>

                        {/* แจ้งเตือนธนาคารปลอม : แตะแล้วเฉลยว่าทำไมน่าสงสัย */}
                        <div className="unit4-preintro-toast-slot" aria-live="polite">
                            <button
                                type="button"
                                className="unit4-preintro-toast"
                                data-state={toast}
                                tabIndex={toast === "hidden" ? -1 : 0}
                                aria-hidden={toast === "hidden"}
                                onClick={() => setToast(toast === "scam" ? "caught" : "hidden")}
                            >
                                <span className="unit4-preintro-toast-icon" aria-hidden="true">
                                    {toast === "caught" ? <FaCircleCheck /> : <FaBuildingColumns />}
                                </span>
                                <span className="unit4-preintro-toast-text">
                                    <strong>{toast === "caught" ? "จับได้แล้ว!" : "แจ้งเตือนธนาคาร"}</strong>
                                    <span>
                                        {toast === "caught"
                                            ? "คำว่า “ด่วน” มีไว้ให้เรารีบโดยไม่ทันคิด"
                                            : "ยอดเงินเข้า 49,000 บาท โอนคืนด่วน อย่าช้า!"}
                                    </span>
                                </span>
                            </button>
                        </div>
                    </div>

                    <p className="unit4-preintro-ticker" aria-hidden="true">
                        {TIPS.map((tip) => (
                            <span key={tip.text}>{tip.text}</span>
                        ))}
                    </p>
                </div>

                <div className="unit4-preintro-copy">
                    <p className="unit4-preintro-greeting">
                        <FaMoon size={13} aria-hidden="true" />
                        คืนสุดท้ายก่อนเริ่มงานวันแรก
                    </p>
                    <h1 id="unit4-preintro-title">
                        <span>คืนนี้ซ้อมจับโกง</span> <span>พรุ่งนี้ไม่โดนหลอก</span>
                    </h1>
                    <div className="unit4-preintro-rule" aria-hidden="true" />
                    <p className="unit4-preintro-description">
                        สลิปปลอม บัญชีม้า ชวนลงทุนหวังรวย เว็บพนัน
                        กลโกงเหล่านี้เดินเข้ามาถึงที่ทำงานได้
                        คู่มือเล่มนี้จะพาฝึกสังเกตทีละภารกิจ
                        ให้พรุ่งนี้คุณก้าวเข้าบริษัทอย่างมั่นใจ
                    </p>
                </div>

                <div className="unit4-preintro-cta-wrap">
                    <button
                        className="unit4-preintro-cta"
                    onClick={() => navigate("/unit4/book")}
                    >
                        <span>เปิดคู่มือ เริ่มซ้อมเลย</span>
                        <span className="unit4-preintro-cta-arrow" aria-hidden="true">
                            <FaArrowRight size={15} />
                        </span>
                    </button>
                </div>

                <ul className="unit4-preintro-perks">
                    <li>
                        <FaBookOpen size={14} aria-hidden="true" />
                        อ่านสั้น ๆ
                    </li>
                    <li>
                        <FaGamepad size={16} aria-hidden="true" />
                        เล่นทีละภารกิจ
                    </li>
                    <li>
                        <FaRocket size={14} aria-hidden="true" />
                        พร้อมลุยวันแรก
                    </li>
                </ul>
            </section>
        </main>
    );
}
