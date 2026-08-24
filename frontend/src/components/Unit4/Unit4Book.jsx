import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import BookLayout from "./BookLayout";
import "./styles/theme.css";

export default function Unit4Book() {
    const navigate = useNavigate();
    const [progress, setProgress] = useState({ level1: true, level2: false, level3: false });

    useEffect(() => {
        try {
            const save = JSON.parse(localStorage.getItem("unit4"));
            if (save) setProgress(save);
        } catch (e) {
            console.error(e);
        }
    }, []);

    const chapters = [
        {
            id: 1,
            title: "Chapter I",
            subtitle: "Fake Transfer Slip",
            desc: "สืบสวนและตรวจสอบสลิปการโอนเงินปลอม หาจุดผิดปกติของหลักฐาน",
            unlocked: true,
            route: "/unit4/level1/intro",
        },
        {
            id: 2,
            title: "Chapter II",
            subtitle: "Slot Machine Scam",
            desc: "แกะรอยกับดักพนันออนไลน์และกลโกงบัญชีม้า",
            unlocked: Boolean(progress.level2),
            route: "/unit4/level2/intro",
        },
        {
            id: 3,
            title: "Chapter III",
            subtitle: "Final Mission",
            desc: "ภารกิจรวบรวมหลักฐานชิ้นสุดท้ายเพื่อเปิดโปงเครือข่าย",
            unlocked: Boolean(progress.level3),
            route: "/unit4/level3/intro",
        },
    ];

    return (
        <BookLayout
            title="Table of Contents"
            subtitle="เลือกภารกิจที่ต้องการสืบสวน"
            onBack={() => navigate("/map")}
            leftPage={
                <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
                    <div>
                        <div style={{
                            padding: 20, borderRadius: 16, background: "rgba(255,255,255,0.5)",
                            border: "1px dashed var(--paper-border)", marginBottom: 20
                        }}>
                            <h3 style={{ margin: "0 0 8px 0", color: "var(--text-primary)", fontFamily: "var(--font-title)", fontSize: 16 }}>
                                📜 คำชี้แจงนักสืบ
                            </h3>
                            <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.6 }}>
                                คุณต้องทำภารกิจให้สำเร็จทีละขั้นตอนเพื่อรับ Badge และปลดล็อกแฟ้มคดีถัดไป หากพบข้อสงสัยให้ตรวจสอบหลักฐานอย่างละเอียดก่อนตัดสินใจ
                            </p>
                        </div>
                    </div>

                    {/* Progress Card */}
                    <div style={{ padding: 20, borderRadius: 16, background: "#FFF", border: "1px solid var(--paper-border)", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12, fontWeight: 700, color: "var(--text-gold)" }}>
                            <span>UNIT PROGRESS</span>
                            <span>{((progress.level1 ? 1 : 0) + (progress.level2 ? 1 : 0) + (progress.level3 ? 1 : 0))} / 3</span>
                        </div>
                        <div style={{ height: 8, borderRadius: 99, background: "#E2E8F0", overflow: "hidden" }}>
                            <div style={{
                                height: "100%", background: "var(--gold-gradient)",
                                width: `${(((progress.level1 ? 1 : 0) + (progress.level2 ? 1 : 0) + (progress.level3 ? 1 : 0)) / 3) * 100}%`
                            }} />
                        </div>
                    </div>
                </div>
            }
            rightPage={
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {chapters.map((item) => (
                        <motion.div
                            key={item.id}
                            whileHover={item.unlocked ? { scale: 1.02, x: 4 } : {}}
                            onClick={() => item.unlocked && navigate(item.route)}
                            style={{
                                padding: 18, borderRadius: 16,
                                background: item.unlocked ? "#FFF" : "rgba(241, 245, 249, 0.6)",
                                border: item.unlocked ? "1px solid #E2E8F0" : "1px solid #CBD5E1",
                                boxShadow: item.unlocked ? "0 4px 12px rgba(0,0,0,0.04)" : "none",
                                cursor: item.unlocked ? "pointer" : "not-allowed",
                                display: "flex", flexDirection: "column", gap: 8,
                                opacity: item.unlocked ? 1 : 0.6,
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-gold)", fontFamily: "var(--font-title)" }}>
                                    {item.title}
                                </span>
                                <span style={{ fontSize: 18 }}>{item.unlocked ? "📖" : "🔒"}</span>
                            </div>
                            <h3 style={{ margin: 0, fontSize: 18, color: "var(--text-primary)", fontWeight: 700 }}>
                                {item.subtitle}
                            </h3>
                            <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                                {item.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            }
        />
    );
}