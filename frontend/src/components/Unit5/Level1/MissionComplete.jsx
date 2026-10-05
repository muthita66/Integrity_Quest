import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaArrowRight, FaFolderOpen, FaCheck } from 'react-icons/fa';
import './MissionComplete.css';

export default function MissionComplete({ nextPath = '/unit5/2Intro', earnedIP }) {
    const navigate = useNavigate();
    return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="case-complete-overlay">
        <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="case-complete-folder" aria-labelledby="case-complete-title">
            <div className="case-complete-tab"><FaFolderOpen /> CASE FILE / 01</div>
            <div className="case-complete-cover">
                <div className="case-complete-fileline"><span>INTEGRITY QUEST · หน่วยสืบสวน</span><span>CONFIDENTIAL</span></div>
                <div className="case-complete-paper">
                    <span className="case-complete-clip" aria-hidden="true" />
                    <div className="case-complete-document-head"><span>รายงานสรุปการสืบสวน</span><span>คดีหมายเลข 01</span></div>
                    <h2 id="case-complete-title">พบหลักฐานครบแล้ว</h2>
                    <p className="case-complete-description">คุณรวบรวมหลักฐานได้ครบทุกชิ้น</p>
                    <div className="case-complete-record"><span>สถานะหลักฐาน</span><strong><FaCheck /> ตรวจสอบครบถ้วน</strong></div>
                    <div className="case-complete-record"><span>ผลการสืบสวน</span><strong>ภารกิจสำเร็จ</strong></div>
                    <motion.div initial={{ opacity: 0, scale: 1.3, rotate: -14 }} animate={{ opacity: 1, scale: 1, rotate: -8 }} transition={{ delay: .3 }} className="case-complete-stamp"><strong>CASE CLOSED</strong><span>ปิดแฟ้มคดี · MISSION COMPLETE</span></motion.div>
                    {earnedIP != null && <div className="case-complete-points"><span>คะแนนที่ได้รับจากภารกิจนี้</span><strong>+{earnedIP} <small>Integrity Point</small></strong></div>}
                    <div className="case-complete-signoff"><span>บันทึกผลการสืบสวนเรียบร้อย</span><span>✓ VERIFIED</span></div>
                </div>
                <div className="case-complete-actions">
                    <button type="button" onClick={() => navigate('/unit5/tutorial')} className="case-complete-next">เริ่มใหม่</button>
                    <button type="button" onClick={() => navigate(nextPath)} className="case-complete-next">ไปด่านต่อไป <FaArrowRight /></button>
                    <button type="button" onClick={() => navigate('/map')} className="case-complete-next">กลับหน้าแมพ</button>
                </div>
            </div>
        </motion.section>
    </motion.div>;
}
