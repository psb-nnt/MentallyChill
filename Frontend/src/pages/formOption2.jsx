import React, { useState, useEffect } from "react";
import "./formOption2.css";
import Logo from "../components/logo";
import { useNavigate, useLocation } from "react-router-dom";
import { RxPerson } from "react-icons/rx";
import Loading from "../components/Loading";
import liff from "@line/liff";
import axios from "axios";

const ageOptions = [
  { value: "", label: "ช่วงอายุ" },
  { value: "The Silent Generation", label: "Silent Gen (2471-2488)" },
  { value: "Gen Baby Boom", label: "Baby Boom (2489-2507)" },
  { value: "Gen X", label: "Gen X (2508-2522)" },
  { value: "Gen Y", label: "Gen Y (2523-2540)" },
  { value: "Gen Z", label: "Gen Z (2541-2565)" },
  { value: "Gen Alpha", label: "Gen Alpha (2566- )" },
];

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
    case "ST-5":
      return "/st-5/1";
    default:
      return "/dass-21/1";
  }
};

export default function FormOption2() {
  const [step2Data, setStep2Data] = useState({
    uid: "",
    gender: "",
    age: "",
    year: "",
    email: "",
    tel: "",
    sos_tel: "",
    form_type: "",
  });

  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get form_type from URL query parameters
    const searchParams = new URLSearchParams(location.search);
    const formType = searchParams.get("form_type");
    if (formType) {
      setStep2Data((prev) => ({
        ...prev,
        form_type: formType,
      }));
    }
  }, [location]);

  const getAgeLabel = (value) => {
    const option = ageOptions.find((opt) => opt.value === value);
    return option ? option.label : value;
  };

  useEffect(() => {
    const uid = localStorage.getItem("uid");
    if (uid) {
      setStep2Data((prevData) => ({
        ...prevData,
        uid: uid,
      }));
    } else {
      liff
        .init({ liffId: "2005311386-6GQLXp7Z" })
        .then(() => {
          if (liff.isLoggedIn()) {
            liff
              .getProfile()
              .then((profile) => {
                setStep2Data((prevData) => ({
                  ...prevData,
                  uid: profile.userId,
                }));
                localStorage.setItem("uid", profile.userId);
              })
              .catch((err) => {
                console.error("Error getting profile:", err);
                setFormErrors({
                  ...formErrors,
                  uid: "ไม่สามารถรับข้อมูลโปรไฟล์ได้",
                });
              });
          } else {
            liff.login();
          }
        })
        .catch((err) => {
          console.error("Error initializing LIFF:", err);
          setFormErrors({ ...formErrors, uid: "ไม่สามารถเชื่อมต่อ LIFF ได้" });
        });
    }
  }, []);

  const onChange = (evt) => {
    const { name, value } = evt.target;
    setStep2Data((oldData) => ({
      ...oldData,
      [name]: value,
    }));

    // ลบข้อความผิดพลาดเมื่อผู้ใช้แก้ไขข้อมูล
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // ตรวจสอบความถูกต้องของข้อมูล
  const validateForm = () => {
    const errors = {};

    if (!step2Data.uid && !step2Data.uid.trim()) {
      errors.uid = "ไม่พบข้อมูล UID";
    }

    if (!step2Data.gender) {
      errors.gender = "กรุณาเลือกเพศ";
    }

    if (!step2Data.age) {
      errors.age = "กรุณาเลือกช่วงอายุ";
    }

    const yearParts = step2Data.year.split(" ");
    if (!step2Data.year || !yearParts[0]) {
      errors.year = "กรุณาเลือกระดับการศึกษาหรือตำแหน่ง";
    } else {
      const level = yearParts[0]; // มัธยมศึกษา, อุดมศึกษา, บุคลากร
      const subLevel = yearParts[1]; // ระดับชั้น, คณะ, ตำแหน่ง
      const detail = yearParts[2]; // รายละเอียดเพิ่มเติม (ถ้ามี)

      if (!subLevel) {
        errors.year = `กรุณาเลือก${
          level === "มัธยมศึกษา"
            ? "ระดับชั้น"
            : level === "อุดมศึกษา"
            ? "คณะ"
            : "ตำแหน่ง"
        }`;
      } else if (
        (level === "บุคลากร" && !detail) ||
        (level === "อุดมศึกษา" && subLevel === "คณะพยาบาล" && !detail)
      ) {
        errors.year = `กรุณาเลือก${
          level === "บุคลากร" ? "สังกัด" : "หลักสูตร"
        }`;
      }
    }

    if (!step2Data.email) {
      errors.email = "กรุณากรอกอีเมล";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(step2Data.email)) {
      errors.email = "รูปแบบอีเมลไม่ถูกต้อง";
    }

    if (!step2Data.tel) {
      errors.tel = "กรุณากรอกเบอร์ติดต่อ";
    } else if (!/^[0-9]{10}$/.test(step2Data.tel)) {
      errors.tel = "กรุณากรอกเบอร์ติดต่อให้ถูกต้อง (10 หลัก)";
    }

    if (step2Data.sos_tel && !/^[0-9]{10}$/.test(step2Data.sos_tel)) {
      errors.sos_tel = "กรุณากรอกเบอร์ติดต่อฉุกเฉินให้ถูกต้อง (10 หลัก)";
    }

    if (!step2Data.form_type) {
      errors.form_type = "ไม่พบประเภทแบบฟอร์ม";
    }

    return errors;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting form with data:", step2Data);

    // ตรวจสอบความถูกต้องของข้อมูล
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);
    setFormErrors({});

    try {
      const VITE_API_PATH = import.meta.env.VITE_API_PATH;
      const response = await axios.post(
        `${VITE_API_PATH}/user/register`,
        step2Data
      );

      localStorage.setItem("userProfile", JSON.stringify(step2Data));

      const nextPage = getNextPage(step2Data.form_type);
      navigate(nextPage);
    } catch (error) {
      console.error("API Error:", error);

      if (error.response) {
        // กรณี API ตอบกลับด้วย status code ที่ไม่ใช่ 2xx
        setFormErrors({
          api: `เกิดข้อผิดพลาด (${error.response.status}): ${
            error.response.data?.message || "โปรดลองอีกครั้งภายหลัง"
          }`,
        });
      } else if (error.request) {
        // กรณีส่งคำขอไปแล้วแต่ไม่ได้รับการตอบกลับ
        setFormErrors({
          api: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ต",
        });
      } else {
        setFormErrors({
          api: "เกิดข้อผิดพลาดในการส่งข้อมูล โปรดลองอีกครั้งภายหลัง",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

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
          <div className="form_uid">
            UID: <small>{step2Data.uid}</small>
            <br />
          </div>

          <div className="gender-age">
            <RxPerson className="ioperson" />
            <select
              className={`gender ${formErrors.gender ? "input-error" : ""}`}
              value={step2Data.gender}
              name="gender"
              onChange={onChange}
              required
              aria-label="Gender"
            >
              <option value="">เพศ</option>
              <option value="ชาย">ชาย</option>
              <option value="หญิง">หญิง</option>
              <option value="อื่นๆ">อื่นๆ</option>
            </select>

            <select
              className={`age ${formErrors.age ? "input-error" : ""}`}
              value={step2Data.age}
              name="age"
              onChange={onChange}
              required
              aria-label="Age Generation"
              title={
                ageOptions.find((opt) => opt.value === step2Data.age)?.label ||
                ""
              }
            >
              {ageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {formErrors.gender && (
            <p className="field-error">{formErrors.gender}</p>
          )}
          {formErrors.age && <p className="field-error">{formErrors.age}</p>}

          <div className="eduLevel">
            <label>ระดับการศึกษา</label>
            <select
              className={`eduLevel ${formErrors.year ? "input-error" : ""}`}
              name="year"
              value={step2Data.year.split(" ")[0] || ""} // Get first part (education level)
              onChange={(e) => {
                setStep2Data((oldData) => ({
                  ...oldData,
                  year: e.target.value, // Reset year
                }));
                // ลบข้อความผิดพลาดเมื่อผู้ใช้แก้ไขข้อมูล
                if (formErrors.year) {
                  setFormErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.year;
                    return newErrors;
                  });
                }
              }}
              required
              aria-label="Education Level"
            >
              <option value="">เลือกระดับการศึกษาหรือตำแหน่ง</option>
              <option value="มัธยมศึกษา">มัธยมศึกษา</option>
              <option value="อุดมศึกษา">อุดมศึกษา</option>
              <option value="บุคลากร">บุคลากร</option>
            </select>
            {formErrors.year && (
              <p className="field-error">{formErrors.year}</p>
            )}
          </div>

          {step2Data.year.startsWith("มัธยมศึกษา") && (
            <div className="secondaryLevel">
              <label>ระดับชั้น</label>
              <select
                className={`secondaryLevel ${
                  formErrors.year ? "input-error" : ""
                }`}
                name="year"
                value={step2Data.year.split(" ")[1] || ""} // Get second part (school year)
                onChange={(e) => {
                  setStep2Data((oldData) => ({
                    ...oldData,
                    year: `${oldData.year.split(" ")[0]} ${e.target.value}`, // Combine
                  }));
                  if (formErrors.year) {
                    setFormErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.year;
                      return newErrors;
                    });
                  }
                }}
                required
                aria-label="Secondary School Level"
              >
                <option value="">เลือกระดับชั้น</option>
                <option value="ม.1">ม.1</option>
                <option value="ม.2">ม.2</option>
                <option value="ม.3">ม.3</option>
                <option value="ม.4">ม.4</option>
                <option value="ม.5">ม.5</option>
                <option value="ม.6">ม.6</option>
              </select>
            </div>
          )}

          {step2Data.year.startsWith("อุดมศึกษา") && (
            <div className="faculty">
              <label>คณะ</label>
              <select
                className={`faculty ${formErrors.year ? "input-error" : ""}`}
                name="year"
                value={step2Data.year.split(" ")[1] || ""} // Get second part (faculty)
                onChange={(e) => {
                  setStep2Data((oldData) => ({
                    ...oldData,
                    year: `${oldData.year.split(" ")[0]} ${e.target.value}`, // Combine
                  }));
                  if (formErrors.year) {
                    setFormErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.year;
                      return newErrors;
                    });
                  }
                }}
                required
                aria-label="Faculty"
              >
                <option value="">เลือกคณะ</option>
                <option value="คณะพยาบาล">คณะพยาบาล</option>
                <option value="คณะเทคโนโลยีการแพทย์">
                  คณะเทคโนโลยีการแพทย์
                </option>
                <option value="คณะแพทย์ศาสตร์">คณะแพทย์ศาสตร์</option>
                <option value="คณะวิศวกรรมศาสตร์">คณะวิศวกรรมศาสตร์</option>
                <option value="คณะศึกษาศาสตร์">คณะศึกษาศาสตร์</option>
                <option value="คณะวิทยาศาสตร์">คณะวิทยาศาสตร์</option>
              </select>
            </div>
          )}

          {step2Data.year.startsWith("บุคลากร") && (
            <div className="secondaryLevel">
              <label>ตำแหน่ง</label>
              <select
                className={`secondaryLevel ${
                  formErrors.year ? "input-error" : ""
                }`}
                name="year"
                value={step2Data.year.split(" ")[1] || ""} // Get second part (position)
                onChange={(e) => {
                  setStep2Data((oldData) => ({
                    ...oldData,
                    year: `${oldData.year.split(" ")[0]} ${e.target.value}`, // Combine
                  }));
                  if (formErrors.year) {
                    setFormErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.year;
                      return newErrors;
                    });
                  }
                }}
                required
                aria-label="Position"
              >
                <option value="">เลือกตำแหน่ง</option>
                <option value="อาจารย์">อาจารย์</option>
                <option value="พยาบาล">พยาบาล</option>
                <option value="นักศึกษา">นักศึกษา</option>
                <option value="ผู้ช่วยพยาบาล">ผู้ช่วยพยาบาล</option>
                <option value="บุคลากรทางการแพทย์">บุคลากรทางการแพทย์</option>
                <option value="บุคลากรสายวิชาการ">บุคลากรสายวิชาการ</option>
                <option value="สนับสนุนทั่วไป">สนับสนุนทั่วไป</option>
              </select>
            </div>
          )}

          {step2Data.year.split(" ")[0] === "บุคลากร" && (
            <div className="course">
              <label>เลือกสังกัด</label>
              <select
                className={`course ${formErrors.year ? "input-error" : ""}`}
                name="year"
                value={step2Data.year.split(" ")[2] || ""} // Get third part
                onChange={(e) => {
                  setStep2Data((oldData) => ({
                    ...oldData,
                    year: `${oldData.year.split(" ")[0]} ${
                      oldData.year.split(" ")[1]
                    } ${e.target.value}`, // Combine
                  }));
                  if (formErrors.year) {
                    setFormErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.year;
                      return newErrors;
                    });
                  }
                }}
                required
                aria-label="Course"
              >
                <option value="">เลือกสังกัด</option>
                <option value="สำนักงานราชวิทยาลัยจุฬาภรณ์">
                  สำนักงานราชวิทยาลัยจุฬาภรณ์
                </option>
                <option value="โรงพยาบาลจุฬาภรณ์">โรงพยาบาลจุฬาภรณ์</option>
                <option value="วิทยาลัยวิทยาศาสตร์การแพทย์เจ้าฟ้าจุฬาภรณ์">
                  วิทยาลัยวิทยาศาสตร์การแพทย์เจ้าฟ้าจุฬาภรณ์
                </option>
                <option value="คณะแพทยศาสตร์ศรีสวางควัฒน">
                  คณะแพทยศาสตร์ศรีสวางควัฒน
                </option>
                <option value="คณะพยาบาลศาสตร์อัครราชกุมารี">
                  คณะพยาบาลศาสตร์อัครราชกุมารี
                </option>
                <option value="คณะเทคโนโลยีวิทยาศาสตร์สุขภาพ">
                  คณะเทคโนโลยีวิทยาศาสตร์สุขภาพ
                </option>
                <option value="คณะวิทยาศาสตร์">คณะวิทยาศาสตร์</option>
              </select>
            </div>
          )}

          {step2Data.year.split(" ")[1] === "คณะพยาบาล" && (
            <div className="course">
              <label>เลือกหลักสูตร</label>
              <select
                className={`course ${formErrors.year ? "input-error" : ""}`}
                name="year"
                value={step2Data.year.split(" ")[2] || ""} // Get third part
                onChange={(e) => {
                  setStep2Data((oldData) => ({
                    ...oldData,
                    year: `${oldData.year.split(" ")[0]} ${
                      oldData.year.split(" ")[1]
                    } ${e.target.value}`, // Combine
                  }));
                  if (formErrors.year) {
                    setFormErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.year;
                      return newErrors;
                    });
                  }
                }}
                required
                aria-label="Course"
              >
                <option value="">เลือกหลักสูตร</option>
                <option value="พยาบาลศาสตร์">พยาบาลศาสตร์</option>
                <option value="ปริญญาตรีสาขาอื่น">ปริญญาตรีสาขาอื่น</option>
                <option value="นานาชาติ">นานาชาติ</option>
              </select>
            </div>
          )}

          <div className="email">
            <label>อีเมล </label>
            <input
              className={`email ${formErrors.email ? "input-error" : ""}`}
              type="email"
              placeholder="example@gmail.com"
              value={step2Data.email}
              name="email"
              onChange={onChange}
              required
              aria-label="Email"
            />
            {formErrors.email && (
              <p className="field-error">{formErrors.email}</p>
            )}
          </div>

          <div className="tel">
            <label>เบอร์ติดต่อ </label>
            <input
              className={`tel ${formErrors.tel ? "input-error" : ""}`}
              type="tel"
              placeholder="0000000000"
              value={step2Data.tel}
              name="tel"
              onChange={onChange}
              required
              aria-label="Telephone"
            />
            <small>Ex: 0000000000</small>
            {formErrors.tel && <p className="field-error">{formErrors.tel}</p>}
          </div>

          <div className="sos-tel">
            <label>เบอร์ติดต่อฉุกเฉิน (Optional)</label>
            <input
              className={`sos-tel ${formErrors.sos_tel ? "input-error" : ""}`}
              type="tel"
              placeholder="0000000000"
              value={step2Data.sos_tel}
              name="sos_tel"
              onChange={onChange}
              aria-label="Emergency Telephone"
            />
            <small>Ex: 0000000000</small>
            {formErrors.sos_tel && (
              <p className="field-error">{formErrors.sos_tel}</p>
            )}
          </div>

          <div className="next-btn">
            <button type="submit" className="btn btn-next">
              ต่อไป
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
