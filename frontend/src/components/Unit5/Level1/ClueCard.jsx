import { motion } from "framer-motion";
import { useRef } from "react";
import { createPortal } from "react-dom";

const rotations = [0.5, -1, 1, -0.5, 1, -1];

const explanations = [
  { match: "สิทธิพิเศษ", explanation: "เป็นการเสนอเงิน ของขวัญ หรือสิ่งตอบแทน เพื่อให้อีกฝ่ายช่วยให้ตนได้ประโยชน์ที่ไม่ควรได้รับตามปกติ", example: "เช่น ยื่นเงินให้เจ้าหน้าที่เพื่อให้อนุมัติเอกสารก่อนคนอื่น ทั้งที่ยังไม่ผ่านขั้นตอน" },
  { match: "จ่ายเงินแบบไม่เปิดเผย", explanation: "เป็นการจ่ายเงินลับ ๆ นอกขั้นตอนปกติ โดยไม่แจ้งรายละเอียดหรือออกหลักฐานให้ตรวจสอบ มักใช้เพื่อให้งานผ่านง่ายขึ้น", example: "เช่น มีคนบอกให้จ่ายเงินเพิ่มโดยไม่ออกใบเสร็จ แล้วจะช่วยเร่งเรื่องให้" },
  { match: "ตรวจสอบได้", explanation: "การทำงานมีขั้นตอนชัดเจน เปิดเผยข้อมูลที่เกี่ยวข้อง และมีหลักฐานให้ตรวจสอบว่าใช้เงินหรือตัดสินใจอย่างไร", example: "เช่น ประกาศงบประมาณ ราคาที่ซื้อ และใบเสร็จ เพื่อให้ผู้เกี่ยวข้องตรวจดูได้" },
  { match: "ผลประโยชน์ส่วนตัว", explanation: "เป็นการใช้อำนาจหรือหน้าที่ในทางที่ผิด ฝ่าฝืนกฎ หรือเอาเปรียบส่วนรวม เพื่อให้ตัวเองหรือพวกพ้องได้ประโยชน์", example: "เช่น แก้ข้อมูลการจัดซื้อเพื่อให้บริษัทของญาติได้งาน ทั้งที่ไม่ผ่านเกณฑ์" },
  { match: "เงินของผู้อื่น", explanation: "ผู้ที่มีหน้าที่ดูแลหรือได้รับฝากเงินของคนอื่น กลับนำเงินนั้นไปใช้เป็นของตนโดยไม่ได้รับอนุญาต", example: "เช่น ผู้ดูแลเงินกองกลางแอบนำเงินที่เพื่อนฝากไว้ไปซื้อของส่วนตัว" },
  { match: "แจ้งเมื่อพบ", explanation: "เมื่อพบปัญหาหรือสิ่งที่ไม่ถูกต้อง ให้แจ้งผู้รับผิดชอบหรือหน่วยงานที่เกี่ยวข้อง พร้อมข้อมูลและหลักฐาน เพื่อให้ตรวจสอบและแก้ไข", example: "เช่น พบเจ้าหน้าที่เรียกเงินนอกระบบ จึงแจ้งหน่วยงานที่ดูแลพร้อมวัน เวลา และหลักฐาน" },
];

export default function ClueCard({ word, completed }) {
  const dialogRef = useRef(null);
  const detail = explanations.find((item) => word.clue.replace(/\s/g, '').includes(item.match.replace(/\s/g, '')));
  return (
    <>
      <motion.button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        aria-label={`อ่านคำอธิบายเบาะแส: ${word.clue}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        // ปรับขนาดเป็น w-[210px] h-[155px] เท่ากับการ์ดคำตอบเพื่อให้สมดุลและห่างกันกำลังดี
        className={`
                relative w-full max-w-[225px] min-h-[150px] [@media(max-height:820px)]:min-h-[128px] p-4 [@media(max-height:820px)]:p-3 shadow-[3px_5px_10px_rgba(0,0,0,0.4)] transition-all duration-300 rounded-sm flex items-center justify-center cursor-pointer hover:brightness-105 focus-visible:outline-2 focus-visible:outline-amber-500
                ${completed ? "bg-[#ebdcc9] border-l-8 border-l-[#8b5a2b] border-y border-r border-[#cfbfa8]" : "bg-[#f9f3eb] border-l-8 border-l-[#543525] border-y border-r border-[#e3d7c5]"}
            `}
        style={{
          rotate: `${rotations[word.id - 1]}deg`,
          backgroundImage: "repeating-linear-gradient(to bottom, transparent 0px, transparent 21px, rgba(139,90,43,0.03) 22px)",
        }}
      >
        {/* เทปแปะหัวกระดาษ */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-white/60 border border-white/40 backdrop-blur-[1px] transform rotate-[-0.5deg] shadow-sm" />

        {/* ข้อความคำใบ้: ปรับสีตัวหนังสือให้ดำน้ำตาลเข้ม font-black คมชัด ไม่อ่อนเบลอ */}
        <div className="text-center w-full px-1">
          <p className={`text-[15px] leading-snug font-black ${completed ? 'text-[#543525] opacity-40 line-through' : 'text-[#1a0c02]'}`}>
            {word.clue}
          </p>
          <span className="block mt-3 [@media(max-height:820px)]:mt-2 text-[11px] text-[#865b37]">กดเพื่ออ่านคำอธิบายและตัวอย่าง</span>
        </div>
      </motion.button>
      {createPortal(<dialog ref={dialogRef} aria-label="คำอธิบายเบาะแส" className="m-auto w-[calc(100%_-_32px)] max-w-[520px] max-h-[85dvh] overflow-y-auto rounded-2xl border border-amber-800/30 bg-[#fff8ed] p-6 text-[#382414] shadow-2xl backdrop:bg-black/60">
        <h2 className="text-xl font-bold mb-3">ขยายเบาะแส</h2>
        <p className="font-bold text-[#875018] mb-4">{word.clue}</p>
        <p className="text-base leading-relaxed">{detail?.explanation || `ลองนึกถึงสถานการณ์ที่ตรงกับคำใบ้นี้ แล้วใช้ตัวอักษรที่เปิดไว้เป็นจุดเริ่มต้น คุณพิมพ์ได้ทั้งคำหรือเฉพาะตัวอักษรที่เหลือ`}</p>
        {detail && <div className="mt-4 rounded-xl bg-[#f1e5d1] p-4"><strong className="block mb-2">ตัวอย่างสถานการณ์</strong><p className="leading-relaxed">{detail.example}</p></div>}
        <p className="mt-4 text-sm text-[#795a3e]">ลองดูตัวอักษรที่เปิดไว้บนการ์ดคำตอบ แล้วเติมคำที่ตรงกับความหมายนี้</p>
        <button type="button" onClick={() => dialogRef.current?.close()} className="mt-5 w-full rounded-xl bg-[#865327] px-4 py-3 font-bold text-white hover:bg-[#6e401b]">เข้าใจแล้ว กลับไปตอบ</button>
      </dialog>, document.body)}
    </>
  );
}