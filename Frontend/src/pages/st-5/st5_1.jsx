import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Logo from "../../components/logo";
import CustomRadioGroup from "../../components/RadioGroup";
import Loading from "../../components/Loading";

import "../p1_dass21.css";
import "../stress/stress_1.css";

const TOTAL_QUESTIONS = 5;
const VITE_API_PATH = import.meta.env.VITE_API_PATH;

export default function ST5Form() {
  const [selectedValues, setSelectedValues] = useState({});
  const navigate = useNavigate();
  const [uid, setUid] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const storedValues = localStorage.getItem("st5Answers");
    if (storedValues) {
      setSelectedValues(JSON.parse(storedValues));
    }
    const storedUid = localStorage.getItem("uid");
    if (storedUid) {
      setUid(storedUid);
    }
  }, []);

  // เซฟระหว่างกรอก
  useEffect(() => {
    localStorage.setItem("st5Values", JSON.stringify(selectedValues));
  }, [selectedValues]);

  const handleRadioChange = (questionNumber, value) => {
    setSelectedValues((prev) => ({
      ...prev,
      [questionNumber]: parseInt(value, 10),
    }));
  };

  const areAllQuestionsAnswered = () =>
    Object.keys(selectedValues).length === TOTAL_QUESTIONS;

  const calculateTotalScore = () =>
    Object.values(selectedValues).reduce(
      (sum, v) => sum + (parseInt(v, 10) || 0),
      0
    );

  const handleSubmit = async () => {
    if (!areAllQuestionsAnswered()) {
      toast.error("โปรดตอบคำถามให้ครบทุกข้อ!", {
        position: "top-right",
        hideProgressBar: true,
        style: { fontSize: "16px", fontFamily: "ChulabhornLikitText-Regular" },
      });
      return;
    }

    const totalScore = calculateTotalScore();

    const payload = {
      uid,
      answers: selectedValues,
      scores: totalScore,
    };
    console.log(payload);
    try {
      await axios.post(`${VITE_API_PATH}/submitForms`, {
        uid: uid,
        forms_type: "st-5",
        result: JSON.stringify(payload),
      });
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
      localStorage.setItem(
        "st5Score",
        JSON.stringify({ answers: selectedValues, totalScore })
      );
      navigate("/st-5/result");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง", {
        position: "top-right",
        hideProgressBar: true,
      });
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div>
      <Logo />
      <div className="p1_dass21-content">
        <span>
          &nbsp;&nbsp;&nbsp;&nbsp;ขอให้ท่านประเมินตนเองโดยให้คะแนน 0 – 3
          ที่ตรงกับอาการ หรือความรู้สึกที่เกิดขึ้นในระยะ 2 – 4 สัปดาห์
        </span>
        <p>
          เกณฑ์การให้คะแนน
          <br />0 = ไม่มีเลย / ไม่เคย
          <br /> 1 = เป็นบางครั้ง
          <br /> 2 = เป็นบ่อย
          <br /> 3 = เป็นประจำ
        </p>

        <form className="dass21-1">
          {[1, 2, 3, 4, 5].map((qNo) => (
            <div key={qNo} className="question-item">
              <label>{`${qNo}. ${getQuestionText(qNo)}`}</label>
              <CustomRadioGroup
                questionNumber={qNo}
                selectedValue={selectedValues[qNo]}
                onChange={handleRadioChange}
                options={[0, 1, 2, 3]}
              />
            </div>
          ))}
        </form>

        <div className="p1_dass21-footer">
          <button className="btn btn-next" onClick={handleSubmit}>
            ส่ง
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

function getQuestionText(n) {
  const q = {
    1: "มีปัญหาการนอน นอนไม่หลับหรือนอนมาก",
    2: "มีสมาธิน้อยลง",
    3: "หงุดหงิด / กระวนกระวาย / ว้าวุ่นใจ",
    4: "รู้สึกเบื่อ เซ็ง",
    5: "ไม่อยากพบปะผู้คน",
  };
  return q[n];
}
