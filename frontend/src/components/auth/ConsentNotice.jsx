import { useState } from "react";
import { FiShield, FiArrowLeft } from "react-icons/fi";

export const CONSENT_VERSION = "1.0";

// ---------- แก้ข้อมูลโครงงานตรงนี้ ----------
const PROJECT_NAME = "เว็บแอปพลิเคชันเพื่อส่งเสริมความซื่อสัตย์ทางการเงินของนิสิต";
const AUTHOR_NAME = "นางสาวนารีรัตน์ วังศรี และนางสาวมุทิตา ปาละมี";
const ADVISOR_NAME = "ผศ.ดร.เกรียงศักดิ์ เตมีย์";
const CONTACT_EMAIL = "[EMAIL_ADDRESS]";
const AI_DISCLOSURE = ""; // ถ้ามีส่งข้อมูลไปให้ Gemini ประมวลผล ให้เติมข้อความตรงนี้

function Section({ title, children }) {
    return (
        <div className="mt-5">
            <h3 className="font-semibold text-gray-800">{title}</h3>
            <div className="mt-1 text-sm leading-relaxed text-gray-600">{children}</div>
        </div>
    );
}

export default function ConsentNotice({ onAgree, onDecline }) {
    const [agreed, setAgreed] = useState(false); // ห้าม default เป็น true

    const handleAgree = () => {
        if (!agreed) return;
        onAgree(new Date().toISOString(), CONSENT_VERSION);
    };

    return (
        <div className="mx-auto max-w-2xl">
            <div className="flex items-center gap-2 text-emerald-700">
                <FiShield size={20} />
                <h2 className="text-lg font-bold">หนังสือแสดงความยินยอมในการเก็บและใช้ข้อมูล</h2>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-gray-600">
                เว็บแอปพลิเคชัน Integrity Quest เป็นส่วนหนึ่งของโครงงานวิจัยเรื่อง
                "{PROJECT_NAME}"
                <br />ผู้จัดทำ: {AUTHOR_NAME}
                <br />อาจารย์ที่ปรึกษา: {ADVISOR_NAME}
                <br />สาขาวิทยาการคอมพิวเตอร์ คณะวิทยาศาสตร์ มหาวิทยาลัยนเรศวร
            </p>

            <div className="mt-4 overflow-hidden rounded-xl border border-gray-100">
                <div className="max-h-[45vh] overflow-y-auto bg-gray-50/60 p-4 pr-3 sm:p-5 sm:pr-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300">
                    <Section title="ข้อมูลที่เก็บ">
                        <ul className="list-disc space-y-1 pl-5">
                            <li>ข้อมูลทั่วไป ได้แก่ ชื่อ-สกุล เพศ อายุ ชั้นปี คณะ และสาขาวิชา</li>
                            <li>ข้อมูลการเข้าใช้งานระบบ</li>
                            <li>ข้อมูลการตัดสินใจและคะแนนจากการเล่นเกม</li>
                            <li>คำตอบจากแบบวัดทัศนคติและความเข้าใจก่อนและหลังเรียน</li>
                            <li>คำตอบจากแบบประเมินความพึงพอใจ</li>
                        </ul>
                    </Section>

                    <Section title="วัตถุประสงค์">
                        ใช้เพื่อการวิจัยนี้เท่านั้น คือศึกษาการเปลี่ยนแปลงด้านทัศนคติและความเข้าใจ
                        และประเมินความพึงพอใจต่อระบบ ผลจะนำเสนอในภาพรวม
                        ไม่เปิดเผยชื่อของผู้เข้าร่วมรายบุคคล
                    </Section>

                    <Section title="การเปิดเผยข้อมูล">
                        <p>ผู้ดูแลระบบและอาจารย์ผู้เกี่ยวข้องดูข้อมูลของคุณได้ผ่านแดชบอร์ด</p>
                        {AI_DISCLOSURE && <p className="mt-1">{AI_DISCLOSURE}</p>}
                    </Section>

                    <Section title="สิทธิของคุณ">
                        <ul className="list-disc space-y-1 pl-5">
                            <li>การเข้าร่วมเป็นความสมัครใจ ไม่เข้าร่วมก็ไม่มีผลต่อการเรียน</li>
                        </ul>
                    </Section>
                </div>
            </div>

            {/* checkbox ยินยอม — ต้องติ๊กก่อนปุ่มถึงจะกดได้ */}
            <label className="mt-5 flex cursor-pointer items-start gap-2.5 text-sm text-gray-700">
                <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-600"
                />
                <span>
                    ข้าพเจ้าได้อ่านและเข้าใจข้อความข้างต้น
                    และยินยอมให้เก็บและใช้ข้อมูลตามที่ระบุ
                </span>
            </label>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row">
                <button
                    type="button"
                    onClick={onDecline}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                    <FiArrowLeft size={16} />
                    ไม่ยินยอม
                </button>

                <button
                    type="button"
                    onClick={handleAgree}
                    disabled={!agreed}
                    className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                    ยินยอมและสมัครสมาชิก
                </button>
            </div>
        </div>
    );
}