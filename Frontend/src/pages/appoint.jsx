import React, { useState, useEffect } from "react";
import "./appoint.css";
import Logo from "../components/logo";
import { useNavigate } from "react-router-dom";
import CustomRadioButton from "../components/CustomRadioButton";
import Loading from "../components/Loading";
import liff from "@line/liff";
import axios from "axios";

const topics = {
  พัฒนาการเรียน: [
    "พัฒนาประสิทธิภาพการเรียน",
    "การจัดการเวลา",
    "ค้นหาศักยภาพตนเอง",
    "สภาพแวดล้อมหรือบรรยากาศการเรียน",
    "หมดไฟ-แรงใจในการเรียน(Burnout – Brownout)",
  ],
  สุขภาพจิตและความเครียด: [
    "การเป็นที่ยอมรับ / คุณค่าในตนเอง",
    "ความเครียดจากการเรียน-ความกดดัน-ภาระงาน",
    "ภาวะทางอารมณ์ / ซึมเศร้า / การสูญเสีย",
  ],
  ความสัมพันธ์: [
    "ความสัมพันธ์กับอาจารย์",
    "ความสัมพันธ์กับเพื่อน",
    "ครอบครัว",
    "ความรัก",
    "เพศสัมพันธ์",
  ],
  สถานะการเงิน: [],
  "ติดโทรศัพท์มือถือ / อินเตอร์เน็ต /เกมส์ / สารเสพติด": [],
  ความยืดหยุ่นทางจิตใจ: [],
  เพศทางเลือก: [],
  อื่นๆ: [],
};

export default function Appoint() {
  const [appointData, setAppointData] = useState({
    uid: "",
    tel: "",
    contactMethod: "",
    medDoctor: "",
    date: "",
    time: "",
    topic: "",
    detail: "",
    subtopic: "",
    medHistory: "",
  });

  const [timeSlots, setTimeSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState("");
  const [error, setError] = useState("");
  const [staffList, setStaffList] = useState([]);
  const navigate = useNavigate();
  const VITE_API_PATH = import.meta.env.VITE_API_PATH;

  useEffect(() => {
    liff
      .init({ liffId: import.meta.env.VITE_APPOINT_ID })
      .then(() => {
        if (liff.isLoggedIn()) {
          liff
            .getProfile()
            .then((profile) => {
              setAppointData((prevData) => ({
                ...prevData,
                uid: profile.userId,
              }));
            })
            .catch((err) => console.error("Error getting profile:", err));
        } else {
          liff.login();
        }
      })
      .catch((err) => console.error("Error initializing LIFF:", err));

    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];
    setCurrentDate(formattedDate);
  }, []);

  useEffect(() => {
    axios
      .get(`${VITE_API_PATH}/allStaff`)
      .then((response) => {
        if (Array.isArray(response.data)) {
          setStaffList(response.data);
        } else {
          console.error("Unexpected response format:", response.data);
          setStaffList([]);
        }
      })
      .catch((error) => {
        console.error(
          "Error fetching staff data:",
          error.response?.data || error.message
        );
        setStaffList([]);
      });
  }, []);

  useEffect(() => {
    if (appointData.date && appointData.medDoctor) {
      fetchAvailableTimeSlots();
    }
  }, [appointData.date, appointData.medDoctor]);

  const onSubmit = (e) => {
    e.preventDefault();
    const requiredFields = [
      "contactMethod",
      "medDoctor",
      "date",
      "time",
      "topic",
      "detail",
      "medHistory",
    ];
    for (const field of requiredFields) {
      if (!appointData[field]) {
        setError("กรุณากรอกข้อมูลให้ครบทุกช่องที่มีเครื่องหมาย *");
        return;
      }
    }

    if (appointData.date < currentDate) {
      setError("กรุณาเลือกวันที่ถูกต้อง");
      return;
    }
    setError("");
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      navigate("/appoint/confirm", { state: { appointData } });
    }, 1000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAppointData((prevData) => {
      if (name === "topic" && !hasSubtopics(value)) {
        return {
          ...prevData,
          [name]: value,
          subtopic: "",
        };
      }
      return {
        ...prevData,
        [name]: value,
      };
    });
  };

  const handleRadioSelect = (name, value) => {
    setAppointData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === "contactMethod" && value === "Google Meet") {
      setAppointData((prevData) => ({
        ...prevData,
        tel: "",
      }));
    }
  };

  const fetchAvailableTimeSlots = () => {
    if (!appointData.date || !appointData.medDoctor) return;
    setLoadingSlots(true);

    axios
      .post(`${VITE_API_PATH}/getStaffTimeByDate`, {
        staff_id: appointData.medDoctor,
        date: appointData.date,
      })
      .then((response) => {
        let availableTimes = response.data;

        if (Array.isArray(availableTimes)) {
          // Convert times to usable format
          availableTimes = availableTimes.map((slot) => ({
            start: slot.time_start,
            end: slot.time_end,
          }));

          // If the selected date is today, filter times at least 6 hours ahead
          if (appointData.date === currentDate) {
            const now = new Date();
            const currentTime = now.getHours() * 60 + now.getMinutes(); // Convert current time to minutes

            availableTimes = availableTimes.filter((slot) => {
              const [startHour, startMinute] = slot.start
                .split(":")
                .map(Number);
              const startTimeInMinutes = startHour * 60 + startMinute;

              // Check if the start time is at least 6 hours (360 minutes) ahead of the current time
              return startTimeInMinutes >= currentTime + 360;
            });
          }

          setTimeSlots(availableTimes);
        } else {
          console.error("Unexpected response format:", response.data);
          setTimeSlots([]);
        }
      })
      .catch((error) => {
        console.error(
          "Error fetching available time slots:",
          error.response?.data || error.message
        );
        setTimeSlots([]);
      })
      .finally(() => {
        setLoadingSlots(false);
      });
  };

  const hasSubtopics = (topic) => topics[topic]?.length > 0;

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <Logo />
      <div className="appoint-topic">
        <h1>นัดหมายพบเจ้าหน้าที่</h1>
      </div>
      <div className="appoint-form">
        <form onSubmit={onSubmit}>
          <div className="userid">
            UID: <small>{appointData.uid}</small>
          </div>
          <div className="app-contact">
            <label>
              ช่องทางการติดต่อ<mark> *</mark>
            </label>
            <div className="contact-container">
              <ul style={{ listStyleType: "none", padding: 0 }}>
                <CustomRadioButton
                  label="Google Meet"
                  value="Google Meet"
                  name="contactMethod"
                  selected={appointData.contactMethod === "Google Meet"}
                  onSelect={(value) =>
                    handleRadioSelect("contactMethod", value)
                  }
                  required
                />
                <CustomRadioButton
                  label="เบอร์โทร"
                  value="เบอร์โทร"
                  name="contactMethod"
                  selected={appointData.contactMethod === "เบอร์โทร"}
                  onSelect={(value) =>
                    handleRadioSelect("contactMethod", value)
                  }
                  required
                />
              </ul>
            </div>
          </div>
          {appointData.contactMethod !== "Google Meet" && (
            <div className="app-tel">
              <label>
                หมายเลขโทรศัพท์<mark> *</mark>
              </label>
              <br />
              <small>Example: 0000000000</small>
              <br />
              <input
                className="app-tel"
                type="tel"
                placeholder="0000000000"
                pattern="[0-9]{10}"
                value={appointData.tel}
                name="tel"
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="app-advisor">
            <label>
              เลือกผู้ให้คำปรึกษา<mark> *</mark>
              <br />
              <select
                name="medDoctor"
                value={appointData.medDoctor}
                onChange={handleChange}
                required
              >
                <option value="">เลือกผู้ให้คำปรึกษา</option>
                {staffList.map((staff) => (
                  <option key={staff.staff_id} value={staff.staff_id}>
                    {`${staff.staff_id} ${staff.name} ${staff.surname} (${staff.nickname})`}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="app-time">
            <label>
              วันที่และเวลา<mark> *</mark>
              <br />
              <input
                type="date"
                name="date"
                value={appointData.date}
                min={currentDate}
                onChange={handleChange}
                required
              />
              <br />
              <select
                name="time"
                value={appointData.time}
                onChange={handleChange}
                required
                disabled={!appointData.date || loadingSlots}
              >
                {loadingSlots ? (
                  <option>Loading slots...</option>
                ) : timeSlots.length === 0 ? (
                  <option value="">ผู้ให้คำปรึกษาคนนี้ไม่มีเวลาที่ว่าง</option>
                ) : (
                  <>
                    <option value="">เลือกเวลา</option>
                    {timeSlots.map((timeSlot) => (
                      <option key={timeSlot.start} value={`${timeSlot.start}`}>
                        {`${timeSlot.start} - ${timeSlot.end}`}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </label>
          </div>
          <div className="app-detail">
            <label>
              ประเด็นที่ต้องการปรึกษา<mark> *</mark>
              <br />
              <select
                name="topic"
                value={appointData.topic}
                onChange={handleChange}
                required
              >
                <option value="">เลือกประเด็นที่ต้องการปรึกษา</option>
                {Object.keys(topics).map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {hasSubtopics(appointData.topic) && (
            <div className="app-detail">
              <label>
                ประเด็นย่อย
                <br />
                <select
                  name="subtopic"
                  value={appointData.subtopic}
                  onChange={handleChange}
                  required
                >
                  <option value="">เลือกประเด็นย่อย</option>
                  {topics[appointData.topic].map((subtopic) => (
                    <option key={subtopic} value={subtopic}>
                      {subtopic}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
          <div className="app-detail">
            <label>
              รายละเอียดที่ขอรับการปรึกษา
              <br />
              <textarea
                className="app-detail"
                name="detail"
                value={appointData.detail}
                onChange={handleChange}
                placeholder="รายละเอียด เช่น อาการที่เกิดขึ้น"
                required
              />
            </label>
          </div>
          <div className="med-his">
            <label>
              ประวัติการรับยา
              <br />
              <textarea
                className="med-his"
                name="medHistory"
                value={appointData.medHistory}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          {error && <p className="error-message">{error}</p>}

          <div className="dass21-app-footer">
            <button type="submit" className="btn btn-next">
              จองเลย
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
