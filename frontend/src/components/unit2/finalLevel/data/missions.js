/** @type {Array<import('./missions.types').Mission>} */

import OneImg from "../../../../assets/unit2/FinalLevel/QuestionOne.png"
import TwoImg from "../../../../assets/unit2/FinalLevel/QuestionTwo.png"
import ThreeImg from "../../../../assets/unit2/FinalLevel/QuestionThree.png"
import FourImg from "../../../../assets/unit2/FinalLevel/QuestionFour.png"
import FiveImg from "../../../../assets/unit2/FinalLevel/QuestionFive.png"
import SixImg from "../../../../assets/unit2/FinalLevel/QuestionSix.png"
import SevenImg from "../../../../assets/unit2/FinalLevel/QuestionSeven.png"
import EightImg from "../../../../assets/unit2/FinalLevel/QuestionEight.png"
import NineImg from "../../../../assets/unit2/FinalLevel/QuestionNine.png"
import TenImg from "../../../../assets/unit2/FinalLevel/QuestionTen.png"

import Q11Img from "../../../../assets/unit2/FinalLevel/Choice/q11.png"
import Q12Img from "../../../../assets/unit2/FinalLevel/Choice/q12.png"
import Q13Img from "../../../../assets/unit2/FinalLevel/Choice/q13.png"

import Q21Img from "../../../../assets/unit2/FinalLevel/Choice/q21.png"
import Q22Img from "../../../../assets/unit2/FinalLevel/Choice/q22.png"
import Q23Img from "../../../../assets/unit2/FinalLevel/Choice/q23.png"

import Q31Img from "../../../../assets/unit2/FinalLevel/Choice/q31.png"
import Q32Img from "../../../../assets/unit2/FinalLevel/Choice/q32.png"
import Q33Img from "../../../../assets/unit2/FinalLevel/Choice/q33.png"

import Q41Img from "../../../../assets/unit2/FinalLevel/Choice/q41.png"
import Q42Img from "../../../../assets/unit2/FinalLevel/Choice/q42.png"
import Q43Img from "../../../../assets/unit2/FinalLevel/Choice/q43.png"

import Q51Img from "../../../../assets/unit2/FinalLevel/Choice/q51.png"
import Q53Img from "../../../../assets/unit2/FinalLevel/Choice/q53.png"

import Q61Img from "../../../../assets/unit2/FinalLevel/Choice/q61.png"
import Q62Img from "../../../../assets/unit2/FinalLevel/Choice/q62.png"
import Q63Img from "../../../../assets/unit2/FinalLevel/Choice/q63.png"

import Q71Img from "../../../../assets/unit2/FinalLevel/Choice/q71.png"
import Q72Img from "../../../../assets/unit2/FinalLevel/Choice/q72.png"
import Q73Img from "../../../../assets/unit2/FinalLevel/Choice/q73.png"

import Q81Img from "../../../../assets/unit2/FinalLevel/Choice/q81.png"
import Q82Img from "../../../../assets/unit2/FinalLevel/Choice/q82.png"
import Q83Img from "../../../../assets/unit2/FinalLevel/Choice/q83.png"

import Q91Img from "../../../../assets/unit2/FinalLevel/Choice/q91.png"
import Q92Img from "../../../../assets/unit2/FinalLevel/Choice/q92.png"
import Q93Img from "../../../../assets/unit2/FinalLevel/Choice/q93.png"

import Q101Img from "../../../../assets/unit2/FinalLevel/Choice/q101.png"
import Q102Img from "../../../../assets/unit2/FinalLevel/Choice/q102.png"
import Q103Img from "../../../../assets/unit2/FinalLevel/Choice/q103.png"

export const MISSIONS = [
    {
        id: 1,
        phase: "ช่วงเช้า",
        image: OneImg,
        situation: "คุณตื่นสายและเหลือเวลา 20 นาทีก่อนเข้างาน",
        options: [
            { id: "A", image: Q11Img, text: "เรียกแท็กซี่", cost: 150, isCorrect: false, feedback: "แพงเกินไปและแท็กซี่อาจจะติดหล่มรถติดในช่วงเช้า!" },
            { id: "B", image: Q12Img, text: "นั่งวินมอเตอร์ไซค์", cost: 50, isCorrect: true, feedback: "ทำเวลาได้ดีในราคาที่สมเหตุสมผลในเวลาเร่งด่วน" },
            { id: "C", image: Q13Img, text: "รถเมล์", cost: 20, isCorrect: false, feedback: "ถึงจะประหยัด แต่เวลานี้รถเมล์ทำให้คุณไปทำงานสายแน่นอน!" },
        ],
    },
    {
        id: 2,
        phase: "ช่วงสาย",
        image: TwoImg,
        situation: "รู้สึกง่วงนอนมาก เพื่อนร่วมงานชวนสั่งกาแฟแบรนด์ดัง",
        options: [
            { id: "A", image: Q21Img, text: "สั่งกาแฟแบรนด์ดัง", cost: 120, isCorrect: false, feedback: "แพงเกินไปสำหรับกาแฟ 1 แก้วเมื่อเทียบกับเงินที่มี" },
            { id: "B", image: Q22Img, text: "ชงกาแฟฟรีที่ออฟฟิศ", cost: 0, isCorrect: true, feedback: "เยี่ยมมาก! รู้จักใช้สวัสดิการให้เป็นประโยชน์" },
            { id: "C", image: Q23Img, text: "ซื้อกาแฟรถเข็นหน้าตึก", cost: 40, isCorrect: false, feedback: "ประหยัดลงมาหน่อย แต่ก็ยังเสียเงินอยู่ดี" },
        ],
    },
    {
        id: 3,
        phase: "พักเที่ยง",
        image: ThreeImg,
        situation: "ถึงเวลาพักเที่ยง คุณจะจัดการกับมื้ออาหารอย่างไรดี?",
        options: [
            { id: "A", image: Q31Img, text: "เพื่อนชวนกินชาบู", cost: 399, isCorrect: false, feedback: "เงินคุณจะแทบไม่เหลือเลยนะในวันแรก!" },
            { id: "B", image: Q32Img, text: "สั่งเดลิเวอรี่", cost: 150, isCorrect: false, feedback: "มีทั้งค่าส่งและค่าอาหารที่แพงกว่าปกติ" },
            { id: "C", image: Q33Img, text: "กินข้าวแกงร้านประจำ", cost: 50, isCorrect: true, feedback: "อิ่มอร่อยและประหยัดเงินในกระเป๋า" },
        ],
    },
    {
        id: 4,
        phase: "ช่วงบ่าย",
        image: FourImg,
        situation: "ทำงานเครียดๆ อยากหาขนมหรือของหวานกินแก้ง่วง",
        options: [
            { id: "A", image: Q41Img, text: "กดสั่งชานมเจ้าดัง", cost: 100, isCorrect: false, feedback: "ของหวานราคาแพงทำให้งบรายวันบานปลาย" },
            { id: "B", image: Q42Img, text: "กินขนมฟรีของออฟฟิศ", cost: 0, isCorrect: true, feedback: "ประหยัดสุดๆ! กินขนมฟรีดีกว่า" },
            { id: "C", image: Q43Img, text: "ไปมินิมาร์ทซื้อขนม", cost: 60, isCorrect: false, feedback: "ของจุกจิกก็ทำให้เงินค่อยๆ หายไปได้นะ" },
        ],
    },
    {
        id: 5,
        phase: "เลิกงาน",
        image: FiveImg,
        situation: "พายุเข้า ฝนตกหนักมาก คุณจะเดินทางกลับอย่างไร?",
        options: [
            { id: "A", image: Q51Img, text: "เรียกแท็กซี่พรีเมียม", cost: 250, isCorrect: false, feedback: "หลบฝนได้ แต่กระเป๋าฉีกแน่นอน" },
            { id: "B", image: Q13Img, text: "รอฝนซาแล้วขึ้นรถเมล์", cost: 20, isCorrect: true, feedback: "อดทนรอหน่อย แต่ประหยัดเงินไปได้เยอะมาก" },
            { id: "C", image: Q53Img, text: "ซื้อร่มใหม่แล้วเดินไป", cost: 150, isCorrect: false, feedback: "ซื้อร่มซ้ำซ้อนเป็นการใช้เงินแก้ปัญหาที่ไม่คุ้มค่า" },
        ],
    },
    {
        id: 6,
        phase: "แวะตลาดนัดเย็น",
        image: SixImg,
        situation: "เดินผ่านตลาดนัด เห็นเสื้อยืดป้ายเซลล์ลดราคา 50%",
        options: [
            { id: "A", image: Q61Img, text: "ซื้อทันทีกลัวพลาดของถูก", cost: 250, isCorrect: false, feedback: "การซื้อของเซลล์ทั้งที่ไม่จำเป็น คือการเสียเงินเปล่า" },
            { id: "B", image: Q62Img, text: "เดินดูเฉยๆ ไม่ซื้อ", cost: 0, isCorrect: true, feedback: "ใจแข็งมาก! ไม่ตกเป็นเหยื่อของการตลาด" },
            { id: "C", image: Q63Img, text: "ซื้อของกินเล่นแทน", cost: 100, isCorrect: false, feedback: "ของกินเล่นก็ทำให้เงินร่อยหรอได้เหมือนกัน" },
        ],
    },
    {
        id: 7,
        phase: "หัวค่ำ",
        image: SevenImg,
        situation: "เพื่อนสนิทโทรมาชวนไปปาร์ตี้ฉลองวันศุกร์",
        options: [
            { id: "A", image: Q71Img, text: "ไปปาร์ตี้หารค่าเหล้า", cost: 500, isCorrect: false, feedback: "เงินหมดเกลี้ยงทันที! ล้มละลายแน่นอน" },
            { id: "B", image: Q72Img, text: "ไปกินแค่หมูกระทะ", cost: 250, isCorrect: false, feedback: "งบก็ยังบานปลายอยู่ดีสำหรับสถานการณ์นี้" },
            { id: "C", image: Q73Img, text: "ปฏิเสธและพักผ่อนอยู่บ้าน", cost: 0, isCorrect: true, feedback: "ประหยัดเงินและได้พักผ่อนอย่างเต็มที่" },
        ],
    },
    {
        id: 8,
        phase: "ก่อนนอน",
        image: EightImg,
        situation: "ไถโซเชียลเจอไลฟ์สดขายของที่กำลังเล็งไว้พอดี",
        options: [
            { id: "A", image: Q81Img, text: "F ของรัวๆ", cost: 350, isCorrect: false, feedback: "การช้อปปิ้งออนไลน์ตอนดึกทำให้ขาดสติได้ง่าย" },
            { id: "B", image: Q82Img, text: "ปิดแอปแล้วนอน", cost: 0, isCorrect: true, feedback: "ยอดเยี่ยม! การปิดมือถือก่อนนอนช่วยรักษางบได้" },
            { id: "C", image: Q83Img, text: "สั่งของกินรอบดึก", cost: 150, isCorrect: false, feedback: "ทั้งอ้วนและเปลืองเงินโดยไม่จำเป็น" },
        ],
    },
    {
        id: 9,
        phase: "เช้าวันหยุด",
        image: NineImg,
        situation: "คุณได้รับบิลค่าเน็ตรายเดือน แต่เงินเริ่มเหลือน้อย",
        options: [
            { id: "A", image: Q91Img, text: "จ่ายผ่านแอปธนาคาร", cost: 300, isCorrect: true, feedback: "การจ่ายหนี้สินตรงเวลาเป็นเรื่องที่ถูกต้องและสำคัญที่สุด" },
            { id: "B", image: Q92Img, text: "เอาเงินไปดูหนังก่อน", cost: 250, isCorrect: false, feedback: "เอาเงินไปใช้เพื่อความบันเทิงก่อนจ่ายหนี้ เป็นนิสัยที่อันตราย" },
            { id: "C", image: Q93Img, text: "ผัดผ่อนไปเดือนหน้า", cost: 0, isCorrect: false, feedback: "จะโดนตัดเน็ตและมีค่าปรับล่าช้า ควรรีบจ่ายก่อนดีกว่า" },
        ],
    },
    {
        id: 10,
        phase: "ช่วงบ่าย",
        image: TenImg,
        situation: "เกิดเหตุฉุกเฉิน โทรศัพท์พังต้องส่งซ่อมด่วน",
        options: [
            { id: "A", image: Q101Img, text: "รูดบัตรซื้อเครื่องใหม่", cost: 1500, isCorrect: false, feedback: "ล้มละลาย! สร้างหนี้เกินตัวในยามฉุกเฉิน" },
            { id: "B", image: Q102Img, text: "เอาไปซ่อมร้านตู้", cost: 400, isCorrect: false, feedback: "คุณไม่มีเงินสดพอจ่ายค่าซ่อมเพราะบริหารไม่ดีมาก่อนหน้านี้" },
            { id: "C", image: Q103Img, text: "ยืมเครื่องสำรองเพื่อนมาใช้ก่อน", cost: 0, isCorrect: true, feedback: "การแก้ปัญหาเฉพาะหน้าโดยไม่เสียเงินเป็นทางออกที่ดีที่สุด" },
        ],
    },
];
