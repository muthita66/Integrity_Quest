import { FiUser, FiMail, FiLock, FiKey } from "react-icons/fi";

import FormInput from "./FormInput";
import FormSelect from "./FormSelect";
import AuthButton from "./AuthButton";
import RoleToggle, { getRoleTheme } from "./RoleToggle";

export default function RegisterForm({
    registerData,
    faculties,
    filteredMajors,
    departments = [],
    handleRegisterChange,
    handleRegisterSubmit,
    setIsLogin,
    role,
    setRole,
}) {
    const isTeacher = role === "teacher";
    const theme = getRoleTheme(role);

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

    return (
        <form onSubmit={handleRegisterSubmit} className="space-y-5">
            {/* ROLE */}
            <RoleToggle role={role} setRole={setRole} />

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
                            </FormSelect>
                        </>
                    )}
                </div>
            </div>

            {/* SIGN UP */}
            <AuthButton
                type="submit"
                title={isTeacher ? "Sign Up as Teacher" : "Sign Up"}
                className={theme.button}
            />

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