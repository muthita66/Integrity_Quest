import { Search } from "lucide-react";
import bgGame1 from "../../../../assets/unit1/finalLevel/bgGame1.png";

export default function TitleScreen({ onStart }) {
    return (
        <div
            className="relative overflow-hidden text-center w-full h-full bg-cover bg-center flex items-center justify-center"
            style={{ backgroundImage: `url(${bgGame1})` }}
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/80 z-0" />

            {/* Content */}
            <div className="relative z-10 px-8 py-12">

                <h1
                    className="text-2xl font-bold mb-2 text-white"
                >
                    นักสืบการเงินแห่งมหาวิทยาลัย
                </h1>

                <p
                    className="text-lg mb-6 leading-relaxed text-white"
                >
                    รับบทเป็นนักสืบการเงินของมหาวิทยาลัย ตรวจสอบ 5 คดี <br />
                    เกี่ยวกับความซื่อสัตย์ทางการเงินของนักศึกษาและชมรม
                    เก็บหลักฐาน คัดเลือกเฉพาะหลักฐานที่เกี่ยวข้องจริง <br />
                    แล้วตัดสินใจให้ถูกต้องตามหลักความซื่อสัตย์
                </p>

                <button
                    type="button"
                    onClick={onStart}
                    className="result-button result-button-amber"
                >
                    <span className="result-button-top">เริ่มสืบคดี</span>
                </button>
            </div>
        </div>
    );
}