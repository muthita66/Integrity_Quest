import React from 'react';
import bgGame from "../../assets/bg_game.png";
import { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";



export default function UnitContentPage() {
    const [header, setHeader] = useState(null)
    const [cards, setCards] = useState([]);
    const { unitId } = useParams();
    const currentUnitId = unitId || 2;
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
    }, []);
    return (
        <div
            className="min-h-screen flex items-center justify-center bg-cover bg-center bg-fixed"
            style={{
                backgroundImage: `url(${bgGame})`,
            }}
        >

            {/* Container หลักภายนอก */}
            <div className="w-full max-w-5xl bg-white/50 backdrop-blur-sm rounded-3xl p-6 border-4 border-black shadow-2xl relative overflow-hidden">

                {/* หัวข้อ Unit มุมซ้ายบน */}
                <div className="absolute top-0 left-0 bg-orange-600 hover:bg-orange-500 text-white font-bold px-6 py-2 rounded-br-2xl text-lg shadow-md">
                    Unit 2: กับดักความอยาก
                </div>

                {/* หัวข้อหลัก */}
                <div className="text-center mt-8 mb-6">
                    <h1 className="text-3xl font-black text-gray-800 tracking-wide uppercase">{header?.title}</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
                    {cards.map((item) => (
                        <div
                            key={item.content_id}
                            className="border-[3px] border-amber-900 bg-white rounded-2xl p-5 flex flex-col items-center justify-between min-h-[400px]"
                        >
                            <h2 className="text-xl font-bold text-center border-b pb-2 w-full">
                                {item.title}
                            </h2>

                            <div className="flex-grow flex items-center justify-center my-4">
                                <img
                                    src={`/image/${item.image_url}`}
                                    alt={item.title}
                                    className="max-h-56 object-contain"
                                />
                            </div>

                            <p className="text-sm text-center text-gray-700">
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
                {/* ปุ่ม START ด้านล่าง */}
                <div className="flex justify-center mt-8 mb-2">
                    <button className="bg-orange-600 hover:bg-orange-500 text-white font-black text-xl px-16 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all tracking-wider">
                        START
                    </button>
                </div>

            </div>
        </div>
    );
}