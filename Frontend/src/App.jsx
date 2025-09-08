import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CookieConsent from "react-cookie-consent";

import "./App.css";

import { ProfileProvider } from "./LIFF/ProfileContext";
import Person1 from "./pages/Person1";
import Person2 from "./pages/person2";
import Person3 from "./pages/person3";
import Remark from "./pages/remark";
import Remark2 from "./pages/remark2";
import FormOption from "./pages/formOption";
import FormOption2 from "./pages/formOption2";
import CRI_dass21 from "./pages/cri_dass21";
import P1_dass21 from "./pages/p1_dass21";
import P2_dass21 from "./pages/p2_dass21";
import P3_dass21 from "./pages/p3_dass21";
import Result from "./pages/result";
import Appoint from "./pages/appoint";
import Radio_rate from "./components/radio_rate";
import Confirm_app from "./pages/confirm_app";
import Finish_app from "./pages/finish_app";
import LineLiff from "./LIFF/lineLiff";
import LineDis from "./LIFF/LineDIS";

import StressFormP1 from "./pages/stress/stress_1";
import StressFormP2 from "./pages/stress/stress_2";
import StressResult from "./pages/stress/stressResult";

import BurnOutFormP1 from "./pages/burnout/burnout_1";
import BurnOutFormP2 from "./pages/burnout/burnout_2";
import BurnOutResult from "./pages/burnout/burnoutResult";

import RQFormP1 from "./pages/rq/rq_1";
import RQFormP2 from "./pages/rq/rq_2";
import RQResult from "./pages/rq/rqResult";

import TwoQForm from "./pages/qform/2q";
import NineQForm from "./pages/qform/9q";
import EightQForm from "./pages/qform/8q";
import TwoQResult from "./pages/qform/2q_result";
import QResult from "./pages/qform/q_result";

import ST5Form from "./pages/st-5/st5_1";
import ST5Result from "./pages/st-5/st5_result";

function App() {
  return (
    <ProfileProvider>
      <BrowserRouter>
        <Routes>
          <Route index element={<FormOption />} />
          <Route path="/person1" element={<Person1 />} />
          <Route path="/person2" element={<Person2 />} />
          <Route path="/person3" element={<Person3 />} />
          <Route path="/remark1" element={<Remark />} />
          <Route path="/remark2" element={<Remark2 />} />
          <Route path="/formOption1" element={<FormOption />} />
          <Route path="/formOption2" element={<FormOption2 />} />

          <Route path="/dass-21/1" element={<P1_dass21 />} />
          <Route path="/dass-21/2" element={<P2_dass21 />} />
          <Route path="/dass-21/3" element={<P3_dass21 />} />
          <Route path="/dass-21/criteria" element={<CRI_dass21 />} />
          <Route path="/dass-21/result" element={<Result />} />

          <Route path="/appoint" element={<Appoint />} />
          <Route path="/appoint/confirm" element={<Confirm_app />} />
          <Route path="/appoint/finish" element={<Finish_app />} />

          <Route path="/lineLiff" element={<LineLiff />} />
          <Route path="/LineDis" element={<LineDis />} />

          <Route path="/stress/1" element={<StressFormP1 />} />
          <Route path="/stress/2" element={<StressFormP2 />} />
          <Route path="/stress/result" element={<StressResult />} />

          <Route path="/burnout/1" element={<BurnOutFormP1 />} />
          <Route path="/burnout/2" element={<BurnOutFormP2 />} />
          <Route path="/burnout/result" element={<BurnOutResult />} />

          <Route path="/rq/1" element={<RQFormP1 />} />
          <Route path="/rq/2" element={<RQFormP2 />} />
          <Route path="/rq/result" element={<RQResult />} />

          <Route path="/2q/1" element={<TwoQForm />} />
          <Route path="/2q/result" element={<TwoQResult />} />
          <Route path="/2q-9q/1" element={<NineQForm />} />
          <Route path="/2q-9q-8q/1" element={<EightQForm />} />
          <Route path="/2q-9q-8q/result" element={<QResult />} />

          <Route path="/st-5/1" element={<ST5Form />} />
          <Route path="/st-5/result" element={<ST5Result />} />
        </Routes>

        <footer className="cookieConsent">
          <CookieConsent
            /* debug={true} */
            flipButtons={true}
            /* enableDeclineButton */
            location="bottom"
            buttonText="ฉันเข้าใจ"
            declineButtonText="ยกเลิก"
            cookieName="myCookieConsent"
            buttonWrapperClasses="btn-cookie"
            style={{
              background: "white",
              fontSize: "16px",
              color: "rgba(0, 48, 135, 1)",
              alignItems: "center",
              margin: "0rem auto",
              borderTopLeftRadius: "20px",
              borderTopRightRadius: "20px",
            }}
            buttonStyle={{
              background: "rgba(255, 121, 21, 1)",
              color: "white",
              fontSize: "16px",
              fontStyle: "bold",
              fontFamily: "ChulabhornLikitText-Regular",
              borderRadius: "20px",
              padding: "10px 20px",
              border: "none",
              cursor: "pointer",
            }}
            declineButtonStyle={{
              background: "#F8F8F8",
              color: "#4e503b",
              fontSize: "14px",
              fontFamily: "ChulabhornLikitText-Regular",
              borderRadius: "5px",
              padding: "10px 20px",
              border: "none",
              cursor: "pointer",
            }}
            expires={150}
          >
            <b style={{ fontSize: "16px" }}>เว็บไซต์นี้มีการใช้งานคุกกี้</b>
            <br />
            เว็บไซต์ของเรามีการใช้งานคุกกี้เพื่อจัดการให้ผู้ใช้มีประสบการณ์ที่ดีที่สุดและเพื่อพัฒนาคุณภาพการให้บริการที่ดียิ่งขึ้น&nbsp;
            <a
              href="https://www.cra.ac.th/th/about/pdpa"
              style={{ color: "rgba(0, 48, 135, 0.85)" }}
            >
              รายละเอียดเพิ่มเติม
            </a>
          </CookieConsent>
        </footer>
      </BrowserRouter>
    </ProfileProvider>
  );
}

export default App;
