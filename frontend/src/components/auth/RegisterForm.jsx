import { useEffect, useState } from "react";
import { FiUser, FiMail, FiLock, FiKey, FiPlus, FiX } from "react-icons/fi";

import FormInput from "./FormInput";
import FormSelect from "./FormSelect";
import AuthButton from "./AuthButton";
import RoleToggle, { getRoleTheme } from "./RoleToggle";

// กลุ่มนักเรียนเปล่า 1 แถว (ใช้ตอนกด "+ เพิ่มกลุ่ม")
const emptyGroup = () => ({
    key: `${Date.now()}-${Math.random()}`,
    faculty: "",
    major: "",
    year: "",
    note: "",
});

// ============================================================
// ขั้นที่ 2 (เฉพาะอาจารย์): เลือกกลุ่มนักเรียนที่จะดูแล/เห็นข้อมูล
// ------------------------------------------------------------
// อาจารย์ 1 คน เพิ่มได้หลายกลุ่ม แต่ละกลุ่มเลือก คณะ/สาขา/ชั้นปี
// ได้ "ค่าเดียวต่อช่อง" (เว้นว่าง = ทุกค่าของช่องนั้น) + รายละเอียด
// เพิ่มเติม เช่น วิชาที่สอน
// ============================================================

function StudentGroupsEditor({ groups, onChange, faculties, theme }) {
    const updateGroup = (key, field, value) => {
        onChange(
            groups.map((g) =>
                g.key === key
                    ? {
                        ...g,
                        [field]: value,
                        // เปลี่ยนคณะ → ล้างสาขาที่เคยเลือกไว้ (สาขาเปลี่ยนไปตามคณะ)
                        ...(field === "faculty" ? { major: "" } : {}),
                    }
                    : g
            )
        );
    };

    const removeGroup = (key) => {
        onChange(groups.filter((g) => g.key !== key));
    };

    const addGroup = () => {
        onChange([...groups, emptyGroup()]);
    };

    return (
        <div className="space-y-3">
            {groups.length === 0 && (
                <p className="rounded-xl bg-amber-50 p-3 text-xs font-semibold text-amber-700">
                    ต้องเพิ่มอย่างน้อย 1 กลุ่ม — อาจารย์จะเห็นข้อมูลเฉพาะนิสิตใน
                    กลุ่มที่เลือกไว้เท่านั้น
                </p>
            )}

            {groups.map((group, index) => {
                const groupMajors = group.faculty
                    ? faculties.find(
                        (f) => String(f.faculty_id) === String(group.faculty)
                    )?.majors || []
                    : [];

                return (
                    <div
                        key={group.key}
                        className="relative rounded-xl border border-gray-200 bg-white/70 p-4"
                    >
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-xs font-semibold text-gray-500">
                                กลุ่มที่ {index + 1}
                            </p>
                            <button
                                type="button"
                                onClick={() => removeGroup(group.key)}
                                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-red-500"
                                aria-label="ลบกลุ่มนี้"
                            >
                                <FiX size={16} />
                            </button>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                            <FormSelect
                                name="faculty"
                                value={group.faculty}
                                onChange={(e) =>
                                    updateGroup(group.key, "faculty", e.target.value)
                                }
                                focusClass={theme.focus}
                            >
                                <option value="">ทุกคณะ</option>
                                {faculties.map((faculty) => (
                                    <option
                                        key={faculty.faculty_id}
                                        value={faculty.faculty_id}
                                    >
                                        {faculty.faculty_name}
                                    </option>
                                ))}
                            </FormSelect>

                            <FormSelect
                                name="major"
                                value={group.major}
                                onChange={(e) =>
                                    updateGroup(group.key, "major", e.target.value)
                                }
                                focusClass={theme.focus}
                            >
                                <option value="">
                                    {group.faculty ? "ทุกสาขา" : "ทุกสาขา (เลือกคณะก่อน)"}
                                </option>
                                {groupMajors.map((major) => (
                                    <option key={major.major_id} value={major.major_id}>
                                        {major.major_name}
                                    </option>
                                ))}
                            </FormSelect>

                            <FormSelect
                                name="year"
                                value={group.year}
                                onChange={(e) =>
                                    updateGroup(group.key, "year", e.target.value)
                                }
                                focusClass={theme.focus}
                            >
                                <option value="">ทุกชั้นปี</option>
                                <option value="1">ปี 1</option>
                                <option value="2">ปี 2</option>
                                <option value="3">ปี 3</option>
                                <option value="4">ปี 4</option>
                                <option value="5">ปี 5</option>
                                <option value="6">ปี 6</option>
                            </FormSelect>
                        </div>

                        <div className="mt-4">
                            <FormInput
                                noIcon
                                placeholder="รายละเอียดกลุ่ม เช่น วิชาที่สอน (ไม่บังคับ)"
                                name="note"
                                value={group.note}
                                onChange={(e) =>
                                    updateGroup(group.key, "note", e.target.value)
                                }
                                focusClass={theme.focus}
                            />
                        </div>
                    </div>
                );
            })}

            <button
                type="button"
                onClick={addGroup}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 py-2.5 text-sm font-semibold text-gray-500 hover:border-gray-400 hover:text-gray-700"
            >
                <FiPlus /> เพิ่มกลุ่ม
            </button>
        </div>
    );
}

export default function RegisterForm({
    registerData,
    faculties,
    filteredMajors,
    departments = [],
    handleRegisterChange,
    handleRegisterSubmit,
    updateStudentGroups,
    setIsLogin,
    role,
    setRole,
}) {
    const isTeacher = role === "teacher";
    const theme = getRoleTheme(role);

    // ขั้นที่ 1 = กรอกข้อมูลบัญชี, ขั้นที่ 2 = เลือกกลุ่มนักเรียนที่ดูแล (อาจารย์เท่านั้น)
    const [step, setStep] = useState(1);

    // สลับ student <-> teacher ระหว่างกรอกฟอร์ม ให้กลับไปขั้นที่ 1 เสมอ
    useEffect(() => {
        setStep(1);
    }, [role]);

    // ภาควิชาของคณะที่เลือก (อาจารย์)
    const teacherDepartments = registerData.faculty
        ? departments.filter(
            (dept) =>
                Number(dept.faculty_id) ===
                Number(registerData.faculty)
        )
        : [];

    // props ร่วมของทุกช่อง
    const field = (name) => ({
        name,
        value: registerData[name],
        onChange: handleRegisterChange,
        focusClass: theme.focus,
    });

    const studentGroups = registerData.studentGroups || [];

    const goToGroupsStep = (e) => {
        e.preventDefault();

        // เข้าขั้นเลือกกลุ่มครั้งแรก ยังไม่มีกลุ่มเลย ใส่แถวเปล่าให้ 1 แถว
        // เป็นจุดเริ่มกรอก (ต้องเลือกอย่างน้อย 1 กลุ่มถึงจะสมัครได้)
        if (studentGroups.length === 0) {
            updateStudentGroups([emptyGroup()]);
        }

        setStep(2);
    };

    const showGroupsStep = isTeacher && step === 2;

    return (
        <form onSubmit={handleRegisterSubmit} className="space-y-5">
            {/* ROLE (ซ่อนตอนอยู่ขั้นเลือกกลุ่มนักเรียน กันสลับ role กลางคัน) */}
            {!showGroupsStep && <RoleToggle role={role} setRole={setRole} />}

            {showGroupsStep ? (
                <>
                    <div>
                        <h3 className="text-base font-bold text-gray-800">
                            กลุ่มนักเรียนที่ดูแล
                        </h3>
                        <p className="mt-0.5 text-xs text-gray-500">
                            เลือกคณะ / สาขา / ชั้นปีของนิสิตที่คุณจะดูแลและเห็นข้อมูล
                            คะแนน (แก้ไขภายหลังได้ที่หน้าตั้งค่าบัญชี)
                        </p>
                    </div>

                    <StudentGroupsEditor
                        groups={studentGroups}
                        onChange={updateStudentGroups}
                        faculties={faculties}
                        theme={theme}
                    />
                </>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {/* LEFT : ข้อมูลบัญชี */}
                    <div className="space-y-4">
                        <FormInput
                            icon={FiUser}
                            placeholder="Username"
                            {...field("username")}
                        />

                        <div className="grid grid-cols-2 gap-3">
                            <FormInput
                                noIcon
                                placeholder="ชื่อ"
                                {...field("firstName")}
                            />
                            <FormInput
                                noIcon
                                placeholder="นามสกุล"
                                {...field("lastName")}
                            />
                        </div>

                        <FormInput
                            icon={FiMail}
                            type="email"
                            placeholder="Email"
                            {...field("email")}
                        />

                        <FormInput
                            icon={FiLock}
                            type="password"
                            placeholder="Password"
                            {...field("password")}
                        />

                        <FormInput
                            icon={FiLock}
                            type="password"
                            placeholder="Confirm Password"
                            {...field("confirmPassword")}
                        />

                        {registerData.confirmPassword &&
                            registerData.confirmPassword !==
                            registerData.password && (
                                <p className="-mt-2 text-xs text-red-500">
                                    รหัสผ่านไม่ตรงกัน
                                </p>
                            )}
                    </div>

                    {/* RIGHT : ข้อมูลเฉพาะนักเรียน / อาจารย์ */}
                    <div className="space-y-4">
                        <FormSelect {...field("gender")}>
                            <option value="">เพศ</option>
                            <option value="male">ชาย</option>
                            <option value="female">หญิง</option>
                            <option value="other">อื่น ๆ</option>
                        </FormSelect>

                        {isTeacher ? (
                            <>
                                <FormSelect {...field("faculty")}>
                                    <option value="">คณะ</option>
                                    {faculties.map((faculty) => (
                                        <option
                                            key={faculty.faculty_id}
                                            value={faculty.faculty_id}
                                        >
                                            {faculty.faculty_name}
                                        </option>
                                    ))}
                                </FormSelect>

                                <FormSelect {...field("department")}>
                                    <option value="">
                                        {registerData.faculty
                                            ? "ภาควิชา"
                                            : "ภาควิชา (เลือกคณะก่อน)"}
                                    </option>
                                    {teacherDepartments.map((dept) => (
                                        <option
                                            key={dept.dept_id}
                                            value={dept.dept_id}
                                        >
                                            {dept.dept_name}
                                        </option>
                                    ))}
                                </FormSelect>

                                <FormInput
                                    noIcon
                                    placeholder="ตำแหน่ง เช่น อาจารย์, ผศ."
                                    {...field("position")}
                                />

                                <FormInput
                                    icon={FiKey}
                                    type="password"
                                    placeholder="รหัสอาจารย์"
                                    {...field("inviteCode")}
                                />
                            </>
                        ) : (
                            <>
                                <FormInput
                                    type="number"
                                    noIcon
                                    placeholder="อายุ"
                                    {...field("age")}
                                />

                                <FormSelect {...field("faculty")}>
                                    <option value="">คณะ</option>
                                    {faculties.map((faculty) => (
                                        <option
                                            key={faculty.faculty_id}
                                            value={faculty.faculty_id}
                                        >
                                            {faculty.faculty_name}
                                        </option>
                                    ))}
                                </FormSelect>

                                <FormSelect {...field("major")}>
                                    <option value="">สาขา</option>
                                    {filteredMajors.map((major) => (
                                        <option
                                            key={major.major_id}
                                            value={major.major_id}
                                        >
                                            {major.major_name}
                                        </option>
                                    ))}
                                </FormSelect>

                                <FormSelect {...field("year")}>
                                    <option value="">ชั้นปี</option>
                                    <option value="1">ปี 1</option>
                                    <option value="2">ปี 2</option>
                                    <option value="3">ปี 3</option>
                                    <option value="4">ปี 4</option>
                                    <option value="5">ปี 5</option>
                                    <option value="6">ปี 6</option>
                                </FormSelect>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* ปุ่มล่าง: อาจารย์ = ถัดไป/ย้อนกลับ + Sign Up, นักเรียน = Sign Up อย่างเดียว */}
            {isTeacher && !showGroupsStep && (
                <AuthButton
                    type="button"
                    onClick={goToGroupsStep}
                    title="ถัดไป"
                    className={theme.button}
                />
            )}

            {showGroupsStep && (
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex-1 rounded-xl border border-gray-300 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                    >
                        ย้อนกลับ
                    </button>

                    <div className="flex-[2]">
                        <AuthButton
                            type="submit"
                            title="Sign Up as Teacher"
                            className={theme.button}
                            disabled={studentGroups.length === 0}
                        />
                    </div>
                </div>
            )}

            {!isTeacher && (
                <AuthButton
                    type="submit"
                    title="Sign Up"
                    className={theme.button}
                />
            )}

            {/* LOGIN LINK */}
            <p className="text-center text-sm text-gray-500">
                Already have an account?{" "}
                <button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className={`font-semibold hover:underline ${theme.link}`}
                >
                    Log in
                </button>
            </p>
        </form>
    );
}