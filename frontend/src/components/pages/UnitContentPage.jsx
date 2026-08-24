import React from 'react';
import bgGame from "../../assets/bg_game.png";
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { FaCircleArrowRight, FaHouse } from "react-icons/fa6";

export default function UnitContentPage() {
    const navigate = useNavigate();
    const [header, setHeader] = useState(null)
    const [cards, setCards] = useState([]);
    const { unitId } = useParams();
    // ดึงเฉพาะตัวเลขจาก unitId เช่น "unit2" -> 2
    const parsedUnitId = unitId ? unitId.replace(/\D/g, "") : "";
    const currentUnitId = Number(parsedUnitId) || 2;

    useEffect(() => {
        fetch(`http://localhost:5000/api/unitContent/${currentUnitId}/contents`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`HTTP Error ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                console.log(data);

                setHeader(data.header);
                setCards(data.cards);
            })
            .catch((err) => {
                console.error(err);
            });
    }, [currentUnitId]);

    const handleStart = () => {
        if (currentUnitId === 1) {
            navigate("/unit1/Level1IntroPage");
        } else if (currentUnitId === 2) {
            navigate("/unit2/intro");
        } else if (currentUnitId === 3) {
            navigate("/unit3/level1/intro");
        } else {
            navigate(`/unit${currentUnitId}/level1`);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-cover bg-center bg-fixed sarabun-medium relative"
            style={{
                backgroundImage: `url(${bgGame})`,
            }}
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]"></div>

            {/* หัวข้อ Unit มุมซ้ายบน — ติดขอบบนสุดของหน้า */}
            <div className="absolute top-0 left-0 z-20 bg-orange-600 text-white sarabun-semibold px-6 py-2 rounded-br-2xl text-lg shadow-md">
                Unit {currentUnitId}: {header?.name_th || header?.title || "กำลังโหลด..."}
            </div>

            {/* ปุ่มกลับหน้าหลัก มุมขวาบน — ติดขอบบนสุดของหน้า */}
            <button
                onClick={() => navigate("/map")}
                className="absolute top-3 right-4 z-20 flex items-center gap-2 bg-white/80 hover:bg-orange-600 hover:text-white text-orange-600 border-2 border-orange-600 px-2 py-2 rounded-full text-sm shadow-md transition-all duration-200 hover:scale-105"
            >
                <FaHouse size={24} />
            </button>

            {/* Content */}
            <div className="relative z-10 w-full px-6 py-8">

                {/* หัวข้อหลัก */}
                <div className="text-center mt-2 mb-4">
                    <h1 className="text-3xl sarabun-bold text-gray-800 tracking-wide uppercase">
                        {header?.title || header?.name_en}
                    </h1>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-[1300px] h-[550px] mx-auto">
                    {cards.length > 0 ? (
                        cards.map((item) => (
                            <div
                                key={item.content_id}
                                className="
                                border-[3px]
                                border-black
                                bg-white/90
                                rounded-2xl
                                px-4
                                py-4
                                flex
                                flex-col
                                items-center
                                justify-between
                                min-h-[450px]
                                shadow-lg
                            "
                            >
                                <h2 className="text-xl sarabun-bold text-center border-b pb-1 w-full">
                                    {item.title}
                                </h2>

                                <p className="mt-2 sarabun-light text-md text-center text-black whitespace-pre-line">
                                    {item.description}
                                </p>

                                <div className="flex-grow flex items-center justify-center my-4 w-full">
                                    <img
                                        src={`/image/${item.image_url}`}
                                        alt={item.title}
                                        className="max-h-64 max-w-full object-contain"
                                    />
                                </div>

                                <p className='sarabun-light text-md text-center justify-center text-black whitespace-pre-line'>
                                    {item.reflection}
                                </p>

                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 text-gray-700 font-bold">
                            กำลังโหลดข้อมูลบทเรียน...
                        </div>
                    )}
                </div>

                {/* ปุ่ม START */}
                <div className="flex justify-center mt-2 mb-2">
                    <button
                        onClick={handleStart}
                        className="w-[48px] h-[48px] bg-white/80 hover:bg-orange-600 hover:text-white text-orange-600 border-2 border-orange-600 px-2 py-2 rounded-full text-sm shadow-md transition-all duration-200 hover:scale-105"
                    >
                        <FaCircleArrowRight className="w-full h-full" />
                    </button>
                </div>

            </div>
        </div>
    );
}