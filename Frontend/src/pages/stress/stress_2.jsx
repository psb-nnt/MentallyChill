import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import Logo from "../../components/logo";
import CustomRadioGroup from "../../components/RadioGroup";
import axios from "axios";
import Loading from "../../components/Loading";
import "../p3_dass21.css";

const QUESTIONS_PER_PAGE = 10;
const TOTAL_QUESTIONS = 20;
const VITE_API_PATH = import.meta.env.VITE_API_PATH;

export default function StressFormP2() {
  const [selectedValues, setSelectedValues] = useState({});
  const [uid, setUid] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedValues = localStorage.getItem("stressValues");
    if (storedValues) {
      setSelectedValues(JSON.parse(storedValues));
    }
    const storedUid = localStorage.getItem("uid");
    if (storedUid) {
      setUid(storedUid);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("stressValues", JSON.stringify(selectedValues));
  }, [selectedValues]);

  const handleRadioChange = (questionNumber, value) => {
    setSelectedValues((prevValues) => ({
      ...prevValues,
      [questionNumber]: value,
    }));
  };

  const areAllQuestionsAnswered = () => {
    const answeredQuestions = Object.keys(selectedValues).filter(
      (key) => parseInt(key) > 10
    ).length;
    return answeredQuestions >= QUESTIONS_PER_PAGE;
  };

  const calculateFinalScore = () => {
    const firstPageScore = parseInt(
      localStorage.getItem("stressFirstPageScore") || "0",
      10
    );

    const secondPageScore = Object.keys(selectedValues)
      .filter((key) => parseInt(key) > 10)
      .reduce((sum, key) => sum + parseInt(selectedValues[key], 10), 0);

    return firstPageScore + secondPageScore;
  };

  const handleNextClick = async (event) => {
    if (!areAllQuestionsAnswered()) {
      toast.error("โปรดตอบคำถามให้ครบทุกข้อ!", {
        position: "top-right",
        hideProgressBar: true,
        style: {
          fontSize: "16px",
          fontFamily: "ChulabhornLikitText-Regular",
        },
      });
      event.preventDefault();
    } else {
      setIsLoading(true);
      const totalScore = calculateFinalScore();
      const payload = {
        uid,
        answers: selectedValues,
        scores: totalScore,
      };
      console.log(payload);
      try {
        await axios.post(`${VITE_API_PATH}/submitForms`, {
          uid: uid,
          forms_type: "stress",
          result: JSON.stringify(payload),
        });
        localStorage.setItem("stressScore", totalScore.toString());
        navigate("/stress/result");
      } catch (error) {
        console.error("Error submitting form:", error);
        toast.error("เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง", {
          position: "top-right",
          hideProgressBar: true,
        });
        setIsLoading(false);
      }
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
          &nbsp;&nbsp;&nbsp;&nbsp;โปรดเลือกช่องแสดงระดับอาการที่เกิดขึ้นกับตัวท่านตามความเป็นจริงมากที่สุด
          ว่าในระยะ 2 เดือนที่ผ่านมานี้ ท่านมีอาการ พฤติกรรม
          หรือความรู้สึกต่อไปนี้มากน้อยเพียงใด
        </span>

        <p>
          เกณฑ์การให้คะแนน
          <br />
          0 หมายถึง ไม่เคยเลย
          <br />
          1 หมายถึง เป็นครั้งคราว
          <br />
          2 หมายถึง เป็นบ่อย
          <br />3 หมายถึง เป็นประจำ
        </p>

        <form className="dass21-1">
          {[...Array(QUESTIONS_PER_PAGE)].map((_, i) => (
            <div key={i}>
              <label>{`${i + 11}. ${getQuestionText(i + 11)}`}</label>
              <CustomRadioGroup
                questionNumber={i + 11}
                selectedValue={selectedValues[i + 11]}
                onChange={handleRadioChange}
                options={[0, 1, 2, 3]}
              />
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
    11: "รู้สึกว่าตนเองไม่มีสมาธิ",
    12: "รู้สึกเพลียจนไม่มีแรงจะทำอะไร",
    13: "รู้สึกเหนื่อยหน่ายไม่อยากทำอะไร",
    14: "มีอาการหัวใจเต้นแรง",
    15: "เสียงสั่น ปากสั่น หรือมือสั่นเวลาไม่พอใจ",
    16: "รู้สึกกลัวผิดพลาดในการทำสิ่งต่างๆ",
    17: "ปวดหรือเกร็งกล้ามเนื้อบริเวณท้ายทอย หลัง หรือไหล่",
    18: "ตื่นเต้นง่ายกับเหตุการณ์ที่ไม่คุ้นเคย",
    19: "มึนงงหรือเวียนศีรษะ",
    20: "มีความสุขทางเพศลดลง",
  };
  return questions[questionNumber];
};
