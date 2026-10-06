import { useEffect, useState } from "react";

import bg_login from "../../assets/bg_login.png";

import useAuth from "../hooks/useAuth";

import Popup from "../../components/auth/Popup";
import AuthHeader from "../../components/auth/AuthHeader";
import LoginForm from "../../components/auth/LoginForm";
import RegisterForm from "../../components/auth/RegisterForm";
import ConsentNotice from "../../components/auth/ConsentNotice";

export default function AuthPage() {
  const {
    isLogin,
    setIsLogin,

    role,
    setRole,

    popup,
    setPopup,

    loginData,
    registerData,

    faculties,
    filteredMajors,
    departments,

    handleLoginChange,
    handleRegisterChange,
    handleLoginSubmit,
    handleRegisterSubmit,
    updateStudentGroups,
  } = useAuth();

  // ============================================================
  // ความยินยอม (PDPA) — ต้องติ๊กยินยอมก่อนถึงจะเห็นฟอร์มสมัครสมาชิกจริง
  // ------------------------------------------------------------
  // consent = null  → ยังไม่ยินยอม (โชว์ ConsentNotice แทน RegisterForm)
  // consent = { at, version } → ยินยอมแล้ว (โชว์ RegisterForm ตามปกติ)
  // รีเซ็ตกลับเป็น null ทุกครั้งที่สลับกลับไป Login เพื่อให้ยินยอมใหม่ทุกครั้ง
  // ที่เข้าสู่ขั้นตอนสมัครสมาชิก
  // ============================================================
  const [consent, setConsent] = useState(null);

  useEffect(() => {
    if (isLogin) setConsent(null);
  }, [isLogin]);

  // เมื่อยินยอมแล้ว ดันค่า consent_at / consent_version เข้า registerData
  // ผ่าน handleRegisterChange (รูปแบบเดียวกับ onChange ของ input ทั่วไป)
  // เพื่อให้ handleRegisterSubmit ส่งค่าติดไปกับ payload ตอนสมัครจริง
  useEffect(() => {
    if (!consent) return;
    handleRegisterChange({ target: { name: "consent_at", value: consent.at } });
    handleRegisterChange({
      target: { name: "consent_version", value: consent.version },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consent]);

  // แสดงหน้ายินยอมเฉพาะตอนสมัครแบบ "นักเรียน" เท่านั้น (เอกสารยินยอม
  // พูดถึงข้อมูลนิสิตโดยเฉพาะ — อาจารย์ไม่ต้องผ่านหน้านี้)
  const showConsent = !isLogin && role !== "teacher" && !consent;

  return (
    <>
      <Popup
        popup={popup}
        onClose={() =>
          setPopup({
            show: false,
            type: "",
            message: "",
          })
        }
      />

      <div
        className="h-dvh overflow-y-auto flex items-center justify-center bg-cover bg-center px-4 py-10"
        style={{
          backgroundImage: `url(${bg_login})`,
        }}
      >
        <div
          className={`w-full rounded-3xl border border-white/50 bg-white/30 p-8 shadow-xl backdrop-blur-md sarabun-regular md:p-10 ${isLogin || showConsent ? "max-w-2xl" : "max-w-3xl"
            }`}
        >
          {!showConsent && <AuthHeader isLogin={isLogin} role={role} />}

          {isLogin ? (
            <div className="mx-auto max-w-md">
              <LoginForm
                loginData={loginData}
                handleLoginChange={handleLoginChange}
                handleLoginSubmit={handleLoginSubmit}
                setIsLogin={setIsLogin}
                role={role}
                setRole={setRole}
              />
            </div>
          ) : showConsent ? (
            <ConsentNotice
              onAgree={(at, version) => setConsent({ at, version })}
              onDecline={() => setIsLogin(true)}
            />
          ) : (
            <RegisterForm
              registerData={registerData}
              faculties={faculties}
              filteredMajors={filteredMajors}
              departments={departments}
              handleRegisterChange={handleRegisterChange}
              handleRegisterSubmit={handleRegisterSubmit}
              updateStudentGroups={updateStudentGroups}
              setIsLogin={setIsLogin}
              role={role}
              setRole={setRole}
            />
          )}
        </div>
      </div>
    </>
  );
}