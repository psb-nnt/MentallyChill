import React, { useState, useEffect } from "react";
import "./formOption2.css";
import Logo from "../components/logo";
import { useNavigate, useLocation } from "react-router-dom";
import { RxPerson } from "react-icons/rx";
import Loading from "../components/Loading";
import liff from "@line/liff";
import axios from "axios";

import {
  AGE_OPTIONS,
  USER_TYPES,
  STUDENT_FACULTY_DATA,
  STAFF_POSITION_DATA,
  OUTSIDER_LEVELS,
  SECONDARY_LEVELS,
  UNIVERSITY_YEAR_MAX,
} from "../components/userTypeData";

const getNextPage = (formType) => {
  switch (formType) {
    case "DASS-21":
      return "/dass-21/1";
    case "STRESS":
      return "/stress/1";
    case "2Q9Q8Q":
      return "/2q/1";
    case "BURNOUT":
      return "/burnout/1";
    case "RQ":
      return "/rq/1";
    default:
      return "/dass-21/1";
  }
};

export default function FormOption2() {
  const [step2Data, setStep2Data] = useState({
    gender: "", age: "", year: "",
    email: "", tel: "", sos_tel: "", form_type: "",
  });

  // userType แยก นศ.ราชวิทยาลัยจุฬาภรณ์ บุคลากรราชวิทยาลัยจุฬาภรณ์ บุคคลภายนอก
  const [userType, setUserType] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [outsiderLevel, setOutsiderLevel] = useState("");
  const [outsiderSubLevel, setOutsiderSubLevel] = useState("");
  const [otherPosition, setOtherPosition] = useState(""); // สำหรับ "อื่น ๆ ระบุ"

  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const formType = searchParams.get("form_type");
    if (formType) setStep2Data((prev) => ({ ...prev, form_type: formType }));
  }, [location]);

  // compose year string อัตโนมัติ
  useEffect(() => {
    let yearValue = "";
    if (userType === "นศ.ราชวิทยาลัยจุฬาภรณ์") {
      const parts = [selectedFaculty, selectedCourse, selectedYear].filter(Boolean);
      yearValue = parts.length ? `นศ. ${parts.join(" ")}` : "";
    } else if (userType === "บุคลากรราชวิทยาลัยจุฬาภรณ์") {
      const resolvedPosition = selectedPosition === "อื่น ๆ ระบุ" ? otherPosition : selectedPosition;
      const parts = [selectedFaculty, resolvedPosition].filter(Boolean);
      yearValue = parts.length ? `บุคลากร ${parts.join(" ")}` : "";
    } else if (userType === "บุคคลภายนอก") {
      const parts = [outsiderLevel, outsiderSubLevel].filter(Boolean);
      yearValue = parts.length ? `ภายนอก ${parts.join(" ")}` : "";
    }
    setStep2Data((prev) => ({ ...prev, year: yearValue }));
  }, [userType, selectedFaculty, selectedCourse, selectedYear, selectedPosition, outsiderLevel, outsiderSubLevel, otherPosition]);

  useEffect(() => {
    liff.init({ liffId: import.meta.env.VITE_LIFF_ID })
      .then(() => {
        if (liff.isLoggedIn()) {
          const token = liff.getAccessToken();
          setAccessToken(token);
          console.log("Login Success")
        } else {
          liff.login();
        }
      })
      .catch((err) => {
        console.error("Error initializing LIFF:", err);
        setFormErrors((prev) => ({ ...prev, api: "ไม่สามารถเชื่อมต่อ LIFF ได้" }));
      });
  }, []); 

  const onChange = (evt) => {
    const { name, value } = evt.target;
    setStep2Data((old) => ({ ...old, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => { const e = { ...prev }; delete e[name]; return e; });
    }
  };

  const clearYearError = () => {
    if (formErrors.year) {
      setFormErrors((prev) => { const e = { ...prev }; delete e.year; return e; });
    }
  };

  const handleUserTypeChange = (e) => {
    setUserType(e.target.value);
    setSelectedFaculty(""); setSelectedCourse(""); setSelectedYear("");
    setSelectedPosition(""); setOutsiderLevel(""); setOutsiderSubLevel(""); setOtherPosition("");
    clearYearError();
    if (formErrors.userType) {
      setFormErrors((prev) => { const e = { ...prev }; delete e.userType; return e; });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!step2Data.uid?.trim())   errors.uid      = "ไม่พบข้อมูล UID";
    if (!step2Data.gender)        errors.gender   = "กรุณาเลือกเพศ";
    if (!step2Data.age)           errors.age      = "กรุณาเลือกช่วงอายุ";
    if (!userType)                errors.userType = "กรุณาเลือกประเภทผู้ใช้งาน";

    if (userType === "นศ.ราชวิทยาลัยจุฬาภรณ์") {
      if (!selectedFaculty)      errors.year = "กรุณาเลือกคณะ";
      else if (!selectedCourse)  errors.year = "กรุณาเลือกหลักสูตร";
      else if (!selectedYear)    errors.year = "กรุณาเลือกชั้นปี";
    } else if (userType === "บุคลากรราชวิทยาลัยจุฬาภรณ์") {
      if (!selectedFaculty)       errors.year = "กรุณาเลือกสังกัด";
      else if (!selectedPosition) errors.year = "กรุณาเลือกตำแหน่ง";
      else if (selectedPosition === "อื่น ๆ ระบุ" && !otherPosition.trim())
        errors.year = "กรุณาระบุตำแหน่ง";
    } else if (userType === "บุคคลภายนอก") {
      if (!outsiderLevel) errors.year = "กรุณาเลือกระดับการศึกษา/อายุ";
      else if ((outsiderLevel === "มัธยมศึกษา" || outsiderLevel === "อุดมศึกษา") && !outsiderSubLevel)
        errors.year = `กรุณาเลือก${outsiderLevel === "มัธยมศึกษา" ? "ระดับชั้น" : "ชั้นปี"}`;
    }

    /* if (!step2Data.email)
      errors.email = "กรุณากรอกอีเมล";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(step2Data.email))
      errors.email = "รูปแบบอีเมลไม่ถูกต้อง"; */

    if (!step2Data.tel)
      errors.tel = "กรุณากรอกเบอร์ติดต่อ";
    else if (!/^[0-9]{10}$/.test(step2Data.tel))
      errors.tel = "กรุณากรอกเบอร์ติดต่อให้ถูกต้อง (10 หลัก)";

    if (step2Data.sos_tel && !/^[0-9]{10}$/.test(step2Data.sos_tel))
      errors.sos_tel = "กรุณากรอกเบอร์ติดต่อฉุกเฉินให้ถูกต้อง (10 หลัก)";

    if (!step2Data.form_type) errors.form_type = "ไม่พบประเภทแบบฟอร์ม";

    return errors;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    /* console.log(step2Data) */
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }

    setLoading(true);
    setFormErrors({});
    try {
      const VITE_API_PATH = import.meta.env.VITE_API_PATH;
      await axios.post(`${VITE_API_PATH}/user/register`, { ...step2Data, userType, accessToken });
      localStorage.setItem("userProfile", JSON.stringify({ ...step2Data, userType }));
      navigate(getNextPage(step2Data.form_type));
    } catch (error) {
      console.error("API Error:", error);
      if (error.response) {
        setFormErrors({ api: `เกิดข้อผิดพลาด (${error.response.status}): ${error.response.data?.message || "โปรดลองอีกครั้งภายหลัง"}` });
      } else if (error.request) {
        setFormErrors({ api: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ต" });
      } else {
        setFormErrors({ api: "เกิดข้อผิดพลาดในการส่งข้อมูล โปรดลองอีกครั้งภายหลัง" });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  const studentFaculties    = Object.keys(STUDENT_FACULTY_DATA);
  const staffFaculties      = Object.keys(STAFF_POSITION_DATA);
  const selectedFacultyData = userType === "นศ.ราชวิทยาลัยจุฬาภรณ์" && selectedFaculty
    ? STUDENT_FACULTY_DATA[selectedFaculty] : null;
  const yearRange = selectedFacultyData?.yearRange ?? 4;

  return (
    <div>
      <Logo />
      <div className="step-2">
        <h1>STEP 2 :</h1>
        <p>กรอกข้อมูลผู้ขอรับคำปรึกษาเบื้องต้น</p>
      </div>

      {formErrors.api && <p className="error-message">{formErrors.api}</p>}
      {"\n"}
      {formErrors.uid && <p className="field-error">{formErrors.uid}</p>}

      <div className="form-fill">
        <form onSubmit={onSubmit}>

          {/* เพศ + ช่วงอายุ */}
          <div className="gender-age">
            <RxPerson className="ioperson" />
            <select className={`gender ${formErrors.gender ? "input-error" : ""}`}
              value={step2Data.gender} name="gender" onChange={onChange} required aria-label="Gender">
              <option value="">เพศ</option>
              <option value="ชาย">ชาย</option>
              <option value="หญิง">หญิง</option>
              <option value="อื่นๆ">อื่นๆ</option>
            </select>
            <select className={`age ${formErrors.age ? "input-error" : ""}`}
              value={step2Data.age} name="age" onChange={onChange} required aria-label="Age Generation"
              title={AGE_OPTIONS.find((o) => o.value === step2Data.age)?.label || ""}>
              {AGE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          {formErrors.gender && <p className="field-error">{formErrors.gender}</p>}
          {formErrors.age    && <p className="field-error">{formErrors.age}</p>}

          {/* ประเภทผู้ใช้งาน */}
          <div className="eduLevel">
            <label>ประเภทผู้ใช้งาน</label>
            <select className={`eduLevel ${formErrors.userType ? "input-error" : ""}`}
              value={userType} onChange={handleUserTypeChange} required aria-label="User Type">
              <option value="">-- เลือกประเภทผู้ใช้งาน --</option>
              {USER_TYPES.map((ut) => <option key={ut.value} value={ut.value}>{ut.label}</option>)}
            </select>
            {formErrors.userType && <p className="field-error">{formErrors.userType}</p>}
          </div>

          {/* นักศึกษาราชวิทยาลัยจุฬาภรณ์ */}
          {userType === "นศ.ราชวิทยาลัยจุฬาภรณ์" && (
            <>
              <div className="faculty">
                <label>คณะ</label>
                <select className={`faculty ${formErrors.year ? "input-error" : ""}`}
                  value={selectedFaculty} required aria-label="Faculty"
                  onChange={(e) => { setSelectedFaculty(e.target.value); setSelectedCourse(""); setSelectedYear(""); clearYearError(); }}>
                  <option value="">-- เลือกคณะ --</option>
                  {studentFaculties.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              {selectedFaculty && (
                <div className="course">
                  <label>หลักสูตร</label>
                  <select className={`course ${formErrors.year ? "input-error" : ""}`}
                    value={selectedCourse} required aria-label="Course"
                    onChange={(e) => { setSelectedCourse(e.target.value); setSelectedYear(""); clearYearError(); }}>
                    <option value="">-- เลือกหลักสูตร --</option>
                    {STUDENT_FACULTY_DATA[selectedFaculty].courses.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}

              {selectedCourse && (
                <div className="secondaryLevel">
                  <label>ชั้นปี</label>
                  <select className={`secondaryLevel ${formErrors.year ? "input-error" : ""}`}
                    value={selectedYear} required aria-label="Year"
                    onChange={(e) => { setSelectedYear(e.target.value); clearYearError(); }}>
                    <option value="">-- เลือกชั้นปี --</option>
                    {Array.from({ length: yearRange }, (_, i) => i + 1).map((yr) => (
                      <option key={yr} value={`ชั้นปีที่ ${yr}`}>ชั้นปีที่ {yr}</option>
                    ))}
                  </select>
                </div>
              )}
              {formErrors.year && <p className="field-error">{formErrors.year}</p>}
            </>
          )}

          {/* บุคลากรราชวิทยาลัยจุฬาภรณ์ */}
          {userType === "บุคลากรราชวิทยาลัยจุฬาภรณ์" && (
            <>
              <div className="faculty">
                <label>สังกัด</label>
                <select className={`faculty ${formErrors.year ? "input-error" : ""}`}
                  value={selectedFaculty} required aria-label="Department"
                  onChange={(e) => { setSelectedFaculty(e.target.value); setSelectedPosition(""); clearYearError(); }}>
                  <option value="">-- เลือกสังกัด --</option>
                  {staffFaculties.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              {selectedFaculty && (
                <div className="secondaryLevel">
                  <label>ตำแหน่ง</label>
                  <select className={`secondaryLevel ${formErrors.year ? "input-error" : ""}`}
                    value={selectedPosition} required aria-label="Position"
                    onChange={(e) => { setSelectedPosition(e.target.value); setOtherPosition(""); clearYearError(); }}>
                    <option value="">-- เลือกตำแหน่ง --</option>
                    {STAFF_POSITION_DATA[selectedFaculty].map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              )}

              {selectedPosition === "อื่น ๆ ระบุ" && (
                <div className="secondaryLevel">
                  <label>ระบุตำแหน่ง</label>
                  <input
                    className={`email ${formErrors.year ? "input-error" : ""}`}
                    type="text"
                    placeholder="กรุณาระบุตำแหน่ง"
                    required={selectedPosition === "อื่น ๆ ระบุ"}
                    value={otherPosition}
                    onChange={(e) => { setOtherPosition(e.target.value); clearYearError(); }}
                    aria-label="Other Position"
                  />
                </div>
              )}
              {formErrors.year && <p className="field-error">{formErrors.year}</p>}
            </>
          )}

          {/* บุคคลภายนอก */}
          {userType === "บุคคลภายนอก" && (
            <>
              <div className="eduLevel">
                <label>ระดับการศึกษา / ช่วงอายุ</label>
                <select className={`eduLevel ${formErrors.year ? "input-error" : ""}`}
                  value={outsiderLevel} required aria-label="Outsider Level"
                  onChange={(e) => { setOutsiderLevel(e.target.value); setOutsiderSubLevel(""); clearYearError(); }}>
                  <option value="">-- เลือกระดับการศึกษา/อายุ --</option>
                  {OUTSIDER_LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>

              {outsiderLevel === "มัธยมศึกษา" && (
                <div className="secondaryLevel">
                  <label>ระดับชั้น</label>
                  <select className={`secondaryLevel ${formErrors.year ? "input-error" : ""}`}
                    value={outsiderSubLevel} required aria-label="Secondary School Level"
                    onChange={(e) => { setOutsiderSubLevel(e.target.value); clearYearError(); }}>
                    <option value="">เลือกระดับชั้น</option>
                    {SECONDARY_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              )}

              {outsiderLevel === "อุดมศึกษา" && (
                <div className="secondaryLevel">
                  <label>ชั้นปี</label>
                  <select className={`secondaryLevel ${formErrors.year ? "input-error" : ""}`}
                    value={outsiderSubLevel} required aria-label="University Year"
                    onChange={(e) => { setOutsiderSubLevel(e.target.value); clearYearError(); }}>
                    <option value="">เลือกชั้นปี</option>
                    {Array.from({ length: UNIVERSITY_YEAR_MAX }, (_, i) => i + 1).map((yr) => (
                      <option key={yr} value={`ปีที่ ${yr}`}>ปีที่ {yr}</option>
                    ))}
                  </select>
                </div>
              )}
              {formErrors.year && <p className="field-error">{formErrors.year}</p>}
            </>
          )}

          {/* อีเมล */}
          <div className="email">
            <label>อีเมล </label>
            <input className={`email ${formErrors.email ? "input-error" : ""}`}
              type="email" placeholder="example@gmail.com"
              value={step2Data.email} name="email" onChange={onChange} aria-label="Email" />
            {formErrors.email && <p className="field-error">{formErrors.email}</p>}
          </div>

          {/* เบอร์ติดต่อ */}
          <div className="tel">
            <label>เบอร์ติดต่อ </label>
            <input className={`tel ${formErrors.tel ? "input-error" : ""}`}
              type="tel" placeholder="0000000000"
              value={step2Data.tel} name="tel" onChange={onChange} required aria-label="Telephone" />
            <small>Ex: 0000000000</small>
            {formErrors.tel && <p className="field-error">{formErrors.tel}</p>}
          </div>

          {/* เบอร์ติดต่อฉุกเฉิน */}
          <div className="sos-tel">
            <label>เบอร์ติดต่อฉุกเฉิน (Optional)</label>
            <input className={`sos-tel ${formErrors.sos_tel ? "input-error" : ""}`}
              type="tel" placeholder="0000000000"
              value={step2Data.sos_tel} name="sos_tel" onChange={onChange} aria-label="Emergency Telephone" />
            <small>Ex: 0000000000</small>
            {formErrors.sos_tel && <p className="field-error">{formErrors.sos_tel}</p>}
          </div>

          <div className="next-btn">
            <button type="submit" className="btn btn-next">ต่อไป</button>
          </div>
        </form>
      </div>
    </div>
  );
}