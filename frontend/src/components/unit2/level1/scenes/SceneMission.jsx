import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import IntroDialog from "../../intro/IntroDialog";
import sceneMission from "../../../../assets/unit2/Level1/intro/sceneMission.png";

export default function SceneMission({ onBack, onNext, currentScene, totalScenes }) {
    const navigate = useNavigate();

    const handleStartGame = () => {
        navigate("/unit2/level1");
    };

    return (
        <div className="relative w-full h-screen overflow-hidden">
            {/* Background */}
            <img
                src={sceneMission}
                alt="Mission"
                className="absolute inset-0 w-full h-full object-cover object-center"
            />

            {/* Dialog */}
            <div className="absolute bottom-10 left-0 w-full z-10">
                <IntroDialog
                    speaker="ไกด์การเงิน"
                    title="ตลาดมหาวิทยาลัย"
                    text="ภารกิจของคุณคือค้นหาเอกสารข้อมูลสินค้าที่ซ่อนอยู่ในตลาดให้ครบ เพื่อนำมาวิเคราะห์แยกแยะ สิ่งจำเป็น (Need) และ สิ่งที่ต้องการ (Want) เพื่อการตัดสินใจทางการเงินอย่างมีเหตุผล"
                    onNext={handleStartGame}
                    onBack={onBack}
                    currentScene={currentScene}
                    totalScenes={totalScenes}
                />
            </div>
        </div>
    );
}
