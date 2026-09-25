import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiUser, FiMail, FiLock } from "react-icons/fi";

import bg_login from "../../assets/bg_login.png";

import Popup from "../auth/Popup";
import FormInput from "../auth/FormInput";
import FormSelect from "../auth/FormSelect";
import AuthButton from "../auth/AuthButton";
import { getRoleTheme } from "../auth/RoleToggle";

import { getFaculties } from "../services/masterService";
import {
    getProfile,
    updateProfile,
    changePassword,
    getDepartments,
} from "../services/profileService";

// ============================================================
// หน้าตั้งค่าบัญชี: แก้ข้อมูลที่สมัครไว้ + เปลี่ยนรหัสผ่าน
// ============================================================

const EMPTY_PASSWORD = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
};

const Label = ({ children }) => (
    <span className="mb-1 block text-xs font-medium text-gray-500">
        {children}
    </span>
);

export default function SettingsPage() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState(null);
    const [passwordForm, setPasswordForm] = useState(EMPTY_PASSWORD);

    const [faculties, setFaculties] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [popup, setPopup] = useState({ show: false, type: "", message: "" });

    const showPopup = (type, message) =>
        setPopup({ show: true, type, message });

    // ========================================================
    // โหลดข้อมูล
    // ========================================================

    // ปิด scroll ของทั้งหน้าเว็บขณะอยู่หน้านี้ (คืนค่าเดิมเมื่อออก)
    useEffect(() => {
        const html = document.documentElement;
        const prevHtml = html.style.overflow;
        const prevBody = document.body.style.overflow;

        html.style.overflow = "hidden";
        document.body.style.overflow = "hidden";

        return () => {
            html.style.overflow = prevHtml;
            document.body.style.overflow = prevBody;
        };
    }, []);

    useEffect(() => {
        if (!localStorage.getItem("token")) {
            navigate("/", { replace: true });
            return;
        }

        const load = async () => {
            try {
                const [profile, facultyList, deptList] = await Promise.all([
                    getProfile(),
                    getFaculties(),
                    getDepartments(),
                ]);

                setForm(profile);
                setFaculties(Array.isArray(facultyList) ? facultyList : []);
                setDepartments(deptList);
            } catch (error) {
                console.error("Load settings error:", error);

                if (error.status === 401 || error.status === 403) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    navigate("/", { replace: true });
                    return;
                }

                showPopup("error", error.message || "โหลดข้อมูลไม่สำเร็จ");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [navigate]);

    const isTeacher = form?.role === "teacher";
    const theme = getRoleTheme(form?.role);

    // สาขา (นักเรียน) ของคณะที่เลือก
    const majors = useMemo(() => {
        const faculty = faculties.find(
            (f) => String(f.faculty_id) === String(form?.faculty)
        );
        return faculty?.majors || [];
    }, [faculties, form?.faculty]);

    // ภาควิชา (อาจารย์) ของคณะที่เลือก
    const teacherDepartments = useMemo(
        () =>
            departments.filter(
                (d) => String(d.faculty_id) === String(form?.faculty)
            ),
        [departments, form?.faculty]
    );

    // คณะที่อาจารย์เลือกได้ = คณะที่มีภาควิชา
    const teacherFaculties = useMemo(
        () =>
            faculties.filter((f) =>
                departments.some(
                    (d) => String(d.faculty_id) === String(f.faculty_id)
                )
            ),
        [faculties, departments]
    );

    // ========================================================
    // เปลี่ยนค่าในฟอร์ม
    // ========================================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
            // เปลี่ยนคณะ → ล้างสาขา / ภาควิชา
            ...(name === "faculty" ? { major: "", department: "" } : {}),
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm((prev) => ({ ...prev, [name]: value }));
    };

    const field = (name) => ({
        name,
        value: form?.[name] ?? "",
        onChange: handleChange,
        focusClass: theme.focus,
    });

    const passwordField = (name) => ({
        name,
        value: passwordForm[name],
        onChange: handlePasswordChange,
        focusClass: theme.focus,
    });

    // ========================================================
    // บันทึกข้อมูลส่วนตัว
    // ========================================================

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await updateProfile(form);
            setForm(res.data);

            // อัปเดต user ใน localStorage ให้ตรงกับที่แก้
            try {
                const user = JSON.parse(localStorage.getItem("user") || "{}");
                localStorage.setItem(
                    "user",
                    JSON.stringify({
                        ...user,
                        username: res.data.username,
                        email: res.data.email,
                    })
                );
            } catch {
                /* ไม่เป็นไร */
            }

            showPopup("success", res.message || "บันทึกข้อมูลสำเร็จ");
        } catch (error) {
            showPopup("error", error.message || "บันทึกไม่สำเร็จ");
        } finally {
            setSaving(false);
        }
    };

    // ========================================================
    // เปลี่ยนรหัสผ่าน
    // ========================================================

    const handleSavePassword = async (e) => {
        e.preventDefault();

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            showPopup("error", "รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน");
            return;
        }

        setSaving(true);

        try {
            const res = await changePassword(passwordForm);
            setPasswordForm(EMPTY_PASSWORD);
            showPopup("success", res.message || "เปลี่ยนรหัสผ่านสำเร็จ");
        } catch (error) {
            showPopup("error", error.message || "เปลี่ยนรหัสผ่านไม่สำเร็จ");
        } finally {
            setSaving(false);
        }
    };

    const backPath = isTeacher ? "/teacher" : "/map";

    // ========================================================
    // UI
    // ========================================================

    return (
        <>
            <Popup
                popup={popup}
                onClose={() =>
                    setPopup({ show: false, type: "", message: "" })
                }
            />

            {/* พื้นหลังเต็มจอ + เลื่อนได้ในตัว (ไม่โดน overflow:hidden ของหน้าอื่น) */}
            <div
                className="fixed inset-0 overflow-y-auto bg-cover bg-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                style={{ backgroundImage: `url(${bg_login})` }}
            >
                {/* ระยะห่างจากขอบเว็บเท่ากันทุกด้าน (บน = ล่าง = ซ้าย = ขวา) */}
                <div className="flex min-h-full items-center justify-center p-6 lg:p-8 sarabun-regular">
                    <div className="w-full max-w-6xl rounded-2xl bg-white p-6 shadow-xl lg:p-8">
                        {/* HEADER */}
                        <button
                            type="button"
                            onClick={() => navigate(backPath)}
                            className="mb-3 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800"
                        >
                            <FiArrowLeft />
                            กลับ
                        </button>

                        <h1 className={`text-3xl font-bold ${theme.text}`}>
                            ตั้งค่าบัญชี
                        </h1>
                        <p className="mt-1 mb-6 text-sm text-gray-500">
                            แก้ไขข้อมูลที่ใช้สมัครและเปลี่ยนรหัสผ่าน
                        </p>

                        {loading || !form ? (
                            <p className="py-10 text-center text-gray-500">
                                กำลังโหลดข้อมูล...
                            </p>
                        ) : (
                            <div className="grid gap-8 lg:grid-cols-[3fr_2fr] lg:gap-10">
                                {/* ================= ซ้าย: ข้อมูลส่วนตัว ================= */}
                                <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
                                    <h2 className="text-lg font-semibold text-gray-800">
                                        ข้อมูลส่วนตัว
                                    </h2>

                                    <div className="grid gap-x-4 gap-y-3 md:grid-cols-2">
                                        <label className="block">
                                            <Label>Username</Label>
                                            <FormInput icon={FiUser} placeholder="Username" {...field("username")} />
                                        </label>

                                        <label className="block">
                                            <Label>Email</Label>
                                            <FormInput icon={FiMail} type="email" placeholder="Email" {...field("email")} />
                                        </label>

                                        <label className="block">
                                            <Label>ชื่อ</Label>
                                            <FormInput noIcon placeholder="ชื่อ" {...field("firstName")} />
                                        </label>

                                        <label className="block">
                                            <Label>นามสกุล</Label>
                                            <FormInput noIcon placeholder="นามสกุล" {...field("lastName")} />
                                        </label>

                                        <label className="block">
                                            <Label>เพศ</Label>
                                            <FormSelect {...field("gender")}>
                                                <option value="">เพศ</option>
                                                <option value="male">ชาย</option>
                                                <option value="female">หญิง</option>
                                                <option value="other">อื่น ๆ</option>
                                            </FormSelect>
                                        </label>

                                        {isTeacher ? (
                                            <>
                                                <label className="block">
                                                    <Label>ตำแหน่ง</Label>
                                                    <FormInput noIcon placeholder="เช่น อาจารย์, ผศ." {...field("position")} />
                                                </label>

                                                <label className="block">
                                                    <Label>คณะ</Label>
                                                    <FormSelect {...field("faculty")}>
                                                        <option value="">คณะ</option>
                                                        {teacherFaculties.map((f) => (
                                                            <option key={f.faculty_id} value={f.faculty_id}>
                                                                {f.faculty_name}
                                                            </option>
                                                        ))}
                                                    </FormSelect>
                                                </label>

                                                <label className="block">
                                                    <Label>ภาควิชา</Label>
                                                    <FormSelect {...field("department")}>
                                                        <option value="">
                                                            {form.faculty ? "ภาควิชา" : "เลือกคณะก่อน"}
                                                        </option>
                                                        {teacherDepartments.map((d) => (
                                                            <option key={d.dept_id} value={d.dept_id}>
                                                                {d.dept_name}
                                                            </option>
                                                        ))}
                                                    </FormSelect>
                                                </label>
                                            </>
                                        ) : (
                                            <>
                                                <label className="block">
                                                    <Label>อายุ</Label>
                                                    <FormInput type="number" noIcon placeholder="อายุ" {...field("age")} />
                                                </label>

                                                <label className="block">
                                                    <Label>คณะ</Label>
                                                    <FormSelect {...field("faculty")}>
                                                        <option value="">คณะ</option>
                                                        {faculties.map((f) => (
                                                            <option key={f.faculty_id} value={f.faculty_id}>
                                                                {f.faculty_name}
                                                            </option>
                                                        ))}
                                                    </FormSelect>
                                                </label>

                                                <label className="block">
                                                    <Label>สาขา</Label>
                                                    <FormSelect {...field("major")}>
                                                        <option value="">
                                                            {form.faculty ? "สาขา" : "เลือกคณะก่อน"}
                                                        </option>
                                                        {majors.map((m) => (
                                                            <option key={m.major_id} value={m.major_id}>
                                                                {m.major_name}
                                                            </option>
                                                        ))}
                                                    </FormSelect>
                                                </label>

                                                <label className="block">
                                                    <Label>ชั้นปี</Label>
                                                    <FormSelect {...field("year")}>
                                                        <option value="">ชั้นปี</option>
                                                        <option value="1">ปี 1</option>
                                                        <option value="2">ปี 2</option>
                                                        <option value="3">ปี 3</option>
                                                        <option value="4">ปี 4</option>
                                                    </FormSelect>
                                                </label>
                                            </>
                                        )}
                                    </div>

                                    <div className="mt-auto">
                                        <AuthButton
                                            type="submit"
                                            title={saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                                            disabled={saving}
                                            className={theme.button}
                                        />
                                    </div>
                                </form>

                                {/* ================= ขวา: เปลี่ยนรหัสผ่าน ================= */}
                                <form
                                    onSubmit={handleSavePassword}
                                    className="flex flex-col gap-4 border-t border-gray-200 pt-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10"
                                >
                                    <h2 className="text-lg font-semibold text-gray-800">
                                        เปลี่ยนรหัสผ่าน
                                    </h2>

                                    <div className="space-y-3">
                                        <label className="block">
                                            <Label>รหัสผ่านปัจจุบัน</Label>
                                            <FormInput icon={FiLock} type="password" placeholder="รหัสผ่านปัจจุบัน" {...passwordField("currentPassword")} />
                                        </label>

                                        <label className="block">
                                            <Label>รหัสผ่านใหม่</Label>
                                            <FormInput icon={FiLock} type="password" placeholder="อย่างน้อย 6 ตัวอักษร" {...passwordField("newPassword")} />
                                        </label>

                                        <label className="block">
                                            <Label>ยืนยันรหัสผ่านใหม่</Label>
                                            <FormInput icon={FiLock} type="password" placeholder="ยืนยันรหัสผ่านใหม่" {...passwordField("confirmPassword")} />
                                        </label>

                                        {passwordForm.confirmPassword &&
                                            passwordForm.confirmPassword !== passwordForm.newPassword && (
                                                <p className="text-xs text-red-500">
                                                    รหัสผ่านใหม่ไม่ตรงกัน
                                                </p>
                                            )}
                                    </div>

                                    {/* ดันปุ่มลงล่างให้ตรงกับปุ่มฝั่งซ้าย */}
                                    <div className="mt-auto">
                                        <AuthButton
                                            type="submit"
                                            title="เปลี่ยนรหัสผ่าน"
                                            disabled={saving}
                                            className="bg-gray-800 hover:bg-gray-900 focus-visible:ring-gray-300"
                                        />
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}