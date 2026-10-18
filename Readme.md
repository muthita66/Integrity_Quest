# Integrity Learning Game

เว็บเกมเพื่อการเรียนรู้เรื่องความซื่อสัตย์ (Integrity) สำหรับนิสิต แบ่งเนื้อหาเป็น 6 Unit
มีแบบทดสอบก่อน/หลังเรียน (Pre-test / Post-test) ใบประกาศนียบัตร และหน้าอาจารย์สำหรับติดตามผลนิสิต

## โครงสร้างโปรเจกต์

```
project/
├── backend/            # REST API (Express + Prisma + PostgreSQL)
│   ├── middleware/     # authMiddleware (JWT), requirePlayOwner
│   ├── prisma/         # schema.prisma และ migrations
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── lib/prisma.js
│   │   └── server.js   # จุดเริ่มต้นของ server
│   └── tests/
└── frontend/           # React 19 + Vite + Tailwind CSS
    └── src/
        ├── components/ # Pages, unit1–3, Unit4–6, auth, common, services
        └── config.js   # BASE_URL ของ backend
```

## สิ่งที่ต้องมี

- Node.js (แนะนำเวอร์ชัน 20 ขึ้นไป)
- PostgreSQL
- Gemini API key (ใช้กับกิจกรรม ShadowMirror) — ขอฟรีได้ที่ https://aistudio.google.com/apikey

## การติดตั้ง

### 1. Backend

```bash
cd backend
npm install
```

สร้างไฟล์ `backend/.env`:

```env
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/DB_NAME
JWT_SECRET=your_jwt_secret
TEACHER_INVITE_CODE=your_teacher_invite_code
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
PORT=5000
```

| ตัวแปร | คำอธิบาย |
| --- | --- |
| `DATABASE_URL` | connection string ของ PostgreSQL |
| `JWT_SECRET` | คีย์สำหรับเซ็น JWT ตอนล็อกอิน |
| `TEACHER_INVITE_CODE` | รหัสที่อาจารย์ต้องกรอกตอนสมัครสมาชิก |
| `GEMINI_API_KEY` | API key ของ Gemini สำหรับวิเคราะห์คำตอบ ShadowMirror |
| `GEMINI_MODEL` | ชื่อโมเดล (ค่าเริ่มต้น `gemini-2.5-flash`) |
| `PORT` | พอร์ตของ server (ค่าเริ่มต้น `5000`) |

> ค่าใน `.env` จะทับ environment variable ที่มีอยู่แล้วในเครื่อง (`dotenv` ตั้ง `override: true`)

เตรียมฐานข้อมูล:

```bash
npx prisma migrate deploy
npx prisma generate
node seed.js        # ใส่ข้อมูลเริ่มต้น (ถ้าต้องการ)
```

### 2. Frontend

```bash
cd frontend
npm install
```

ถ้า backend ไม่ได้รันอยู่ที่ `http://localhost:5000` ให้สร้างไฟล์ `frontend/.env`:

```env
VITE_API_URL=https://your-backend-url
```

## การรัน

เปิด 2 terminal:

```bash
# Terminal 1 — backend
cd backend
npm run dev         # หรือ npm start
```

```bash
# Terminal 2 — frontend
cd frontend
npm run dev
```

- Backend: http://localhost:5000
- Frontend: http://localhost:5173

> ถ้าเจอข้อความว่าพอร์ตถูกใช้อยู่ (`EADDRINUSE`) ให้ปิด server ตัวเก่าก่อน:
> `netstat -ano | findstr :5000` แล้ว `taskkill /PID <เลข> /F`

## API หลัก

ทุก endpoint อยู่ใต้ `/api` endpoint ที่ต้องล็อกอินต้องส่ง header `Authorization: Bearer <token>`

| กลุ่ม | Path |
| --- | --- |
| ล็อกอิน / สมัครสมาชิก | `/api/auth` |
| โปรไฟล์ | `/api/profile` |
| หน้าอาจารย์ | `/api/teacher` |
| นับเวลาใช้งาน (heartbeat) | `/api/activity` |
| ความคืบหน้าผู้เล่น | `/api/user-progress`, `/api/level-result` |
| เนื้อหา Unit | `/api/unitContent`, `/api/introDialog`, `/api/gameStory`, `/api/question` |
| การเล่นเกม | `/api/game-play` |
| Unit 1 | `/api/bubbles`, `/api/final-level` |
| Unit 2 | `/api/levelItem`, `/api/levelHint`, `/api/comparisonQuestion`, `/api/hintMinigame` |
| Unit 3 | `/api/receipt-hunt`, `/api/money-game` |
| Unit 4 | `/api/slips`, `/api/slip-hunt`, `/api/slot-game` |
| Unit 5 | `/api/word-game`, `/api/budget-game`, `/api/inspector-game` |
| Unit 6 | `/api/crisis-game`, `/api/reflect` |

### ShadowMirror (Unit 6 Level 3)

`POST /api/reflect` — ส่งคำตอบปลายเปิดไปให้ Gemini วิเคราะห์ (API key อยู่ฝั่ง server เท่านั้น)

```json
{
  "play_id": 123,
  "answers": [
    { "question": "...", "answer": "..." }
  ]
}
```

ผลลัพธ์: คะแนน 0–100 ใน 4 ด้าน (logic, empathy, responsibility, consistency) พร้อมคำอธิบาย,
`shadow_message` และ `overall_reflection` หรือ `{ "message": "..." }` เมื่อเกิดข้อผิดพลาด

## Deploy

Frontend มี `vercel.json` สำหรับ deploy บน Vercel (rewrite ทุก path ไป `index.html`)
อย่าลืมตั้ง `VITE_API_URL` ให้ชี้ไปที่ backend ที่ deploy แล้ว
