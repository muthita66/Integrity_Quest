import React, { useState, useRef } from 'react';
import bgGame from "../../assets/bg_game.png";
import Vegetable from '../../assets/unit2/Vegetable.png';
import Ticket from '../../assets/unit2/Ticket.png';
import Bill from '../../assets/unit2/utility-bill.png';
import LuxuryBags from '../../assets/unit2/shopping-bag.png';
import Coffee from '../../assets/unit2/expresso.png';
import Car from '../../assets/unit2/car.png';
import Medicine from '../../assets/unit2/medicine.png';
import SmartPhone from '../../assets/unit2/smartphone.png';
import House from '../../assets/unit2/house.png';
import Shirt from '../../assets/unit2/shirt.png';
import { FaTimes } from "react-icons/fa";
import { GiPartyPopper } from "react-icons/gi";



// ข้อมูลไอเทมเริ่มต้น
const INITIAL_ITEMS = [
    { id: 1, icon: <img src={Vegetable} alt="ผัก" className="w-10 h-10 object-contain" />, name: 'ผัก', type: 'need' },
    { id: 2, icon: <img src={Ticket} alt="ตั๋ว" className="w-10 h-10 object-contain" />, name: 'ตั๋ว', type: 'want' },
    { id: 3, icon: <img src={Bill} alt="ค่าใช้จ่าย" className="w-10 h-10 object-contain" />, name: 'ค่าใช้จ่าย', type: 'need' },
    { id: 4, icon: <img src={LuxuryBags} alt="กระเป๋าแบรนด์" className="w-10 h-10 object-contain" />, name: 'กระเป๋าแบรนด์', type: 'want' },
    { id: 5, icon: <img src={Coffee} alt="กาแฟหรู" className="w-10 h-10 object-contain" />, name: 'กาแฟหรู', type: 'want' },
    { id: 6, icon: <img src={Car} alt="รถยนต์" className="w-10 h-10 object-contain" />, name: 'รถยนต์', type: 'need' },
    { id: 7, icon: <img src={Medicine} alt="ยา" className="w-10 h-10 object-contain" />, name: 'ยา', type: 'need' },
    { id: 8, icon: <img src={SmartPhone} alt="มือถือรุ่นใหม่" className="w-10 h-10 object-contain" />, name: 'มือถือรุ่นใหม่', type: 'want' },
    { id: 9, icon: <img src={House} alt="ที่อยู่อาศัย" className="w-10 h-10 object-contain" />, name: 'ที่อยู่อาศัย', type: 'need' },
    { id: 10, icon: <img src={Shirt} alt="เสื้อผ้า" className="w-10 h-10 object-contain" />, name: 'เสื้อผ้า', type: 'need' },
];

export default function ShoppingGame() {
    // สร้าง State สำหรับเก็บไอเทมในแต่ละโซน
    const [poolItems, setPoolItems] = useState(INITIAL_ITEMS);
    const [needsBasket, setNeedsBasket] = useState([]);
    const [wantsBasket, setWantsBasket] = useState([]);

    // State สำหรับควบคุมหน้าจอสรุปผล (สเตตัส: null = กำลังเล่น, 'pass' = ผ่าน, 'fail' = ไม่ผ่าน)
    const [gameResult, setGameResult] = useState(null);

    const draggedItemRef = useRef(null);
    const touchActiveItemRef = useRef(null);
    const sourceZoneRef = useRef(null); // จำว่าลากมาจากไหน (pool, need, want)

    // --- ระบบ Drag & Drop (สำหรับ PC) ---
    const handleDragStart = (e, item, sourceZone) => {
        draggedItemRef.current = item;
        sourceZoneRef.current = sourceZone;
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e, targetZone) => {
        e.preventDefault();
        const item = draggedItemRef.current;
        const sourceZone = sourceZoneRef.current;
        if (!item || sourceZone === targetZone) return;

        moveItemBetweenZones(item, sourceZone, targetZone);
        draggedItemRef.current = null;
    };

    // --- ระบบ Touch Dragging (สำหรับมือถือ) ---
    const handleTouchStart = (e, item, sourceZone) => {
        touchActiveItemRef.current = item;
        sourceZoneRef.current = sourceZone;
        e.currentTarget.style.zIndex = '50';
    };

    const handleTouchMove = (e) => {
        if (!touchActiveItemRef.current) return;
        if (e.cancelable) e.preventDefault();

        const touch = e.touches[0];
        const el = e.currentTarget;
        const rect = el.getBoundingClientRect();

        // แสดงผลตัวไอเทมเคลื่อนที่ตามนิ้วมือแบบสัมพัทธ์กับหน้าจอ
        el.style.position = 'fixed';
        el.style.left = `${touch.clientX - rect.width / 2}px`;
        el.style.top = `${touch.clientY - rect.height / 2}px`;
    };

    const handleTouchEnd = (e) => {
        const item = touchActiveItemRef.current;
        const sourceZone = sourceZoneRef.current;
        if (!item) return;

        const el = e.currentTarget;
        el.style.position = '';
        el.style.left = '';
        el.style.top = '';
        el.style.zIndex = '';

        const touch = e.changedTouches[0];
        const poolEl = document.getElementById('zone-pool');
        const needsEl = document.getElementById('zone-need');
        const wantsEl = document.getElementById('zone-want');

        let targetZone = null;
        if (isInside(touch.clientX, touch.clientY, poolEl)) targetZone = 'pool';
        else if (isInside(touch.clientX, touch.clientY, needsEl)) targetZone = 'need';
        else if (isInside(touch.clientX, touch.clientY, wantsEl)) targetZone = 'want';

        if (targetZone && targetZone !== sourceZone) {
            moveItemBetweenZones(item, sourceZone, targetZone);
        }

        touchActiveItemRef.current = null;
    };

    const isInside = (x, y, element) => {
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    };

    // --- ฟังก์ชันย้ายไอเทมข้ามโซนไปมาอิสระ ---
    const moveItemBetweenZones = (item, source, target) => {
        // 1. ลบออกจากโซนเดิม
        if (source === 'pool') setPoolItems(prev => prev.filter(i => i.id !== item.id));
        if (source === 'need') setNeedsBasket(prev => prev.filter(i => i.id !== item.id));
        if (source === 'want') setWantsBasket(prev => prev.filter(i => i.id !== item.id));

        // 2. เพิ่มเข้าโซนใหม่
        if (target === 'pool') setPoolItems(prev => [...prev, item]);
        if (target === 'need') setNeedsBasket(prev => [...prev, item]);
        if (target === 'want') setWantsBasket(prev => [...prev, item]);
    };

    // --- ปุ่มตรวจคำตอบหลังจากลากครบแล้ว ---
    const checkAnswers = () => {
        // เช็คว่าไอเทมในตะกร้า Needs มีชิ้นไหนที่เป็น want ปนอยู่ไหม
        const hasWrongInNeeds = needsBasket.some(item => item.type !== 'need');
        // เช็คว่าไอเทมในตะกร้า Wants มีชิ้นไหนที่เป็น need ปนอยู่ไหม
        const hasWrongInWants = wantsBasket.some(item => item.type !== 'want');

        if (hasWrongInNeeds || hasWrongInWants) {
            setGameResult('fail');
        } else {
            setGameResult('pass');
        }
    };

    // ฟังก์ชันเริ่มเล่นใหม่
    const resetGame = () => {
        setPoolItems(INITIAL_ITEMS);
        setNeedsBasket([]);
        setWantsBasket([]);
        setGameResult(null);
    };

    const nextLevel = () => {
        alert('กำลังพาท่านไปยังด่านต่อไป... (Level 2)');
        resetGame();
    };

    // เช็คว่าลากของแยกใส่ตะกร้าจนหมดกองกลางหรือยัง
    const isAllPlaced = poolItems.length === 0;

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-cover bg-center bg-fixed"
            style={{
                backgroundImage: `url(${bgGame})`,
            }}
        >
            <div className="w-full max-w-5xl bg-white/90 backdrop-blur-sm rounded-3xl p-6 border-3 border-black shadow-2xl relative overflow-hidden text-center">

                {/* หัวข้อกิจกรรม */}
                <div className="absolute top-0 left-0 bg-orange-600 hover:bg-orange-500 text-white font-bold px-6 py-2 rounded-br-2xl text-lg shadow-md">
                    Unit 2: กับดักความอยาก
                </div>

                <h2 className="text-2xl mt-8 md:text-3xl font-black text-slate-700 tracking-wider">Level 1: Shopping Basket</h2>
                <p className="text-sm md:text-base text-slate-600 font-medium mt-2 mb-6">
                    วิธีการเล่น : แยกของใส่ <span className="font-bold text-emerald-600">" ตะกร้าจำเป็น (Needs) "</span> และ <span className="font-bold text-amber-600">" ตะกร้าฟุ่มเฟือย (Wants)"</span> ให้ครบทุกชิ้น
                </p>

                {/* กองไอเทมเริ่มต้น (Pool) */}
                <div
                    id="zone-pool"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 'pool')}
                    className="relative min-h-[140px] bg-white/60 border-2 border-dashed border-slate-300 rounded-2xl p-4 mb-6 grid grid-cols-3 sm:grid-cols-5 gap-3 items-center justify-center transition-colors"
                >
                    {poolItems.map((item) => (
                        <div
                            key={item.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, item, 'pool')}
                            onTouchStart={(e) => handleTouchStart(e, item, 'pool')}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                            className="bg-white border-2 border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing hover:scale-105 hover:shadow-md transition-all touch-none"
                        >
                            <span className="text-3xl md:text-4xl mb-1">{item.icon}</span>
                            <span className="text-xs md:text-sm font-bold text-slate-700">{item.name}</span>
                        </div>
                    ))}
                    {isAllPlaced && (
                        <p className="col-span-full text-emerald-600 font-bold animate-pulse">จัดวางลงตะกร้าครบแล้ว!</p>
                    )}
                </div>

                {/* โซนตะกร้าทั้งสองใบ */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 mb-6">

                    {/* ตะกร้า Needs */}
                    <div
                        id="zone-need"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, 'need')}
                        className="border-2 border-slate-700 rounded-2xl p-4 bg-slate-50 min-h-[240px] flex flex-col justify-between items-center"
                    >
                        <div className="flex flex-wrap gap-2 justify-center content-start w-full min-h-[140px] p-2 bg-white/40 rounded-xl border border-dashed border-slate-200">
                            {needsBasket.map((item) => (
                                <div
                                    key={item.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, item, 'need')}
                                    onTouchStart={(e) => handleTouchStart(e, item, 'need')}
                                    onTouchMove={handleTouchMove}
                                    onTouchEnd={handleTouchEnd}
                                    className="bg-white border border-slate-200 rounded-lg p-2 text-center text-2xl shadow-sm cursor-grab touch-none"
                                    title={item.name}
                                >
                                    {item.icon}
                                </div>
                            ))}
                        </div>
                        <div className="w-3/5 border-2 border-slate-700 bg-white font-extrabold text-xl py-2 rounded-xl text-emerald-700 shadow-sm ">
                            Needs
                        </div>
                    </div>

                    {/* ตะกร้า Wants */}
                    <div
                        id="zone-want"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, 'want')}
                        className="border-2 border-slate-700 rounded-2xl p-4 bg-slate-50 min-h-[240px] flex flex-col justify-between items-center"
                    >
                        <div className="flex flex-wrap gap-2 justify-center content-start w-full min-h-[140px] p-2 bg-white/40 rounded-xl border border-dashed border-slate-200">
                            {wantsBasket.map((item) => (
                                <div
                                    key={item.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, item, 'want')}
                                    onTouchStart={(e) => handleTouchStart(e, item, 'want')}
                                    onTouchMove={handleTouchMove}
                                    onTouchEnd={handleTouchEnd}
                                    className="bg-white border border-slate-200 rounded-lg p-2 text-center text-2xl shadow-sm cursor-grab touch-none"
                                    title={item.name}
                                >
                                    {item.icon}
                                </div>
                            ))}
                        </div>
                        <div className="w-3/5 border-2 border-slate-700 bg-white font-extrabold text-xl py-2 rounded-xl text-amber-600 shadow-sm">
                            Wants
                        </div>
                    </div>

                </div>

                {/* ปุ่มตรวจคำตอบ (จะปรากฏขึ้นมาเมื่อจัดของลงตะกร้าครบ 10 ชิ้นแล้วเท่านั้น) */}
                {isAllPlaced && gameResult === null && (
                    <button
                        onClick={checkAnswers}
                        className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xl rounded-2xl shadow-lg transform active:scale-95 transition-all animate-bounce-short"
                    >
                        FINISH
                    </button>
                )}

                {/* ================= หน้าจอ POPUP สรุปผลลัพธ์ท้ายเกม ================= */}

                {/* 1. กรณี: แยกถูกหมดทั้งหมด (ผ่าน) */}
                {gameResult === 'pass' && (
                    <div className="absolute inset-0 bg-white/95 flex flex-col justify-center items-center p-6 z-50">
                        <span className="text-6xl mb-2" style={{ background: 'linear-gradient(90deg, #ff0000, #ff8c00, #ffd700, #00c853, #2979ff, #ab47bc)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{<GiPartyPopper />}</span>
                        <h2 className="text-3xl md:text-4xl font-green text-emerald-600 mb-2">ผ่านฉลุย! คุณแยกแยะสำเร็จแล้ว</h2>
                        <p className="text-base md:text-lg text-slate-600 max-w-md font-medium mb-6">
                            ยอดเยี่ยมมาก คุณเข้าใจความแตกต่างระหว่างสิ่งที่จำเป็นและสิ่งที่ต้องการอย่างถูกต้องครบถ้วน!
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={resetGame}
                                className="px-6 py-3 bg-slate-500 hover:bg-slate-600 text-white font-bold text-lg rounded-xl shadow-md transition-all"
                            >
                                REPLAY
                            </button>
                            <button
                                onClick={nextLevel}
                                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg rounded-xl shadow-md transform active:scale-95 transition-all"
                            >
                                CONTINUE
                            </button>
                        </div>
                    </div>
                )}

                {/* 2. กรณี: มีชิ้นที่แยกผิดอยู่ (ไม่ผ่าน) */}
                {gameResult === 'fail' && (
                    <div className="absolute inset-0 bg-white/95 flex flex-col justify-center items-center p-6 z-50">
                        <span className="text-7xl mb-2 text-red-500"><FaTimes /></span>
                        <h2 className="text-3xl md:text-4xl font-black text-rose-600 mb-2 tracking-normal">ยังไม่ผ่านนะ!</h2>
                        <p className="text-base md:text-lg text-slate-600 max-w-md font-medium mb-6">
                            ดูเหมือนว่าจะมีของบางชิ้นสลับตะกร้ากันอยู่ <br />
                            ลองมาทบทวนพิจารณาใหม่อีกสักรอบนะ
                        </p>
                        <button
                            onClick={resetGame}
                            className="px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold text-lg rounded-xl shadow-md transform active:scale-95 transition-all"
                        >
                            REPLAY AGAIN
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}