import { useState } from "react";
import { FaChevronRight, FaEnvelopeOpenText, FaShieldAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import BookLayout from "../BookLayout";
import janeImg from "../../../assets/unit4/Jane.png";
import "../../../styles/theme.css";
import "./level3.css";

const CHAT = [
    { from: "jane", text: "บีบี รับข้อความได้ไหม? บริษัทกำลังถูกโจมตีด่วนมาก" },
    { from: "bb", text: "รับแล้วค่ะพี่เจน เกิดอะไรขึ้นคะ?" },
    { from: "jane", text: "ทั้งสลิปปลอม ลิงก์ดูดเงิน ข่าวปลอม และโฆษณาพนันออนไลน์เข้ามาพร้อมกัน" },
    { from: "jane", text: "ความรู้จากสองภารกิจก่อนหน้านี้ ถึงเวลานำมาใช้จริงแล้ว" },
    { from: "bb", text: "เข้าใจแล้วค่ะ หนูจะช่วยสร้าง Firewall ปกป้องฐานข้อมูลเอง!" },
];

export default function IntroScene() {
    const navigate = useNavigate();
    const [chatOpen, setChatOpen] = useState(false);
    const [visibleMessages, setVisibleMessages] = useState(2);
    const chatFinished = visibleMessages === CHAT.length;

    return (
        <BookLayout
            title="บทที่ 3 — ภารกิจสุดท้าย"
            subtitle="ข้อความด่วนจากพี่เจน"
            rightLabel="FINAL MISSION"
            rightNote={chatOpen ? "อ่านข้อความใหม่" : "มีการแจ้งเตือนใหม่"}
            onBack={() => navigate("/unit4/book")}
            leftPage={
                <div className="level3-intro-scene">
                    <div className="level3-intro-phone level3-phone-compact">
                        <div className="level3-intro-notch"><span /></div>
                        <div className="level3-notification-screen">
                            <div className="level3-phone-status"><span>09:41</span><span>●●● ◒</span></div>
                            <div className="level3-notification-wallpaper">
                                <div className="level3-notification-date">วันนี้</div>
                                <div className="level3-notification-card">
                                    <div className="level3-notification-head"><img src={janeImg} alt="" /><div><strong>พี่เจน</strong><small>ข้อความใหม่ · เมื่อสักครู่</small></div></div>
                                    <p>ภารกิจด่วนมาก บีบีอ่านข้อความนี้แล้วติดต่อกลับพี่ด้วยนะ</p>
                                    <button type="button" onClick={() => setChatOpen(true)}><FaEnvelopeOpenText /> กดอ่าน</button>
                                </div>
                            </div>
                        </div>
                        <div className="level3-intro-home" />
                    </div>
                    <span className="level3-phone-caption">NEW MESSAGE / 01</span>
                </div>
            }
            rightPage={
                chatOpen ? (
                    <div className="level3-chat-screen level3-chat-book">
                        <div className="level3-chat-topbar"><span className="level3-chat-back">‹</span><img src={janeImg} alt="พี่เจน" /><div><strong>พี่เจน</strong><small>ออนไลน์</small></div><FaShieldAlt className="level3-chat-shield" /></div>
                        <div className="level3-chat-body">
                            <div className="level3-chat-date">วันนี้ 09:41</div>
                            {CHAT.slice(0, visibleMessages).map((message, index) => (
                                <div key={index} className={`level3-chat-row ${message.from === "bb" ? "is-bb" : ""}`}>
                                    {message.from === "jane" && <img src={janeImg} alt="" />}
                                    <div className="level3-chat-bubble">{message.text}<small>{index < 2 ? "09:41" : "09:42"}</small></div>
                                </div>
                            ))}
                        </div>
                        <div className="level3-chat-footer">
                            {!chatFinished ? <button type="button" onClick={() => setVisibleMessages((count) => Math.min(CHAT.length, count + 1))}>อ่านข้อความต่อ <FaChevronRight size={12} /></button> : <button type="button" onClick={() => navigate("/unit4/level3/game")}>เริ่มภารกิจ Firewall <FaShieldAlt size={13} /></button>}
                        </div>
                    </div>
                ) : (
                    <div className="level3-intro-brief"><span className="level3-intro-kicker">CASE FILE 03</span><div className="level3-intro-seal"><FaShieldAlt /></div><h2>มีข้อความใหม่</h2><p>กดอ่านการแจ้งเตือนจากพี่เจนบนโทรศัพท์ เพื่อเปิดห้องแชตภารกิจสุดท้าย</p><div className="level3-intro-steps"><span><b>01</b> ตรวจดูการแจ้งเตือน</span><span><b>02</b> กดอ่านข้อความ</span><span><b>03</b> อ่านแชตและเริ่มภารกิจ</span></div></div>
                )
            }
        />
    );
}
