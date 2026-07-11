import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Logo from "../../components/logo";
import CustomRadioGroup from "../../components/RadioGroup";
import Loading from "../../components/Loading";
import "../p1_dass21.css";
import "../p3_dass21.css";

const QUESTIONS_RANGE = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

const styles = {
  questionContainer: {
    marginBottom: "2rem",
  },
  questionLabel: {
    display: "block",
    marginBottom: "1rem",
    fontSize: "1rem",
    lineHeight: "1.5",
  },
};

const VITE_API_PATH = import.meta.env.VITE_API_PATH;

export default function RQFormP2() {
  const [selectedValues, setSelectedValues] = useState({});
  const [uid, setUid] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUid = localStorage.getItem("uid");
    if (storedUid) {
      setUid(storedUid);
    }
  }, []);

  useEffect(() => {
    const storedValues = JSON.parse(localStorage.getItem("rqValues") || "{}");
    const updatedValues = { ...storedValues, ...selectedValues };
    localStorage.setItem("rqValues", JSON.stringify(updatedValues));
  }, [selectedValues]);

  const calculateScores = (values) => {
    // Define question groups
    const emotionalEnduranceQuestions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const encouragementQuestions = [11, 12, 13, 14, 15];
    const problemManagementQuestions = [16, 17, 18, 19, 20];

    // Define negative questions that need reverse scoring
    const negativeQuestions = [1, 5, 14, 15, 16];

    const calculateScore = (questions) => {
      return questions.reduce((sum, q) => {
        const value = values[q] || 0;
        if (negativeQuestions.includes(q)) {
          // Reverse scoring for 1-4 scale
          return sum + (5 - value);
        }
        return sum + value;
      }, 0);
    };

    const emotionalEndurance = calculateScore(emotionalEnduranceQuestions);
    const encouragement = calculateScore(encouragementQuestions);
    const problemManagement = calculateScore(problemManagementQuestions);

    return {
      emotionalEndurance,
      encouragement,
      problemManagement,
      rqTotal: emotionalEndurance + encouragement + problemManagement,
    };
  };

  const handleRadioChange = (questionNumber, value) => {
    setSelectedValues((prevValues) => ({
      ...prevValues,
      [questionNumber]: parseInt(value),
    }));
  };

  const areAllQuestionsAnswered = () => {
    return QUESTIONS_RANGE.every((question) =>
      selectedValues.hasOwnProperty(question)
    );
  };

  const handleNextClick = async (event) => {
    if (!areAllQuestionsAnswered()) {
      toast.error("โปรดตอบคำถามให้ครบทุกข้อ!", {
        position: "top-right",
        hideProgressBar: true,
        height: "100%",
        style: {
          fontSize: "16px",
          fontFamily: "ChulabhornLikitText-Regular",
        },
      });
      event.preventDefault();
      return;
    }

    try {
      setIsLoading(true);

      const storedValues = JSON.parse(localStorage.getItem("rqValues") || "{}");
      const allValues = { ...storedValues, ...selectedValues };

      // Calculate scores
      const scores = calculateScores(allValues);

      const payload = {
        uid,
        answers: allValues,
        ...scores,
      };

      await axios.post(`${VITE_API_PATH}/submitForms`, {
        uid: uid,
        forms_type: "rq",
        result: JSON.stringify(payload),
      });

      localStorage.setItem("rqValues", JSON.stringify(allValues));
      localStorage.setItem("rqScores", JSON.stringify(scores));

      navigate("/rq/result");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("เกิดข้อผิดพลาดในการส่งข้อมูล โปรดลองอีกครั้งภายหลัง", {
        position: "top-right",
        hideProgressBar: true,
        style: {
          fontSize: "16px",
          fontFamily: "ChulabhornLikitText-Regular",
        },
      });
    } finally {
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
          &nbsp;&nbsp;&nbsp;&nbsp;ข้อคำถามในแบบประเมินมีจำนวน 20 ข้อ
          เป็นการสอบถามถึงความคิด ความรู้สึก และพฤติกรรมของท่านเอง ในรอบ 3
          เดือนที่ผ่านมา ขอให้ท่านเลือกคำตอบที่ตรงกับความเป็นจริงที่มากที่สุด
          <br />
        </span>
        <p>
          เกณฑ์การให้คะแนน
          <br />
          1 = ไม่จริง
          <br />
          2 = จริงบางครั้ง
          <br />
          3 = ค่อนข้างจริง
          <br />4 = จริงมาก
        </p>
        <form className="dass21-1">
          {QUESTIONS_RANGE.map((questionNumber) => (
            <div key={questionNumber} style={styles.questionContainer}>
              <label style={styles.questionLabel}>
                {`${questionNumber}. ${getQuestionText(questionNumber)}`}
              </label>
              <CustomRadioGroup
                questionNumber={questionNumber}
                selectedValue={selectedValues[questionNumber]}
                onChange={handleRadioChange}
                options={[1, 2, 3, 4]}
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
    11: "จากประสบการณ์ที่ผ่านมาทำให้ฉันมั่นใจว่าจะแก้ปัญหาต่าง ๆ ที่ผ่านเข้ามาในชีวิตได้",
    12: "ฉันมีครอบครัวและคนใกล้ชิดเป็นกำลังใจ",
    13: "ฉันมีแผนการที่จะทำให้ชีวิตก้าวไปข้างหน้า",
    14: "เมื่อมีปัญหาวิกฤตเกิดขึ้น ฉันรู้สึกว่าตัวเองไร้ความสามารถ",
    15: "เป็นเรื่องยากสำหรับฉันที่จะทำให้ชีวิตดีขึ้น",
    16: "ฉันอยากหนีไปให้พ้น หากมีปัญหาหนักหนาต้องรับผิดชอบ",
    17: "การแก้ไขปัญหาทำให้ฉันมีประสบการณ์มากขึ้น",
    18: "ในการพูดคุย ฉันหาเหตุผลที่ทุกคนยอมรับหรือเห็นด้วยกับฉันได้",
    19: "ฉันเตรียมหาทางออกไว้ หากปัญหาร้ายแรงกว่าที่คิด",
    20: "ฉันชอบฟังความคิดเห็นที่แตกต่างจากฉัน",
  };
  return questions[questionNumber];
};
