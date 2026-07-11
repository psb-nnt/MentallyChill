import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Logo from "../components/logo";
import Radio_rate from "../components/radio_rate";
import Loading from "../components/Loading";

import "./p3_dass21.css";

const QUESTIONS_RANGE = [15, 16, 17, 18, 19, 20, 21];
const CATEGORY_MAPPING = {
  15: "a",
  16: "d",
  17: "d",
  18: "s",
  19: "a",
  20: "a",
  21: "d",
};

const VITE_API_PATH = import.meta.env.VITE_API_PATH;

export default function P3_dass21() {
  const [selectedValues, setSelectedValues] = useState({});
  const [uid, setUid] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedValues = localStorage.getItem("selectedValues");
    if (storedValues) {
      setSelectedValues(JSON.parse(storedValues));
    }

    const storedUid = localStorage.getItem("uid");
    if (storedUid) {
      setUid(storedUid);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("selectedValues", JSON.stringify(selectedValues));
  }, [selectedValues]);

  const handleRadioChange = (questionNumber, value) => {
    setSelectedValues((prevValues) => ({
      ...prevValues,
      [questionNumber]: value,
    }));
    /* console.log(`Question ${questionNumber}:`, value); */
  };

  const areAllQuestionsAnswered = () => {
    return QUESTIONS_RANGE.every((question) =>
      selectedValues.hasOwnProperty(question)
    );
  };

  const calculateScores = () => {
    const previousScores = JSON.parse(localStorage.getItem("dass21Scores")) || {
      d: 0,
      a: 0,
      s: 0,
    };
    const updatedScores = Object.entries(selectedValues).reduce(
      (scores, [question, value]) => {
        const category = CATEGORY_MAPPING[question];
        if (category) {
          scores[category] += parseInt(value, 10);
        }
        return scores;
      },
      { ...previousScores }
    );
    return updatedScores;
  };

  const handleNextClick = (event) => {
    if (!areAllQuestionsAnswered()) {
      toast.error("โปรดตอบคำถามให้ครบทุกข้อ!", {
        position: "top-right",
        hideProgressBar: true,
        autoClose: 5000,
        style: {
          fontSize: "16px",
          fontFamily: "ChulabhornLikitText-Regular",
        },
      });
      event.preventDefault();
    } else {
      setIsLoading(true);
      const scores = calculateScores();
      const payload = {
        uid,
        answers: selectedValues,
        ...scores,
      };
      axios
        .post(`${VITE_API_PATH}/submitForms`, {
          uid: uid,
          forms_type: "dass21",
          result: JSON.stringify(payload),
        })
        .then(() => {
          localStorage.setItem("dass21Scores", JSON.stringify(scores)); // Save the scores
          navigate("/dass-21/criteria");
        })
        .catch((error) => {
          console.error("Error submitting form:", error);
          setIsLoading(false);
        });
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div>
      <Logo />
      <div className="p3_dass21-content">
        <span>
          &nbsp;&nbsp;&nbsp;&nbsp;โปรดอ่านแต่ละข้อความและเลือกตัวเลข 0, 1, 2
          หรือ 3 ซึ่งระบุว่าค่าดังกล่าวนั้นตรงกับคุณมากแค่ไหน
          ในช่วงสัปดาห์ที่ผ่านมา ไม่มีคำตอบที่ถูกหรือผิด
          อย่าใช้เวลามากเกินไปกับข้อความใด ๆ<br />
        </span>
        <p>
          เกณฑ์การให้คะแนน
          <br />
          0 หมายถึง ไม่ตรงกับข้าพเจ้าเลย
          <br />
          1 หมายถึง ตรงกับข้าพเจ้าบ้าง หรือเกิดขึ้นเป็นบางครั้ง
          <br />
          2 หมายถึง ตรงกับข้าพเจ้า หรือเกิดขึ้นบ่อย
          <br />
          3 หมายถึง ตรงกับข้าพเจ้าอย่างมาก หรือเกิดขึ้นบ่อยมากที่สุด
          <br />
        </p>
        <form className="dass21-3">
          {QUESTIONS_RANGE.map((questionNumber) => (
            <div key={questionNumber}>
              <label>{`${questionNumber}. ${getQuestionText(
                questionNumber
              )}`}</label>
              <Radio_rate
                questionNumber={questionNumber}
                selectedValue={selectedValues[questionNumber]}
                onRadioChange={handleRadioChange}
              />
              <br />
            </div>
          ))}
        </form>
        <div className="p3_dass21-footer">
          <button className="btn btn-prev" onClick={() => navigate(-1)}>
            ย้อนกลับ
          </button>
          <button className="btn btn-next" onClick={handleNextClick}>
            ส่ง
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

const getQuestionText = (questionNumber) => {
  const questions = {
    15: "ฉันรู้สึกหวาดกลัวหรือเสียขวัญ (a)",
    16: "ฉันไม่สามารถมีความกระตือรือร้นในสิ่งใดได้ (d)",
    17: "ฉันรู้สึกว่าตัวเองไม่มีค่ามาก (d)",
    18: "ฉันรู้สึกหงุดหงิดอารมณ์เสีย (s)",
    19: "ฉันรู้สึกว่าสภาพหัวใจขาดการออกกำลังกาย (เช่น ความรู้สึกของอัตราการเต้นของหัวใจเพิ่มขึ้น, หัวใจเต้นผิดจังหวะ) (a)",
    20: "ฉันรู้สึกกลัวโดยไม่มีเหตุผล (a)",
    21: "ฉันรู้สึกว่าชีวิตไม่มีความหมาย (d)",
  };
  return questions[questionNumber];
};
