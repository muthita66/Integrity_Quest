import { ArrowRight, Heart, Network, ShieldCheck, Scale, GraduationCap, Users, School, Landmark, Route, Sparkles } from "lucide-react";
import "./Level2Intro.css";

export default function Level2Intro({ onStart, maxLives }) {
  return (
    <main className="network-intro">
      <div className="network-intro-shell">
        <header className="network-intro-top"><span><ShieldCheck size={18} /> INTEGRITY QUEST</span><span>บทที่ 6 <i /> เลเวล 2</span></header>
        <section className="network-intro-card">
          <div className="network-intro-copy">
            <span className="network-intro-badge"><Sparkles size={15} /> ภารกิจแห่งความร่วมมือ</span>
            <h1>เครือข่าย<span>ความดี</span></h1>
            <p className="network-intro-lead">ความดีเริ่มที่คุณ<br />และส่งต่อได้ไกลกว่าที่คิด</p>
            <p className="network-intro-description">เชื่อมพลังจากนักเรียนสู่คนในสังคม เลือกเส้นทาง ตอบคำถาม และสร้างเครือข่ายไปให้ถึงศาลยุติธรรม</p>
            <div className="network-intro-stats"><span><Heart size={18} /> หัวใจ {maxLives} ดวง</span><span><Scale size={18} /> เป้าหมาย: ศาลยุติธรรม</span></div>
            <button className="network-intro-start" onClick={onStart}>เริ่มภารกิจ <ArrowRight size={21} /></button>
            <span className="network-intro-caption">ทุกคำตอบ คืออีกก้าวของการส่งต่อความดี</span>
          </div>
          <div className="network-intro-visual" aria-label="เครือข่ายจากนักเรียน ผ่านผู้คนในสังคม ไปยังศาลยุติธรรม">
            <div className="network-intro-orbit orbit-one" /><div className="network-intro-orbit orbit-two" />
            <svg className="network-intro-lines" viewBox="0 0 440 400" aria-hidden="true"><path d="M220 78 L90 188 L220 300 M220 78 L350 188 L220 300 M90 188 L350 188" /></svg>
            <div className="network-intro-node node-student"><GraduationCap /><span>นักเรียน</span><small>เริ่มต้นที่คุณ</small></div>
            <div className="network-intro-node node-community"><Users /><span>ชุมชน</span></div>
            <div className="network-intro-node node-school"><School /><span>โรงเรียน</span></div>
            <div className="network-intro-node node-court"><Scale /><span>ศาลยุติธรรม</span></div>
            <span className="network-intro-visual-label"><Network size={15} /> เชื่อมคน · ส่งต่อความดี</span>
          </div>
        </section>
        <section className="network-intro-guide" aria-label="วิธีเล่น">
          <div className="network-intro-guide-heading"><span>เตรียมพร้อมก่อนออกเดินทาง</span><span>วิธีเล่น 3 ขั้นตอน</span></div>
          <div className="network-intro-steps">
            <article><div className="network-intro-step-icon"><Route size={22} /><b>01</b></div><div><h2>เลือกเส้นทาง</h2><p>คลิกจุดถัดไปที่เชื่อมกับเครือข่ายของคุณ</p></div></article>
            <article><div className="network-intro-step-icon"><ShieldCheck size={22} /><b>02</b></div><div><h2>ตอบคำถาม</h2><p>ไม่เสียหัวใจได้ 200 IP · เสีย 1 ได้ 150 · เสีย 2 ได้ 100 · หัวใจหมดได้ 50 IP และเริ่มใหม่ได้</p></div></article>
            <article><div className="network-intro-step-icon"><Landmark size={22} /><b>03</b></div><div><h2>ไปให้ถึงเป้าหมาย</h2><p>เชื่อมเครือข่ายถึงศาลก่อนหัวใจหมด</p></div></article>
          </div>
        </section>
      </div>
    </main>
  );
}
