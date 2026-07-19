import axios from "../components/axioscreds";
import { useEffect, useState, useContext } from "react";
import Sidebar from "../components/sidebar";
import Topbar from "../components/topbar";
import { PieChart, pieArcLabelClasses, LineChart } from "@mui/x-charts";
import { DataContext } from "../context/DataContext";

export default function DashboardPage() {
  const { getDiagnosisForms, getAppointments, getUserList } = useContext(DataContext);
  // Basic dashboard data
  const [bookingdata, setBookingData] = useState([]);
  const [diagdata, setDiagData] = useState([]);
  const [countDiag, setCountDiag] = useState(0);
  const [countBooking, setCountBooking] = useState(0);
  const [countUsers, setCountUsers] = useState(0); // New state for user count
  const [userData, setUserData] = useState([]);

  // Filter states
  const [selectedFormType, setSelectedFormType] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [filteredDiagData, setFilteredDiagData] = useState([]);
  const [filteredBookingData, setFilteredBookingData] = useState([]);

  // User demographic data
  const [demographics, setDemographics] = useState({
    collegecount: 0,
    highschoolcount: 0,
  });

  // Summary counts
  const [severityCounts, setSeverityCounts] = useState({
    low: 0,
    medium: 0,
    high: 0,
  });

  // DASS21 scores
  const [dassScores, setDassScores] = useState({
    resD: 0,
    resA: 0,
    resS: 0,
  });

  // DASS21 depression levels
  const [depressionLevels, setDepressionLevels] = useState({
    low: 0,
    medium: 0,
    high: 0,
  });

  // DASS21 anxiety levels
  const [anxietyLevels, setAnxietyLevels] = useState({
    low: 0,
    medium: 0,
    high: 0,
  });

  // DASS21 stress levels
  const [stressLevels, setStressLevels] = useState({
    low: 0,
    medium: 0,
    high: 0,
  });

  // Stress test scores and levels
  const [stressTest, setStressTest] = useState({
    score: 0,
    low: 0,
    medium: 0,
    high: 0,
  });

  // Burnout test scores
  const [burnoutScores, setBurnoutScores] = useState({
    emotionalScore: 0,
    depersonalization: 0,
    personalAccomplishment: 0,
  });

  // Burnout emotional exhaustion levels
  const [emotionalExhaustionLevels, setEmotionalExhaustionLevels] = useState({
    low: 0,
    medium: 0,
    high: 0,
  });

  // Burnout depersonalization levels
  const [depersonalizationLevels, setDepersonalizationLevels] = useState({
    low: 0,
    medium: 0,
    high: 0,
  });

  // Burnout personal accomplishment levels
  const [personalAccomplishmentLevels, setPersonalAccomplishmentLevels] =
    useState({
      low: 0,
      medium: 0,
      high: 0,
    });

  // Resilience quotient scores
  const [rqScores, setRqScores] = useState({
    emotion: 0,
    encouragement: 0,
    problem: 0,
  });

  // RQ emotional endurance levels
  const [rqEmotionLevels, setRqEmotionLevels] = useState({
    low: 0,
    medium: 0,
    high: 0,
  });

  // RQ encouragement levels
  const [rqEncouragementLevels, setRqEncouragementLevels] = useState({
    low: 0,
    medium: 0,
    high: 0,
  });

  // RQ problem management levels
  const [rqProblemLevels, setRqProblemLevels] = useState({
    low: 0,
    medium: 0,
    high: 0,
  });

  // 2Q/8Q/9Q test results
  const [mentalHealthScreening, setMentalHealthScreening] = useState({
    sad2q: 0,
    bored2q: 0,
    depression9q: {
      low: 0,
      medium: 0,
      high: 0,
    },
    suicideRisk8q: {
      low: 0,
      medium: 0,
      high: 0,
    },
  });

  // Add new state for line chart
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [monthlyData, setMonthlyData] = useState({
    months: [],
    userCounts: [],
    diagCounts: [],
    bookingCounts: [],
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [forms, appointments, users] = await Promise.all([
          getDiagnosisForms(),
          getAppointments(),
          getUserList()
        ]);

        setDiagData(forms);
        setCountDiag(forms.length);

        setBookingData(appointments);
        setCountBooking(appointments.length);

        setUserData(users);
        setCountUsers(users.length);

        // Count college and high school students
        let college = 0;
        let highschool = 0;

        users.forEach((user) => {
          if (user.grade_level && user.grade_level.includes("อุดมศึกษา")) {
            college++;
          } else {
            highschool++;
          }
        });

        setDemographics({ collegecount: college, highschoolcount: highschool });
        
        // Process monthly data for line chart
        processMonthlyData(users);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      }
    };

    loadDashboardData();
  }, []);

  // Add new function to process monthly data
  const processMonthlyData = (users) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const months = [];
    const userCounts = [];
    const diagCounts = [];
    const bookingCounts = [];

    // Thai month abbreviations for line chart only
    const thaiMonths = [
      "ม.ค.",
      "ก.พ.",
      "มี.ค.",
      "เม.ย.",
      "พ.ค.",
      "มิ.ย.",
      "ก.ค.",
      "ส.ค.",
      "ก.ย.",
      "ต.ค.",
      "พ.ย.",
      "ธ.ค.",
    ];

    // Generate all 12 months (Jan to Dec)
    for (let i = 0; i < 12; i++) {
      const monthKey = `${currentYear}-${String(i + 1).padStart(2, "0")}`;

      months.push(thaiMonths[i]);

      // Count users created in this month with type filter applied
      const monthlyUsers = users.filter((user) => {
        // First filter by month
        if (!user.created) return false;
        if (user.created.substring(0, 7) !== monthKey) return false;

        // Then filter by user type
        if (userTypeFilter === "college") {
          return user.grade_level && user.grade_level.includes("อุดมศึกษา");
        } else if (userTypeFilter === "highschool") {
          return !user.grade_level || !user.grade_level.includes("อุดมศึกษา");
        }

        // If "all" is selected, include all users
        return true;
      }).length;

      // Count diagnoses for this month and user type
      const monthlyDiag = diagdata.filter((item) => {
        if (!item.created) return false;
        const itemMonth = item.created.substring(0, 7);
        if (itemMonth !== monthKey) return false;

        if (userTypeFilter === "all") return true;

        // Find the user who created this diagnosis
        const user = users.find((u) => u.id === item.user_id);
        if (!user) return false;

        if (userTypeFilter === "college") {
          return user.grade_level && user.grade_level.includes("อุดมศึกษา");
        } else if (userTypeFilter === "highschool") {
          return !user.grade_level || !user.grade_level.includes("อุดมศึกษา");
        }

        return false;
      }).length;

      // Count bookings for this month and user type
      const monthlyBookings = bookingdata.filter((item) => {
        if (!item.appointment_date) return false;
        const itemMonth = item.appointment_date.substring(0, 7);
        if (itemMonth !== monthKey) return false;

        if (userTypeFilter === "all") return true;

        // Find the user who made this booking
        const user = users.find((u) => u.id === item.user_id);
        if (!user) return false;

        if (userTypeFilter === "college") {
          return user.grade_level && user.grade_level.includes("อุดมศึกษา");
        } else if (userTypeFilter === "highschool") {
          return !user.grade_level || !user.grade_level.includes("อุดมศึกษา");
        }

        return false;
      }).length;

      userCounts.push(monthlyUsers);
      diagCounts.push(monthlyDiag);
      bookingCounts.push(monthlyBookings);
    }

    setMonthlyData({
      months,
      userCounts,
      diagCounts,
      bookingCounts,
    });
  };

  // Update monthly data when filter changes
  useEffect(() => {
    if (userData.length > 0 && diagdata.length > 0 && bookingdata.length > 0) {
      processMonthlyData(userData);
    }
  }, [userTypeFilter, diagdata, bookingdata, userData]);

  useEffect(() => {
    if (selectedMonth === "all") {
      setFilteredDiagData(diagdata);
      setFilteredBookingData(bookingdata);
    } else {
      const filterByMonth = (data) => {
        return data.filter((item) => {
          const date = item.created || item.appointment_date || "";
          if (!date) return false;
          return date.substring(0, 7) === selectedMonth;
        });
      };

      setFilteredDiagData(filterByMonth(diagdata));
      setFilteredBookingData(filterByMonth(bookingdata));
    }
  }, [selectedMonth, diagdata, bookingdata]);

  useEffect(() => {
    // Process data to classify and count levels
    const classifyAndCount = () => {
      let severityTotals = { low: 0, medium: 0, high: 0 };
      let dassTotal = { resD: 0, resA: 0, resS: 0 };
      let depressionTotal = { low: 0, medium: 0, high: 0 };
      let anxietyTotal = { low: 0, medium: 0, high: 0 };
      let stressTotal = { low: 0, medium: 0, high: 0 };
      let stressTestTotal = { score: 0, low: 0, medium: 0, high: 0 };
      let burnoutTotal = {
        emotionalScore: 0,
        depersonalization: 0,
        personalAccomplishment: 0,
      };
      let emotionalExhaustionTotal = { low: 0, medium: 0, high: 0 };
      let depersonalizationTotal = { low: 0, medium: 0, high: 0 };
      let personalAccomplishmentTotal = { low: 0, medium: 0, high: 0 };
      let rqTotal = { emotion: 0, encouragement: 0, problem: 0 };
      let rqEmotionTotal = { low: 0, medium: 0, high: 0 };
      let rqEncouragementTotal = { low: 0, medium: 0, high: 0 };
      let rqProblemTotal = { low: 0, medium: 0, high: 0 };
      let screeningTotal = {
        sad2q: 0,
        bored2q: 0,
        depression9q: { low: 0, medium: 0, high: 0 },
        suicideRisk8q: { low: 0, medium: 0, high: 0 },
      };

      filteredDiagData.forEach((entry) => {
        if (entry.result) {
          const { d, a, s } = entry.result;

          const dNum = Number(d);
          const aNum = Number(a);
          const sNum = Number(s);

          if (entry.forms_type === "2q") {
            for (const [key, value] of Object.entries(entry.result)) {
              if (key === "q1") {
                if (value === true) {
                  screeningTotal.sad2q++;
                }
              }
              if (key === "q2") {
                if (value === true) {
                  screeningTotal.bored2q++;
                }
              }
            }
          }

          if (entry.forms_type === "9q") {
            for (const [key, value] of Object.entries(entry.result)) {
              if (key === "scores") {
                if (value < 13) {
                  screeningTotal.depression9q.low++;
                } else if (value >= 13 && value <= 18) {
                  screeningTotal.depression9q.medium++;
                } else {
                  screeningTotal.depression9q.high++;
                }
              }
            }
          }

          if (entry.forms_type === "8q") {
            for (const [key, value] of Object.entries(entry.result)) {
              if (key === "scores") {
                if (value < 9) {
                  screeningTotal.suicideRisk8q.low++;
                } else if (value >= 9 && value <= 16) {
                  screeningTotal.suicideRisk8q.medium++;
                } else {
                  screeningTotal.suicideRisk8q.high++;
                }
              }
            }
          }

          if (entry.forms_type === "rq" && entry.result) {
            const { emotionalEndurance, encouragement, problemManagement } =
              entry.result;

            const emotionalEnduranceNum = Number(emotionalEndurance);
            const encouragementNum = Number(encouragement);
            const problemManagementNum = Number(problemManagement);

            rqTotal.emotion += emotionalEnduranceNum;
            rqTotal.encouragement += encouragementNum;
            rqTotal.problem += problemManagementNum;

            let EmotionScorerank =
              emotionalEnduranceNum > 34
                ? 1
                : emotionalEnduranceNum >= 27
                ? 2
                : 3;
            let Encouragementrank =
              encouragementNum > 19 ? 1 : encouragementNum >= 14 ? 2 : 3;
            let ProblemManagementrank =
              problemManagementNum > 18
                ? 1
                : problemManagementNum >= 13
                ? 2
                : 3;

            if (EmotionScorerank === 1) rqEmotionTotal.high++;
            else if (EmotionScorerank === 2) rqEmotionTotal.medium++;
            else rqEmotionTotal.low++;

            if (Encouragementrank === 1) rqEncouragementTotal.high++;
            else if (Encouragementrank === 2) rqEncouragementTotal.medium++;
            else rqEncouragementTotal.low++;

            if (ProblemManagementrank === 1) rqProblemTotal.high++;
            else if (ProblemManagementrank === 2) rqProblemTotal.medium++;
            else rqProblemTotal.low++;

            const allValue =
              emotionalEnduranceNum + encouragementNum + problemManagementNum;
            if (allValue > 69) severityTotals.low++;
            else if (allValue >= 55) severityTotals.medium++;
            else severityTotals.high++;
          }

          if (entry.forms_type === "burnout" && entry.result.scores) {
            const {
              emotionalScore,
              depersonalizationScore,
              personalAchievementScore,
            } = entry.result.scores;

            const emotionalScoreNum = Number(emotionalScore);
            const depersonalizationNum = Number(depersonalizationScore);
            const personalAccomplishmentNum = Number(personalAchievementScore);

            burnoutTotal.emotionalScore += emotionalScoreNum;
            burnoutTotal.depersonalization += depersonalizationNum;
            burnoutTotal.personalAccomplishment += personalAccomplishmentNum;

            let EmotionScorerank =
              emotionalScoreNum >= 27 ? 3 : emotionalScoreNum >= 17 ? 2 : 1;
            let Depersonalrank =
              depersonalizationNum >= 13
                ? 3
                : depersonalizationNum >= 7
                ? 2
                : 1;
            let PersonalAccomprank =
              personalAccomplishmentNum >= 39
                ? 1
                : personalAccomplishmentNum >= 32
                ? 2
                : 3;

            if (EmotionScorerank === 3) emotionalExhaustionTotal.high++;
            else if (EmotionScorerank === 2) emotionalExhaustionTotal.medium++;
            else emotionalExhaustionTotal.low++;

            if (Depersonalrank === 3) depersonalizationTotal.high++;
            else if (Depersonalrank === 2) depersonalizationTotal.medium++;
            else depersonalizationTotal.low++;

            if (PersonalAccomprank === 1) personalAccomplishmentTotal.high++;
            else if (PersonalAccomprank === 2)
              personalAccomplishmentTotal.medium++;
            else personalAccomplishmentTotal.low++;

            const maxValue = Math.max(
              EmotionScorerank,
              Depersonalrank,
              PersonalAccomprank
            );
            if (maxValue === 1) severityTotals.low++;
            else if (maxValue === 2) severityTotals.medium++;
            else severityTotals.high++;
          }

          if (entry.forms_type === "dass21") {
            dassTotal.resD += dNum;
            dassTotal.resA += aNum;
            dassTotal.resS += sNum;

            let drank = 0;
            let arank = 0;
            let srank = 0;

            if (dNum >= 0 && dNum <= 6) {
              drank = 1;
              depressionTotal.low++;
            } else if (dNum >= 7 && dNum <= 13) {
              drank = 2;
              depressionTotal.medium++;
            } else if (dNum >= 14) {
              drank = 3;
              depressionTotal.high++;
            }

            if (aNum >= 0 && aNum <= 5) {
              arank = 1;
              anxietyTotal.low++;
            } else if (aNum >= 6 && aNum <= 9) {
              arank = 2;
              anxietyTotal.medium++;
            } else if (aNum >= 10) {
              arank = 3;
              anxietyTotal.high++;
            }

            if (sNum >= 0 && sNum <= 9) {
              srank = 1;
              stressTotal.low++;
            } else if (sNum >= 10 && sNum <= 16) {
              srank = 2;
              stressTotal.medium++;
            } else if (sNum >= 17) {
              srank = 3;
              stressTotal.high++;
            }

            const maxValue = Math.max(drank, arank, srank);
            if (maxValue === 1) {
              severityTotals.low++;
            } else if (maxValue === 2) {
              severityTotals.medium++;
            } else if (maxValue === 3) {
              severityTotals.high++;
            }
          }

          if (entry.forms_type === "stress" && entry.result.scores) {
            const scoreNum = Number(entry.result.scores);
            stressTestTotal.score += scoreNum;

            let stressrank = scoreNum <= 25 ? 1 : scoreNum <= 29 ? 2 : 3;

            if (stressrank === 1) stressTestTotal.low++;
            else if (stressrank === 2) stressTestTotal.medium++;
            else stressTestTotal.high++;

            if (stressrank === 1) severityTotals.low++;
            else if (stressrank === 2) severityTotals.medium++;
            else severityTotals.high++;
          }
        }
      });

      // Update all state variables with the new counted values
      setSeverityCounts(severityTotals);
      setDassScores(dassTotal);
      setDepressionLevels(depressionTotal);
      setAnxietyLevels(anxietyTotal);
      setStressLevels(stressTotal);
      setStressTest(stressTestTotal);
      setBurnoutScores(burnoutTotal);
      setEmotionalExhaustionLevels(emotionalExhaustionTotal);
      setDepersonalizationLevels(depersonalizationTotal);
      setPersonalAccomplishmentLevels(personalAccomplishmentTotal);
      setRqScores(rqTotal);
      setRqEmotionLevels(rqEmotionTotal);
      setRqEncouragementLevels(rqEncouragementTotal);
      setRqProblemLevels(rqProblemTotal);
      setMentalHealthScreening(screeningTotal);
    };

    classifyAndCount();
  }, [filteredDiagData]);

  // Generate month options for the dropdown
  const getMonthOptions = () => {
    const options = [{ value: "all", label: "ทั้งหมด" }];
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    // Add last 12 months
    for (let i = 0; i < 12; i++) {
      let month = currentMonth - i;
      let year = currentYear;

      if (month <= 0) {
        month += 12;
        year -= 1;
      }

      const monthStr = month.toString().padStart(2, "0");
      const monthValue = `${year}-${monthStr}`;

      // Map month number to Thai month name
      const thaiMonths = [
        "มกราคม",
        "กุมภาพันธ์",
        "มีนาคม",
        "เมษายน",
        "พฤษภาคม",
        "มิถุนายน",
        "กรกฎาคม",
        "สิงหาคม",
        "กันยายน",
        "ตุลาคม",
        "พฤศจิกายน",
        "ธันวาคม",
      ];

      options.push({
        value: monthValue,
        label: `${thaiMonths[month - 1]} ${year}`,
      });
    }

    return options;
  };

  const monthOptions = getMonthOptions();

  // Add function to get filtered user count by month
  const getFilteredUserCount = () => {
    if (selectedMonth === "all") {
      return countUsers;
    }

    return userData.filter((user) => {
      if (!user.created) return false;
      return user.created.substring(0, 7) === selectedMonth;
    }).length;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar />
      <div className="flex flex-1 flex-row">
        <div className="flex relative w-72">
          <Sidebar />
        </div>
        <div className="w-full">
          <div className="p-4 md:p-10">
            <div className="flex flex-wrap justify-between items-center mb-4">
              <div className="flex items-center">
                <label className="mr-2 font-medium">เดือน:</label>
                <select
                  className="border border-gray-300 rounded-md py-2 px-6 bg-white"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  {monthOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-4 mb-8">
              <StatCard
                title="จำนวนผู้ใช้"
                value={getFilteredUserCount()}
                color="#CCDDFD"
                tone="500"
              />
              <StatCard
                title="จำนวนการประเมิน"
                value={
                  selectedMonth === "all" ? countDiag : filteredDiagData.length
                }
                color="#CCDDFD"
              />
              <StatCard
                title="จำนวนการนัดหมาย"
                value={
                  selectedMonth === "all"
                    ? countBooking
                    : filteredBookingData.length
                }
                color="#CCDDFD"
                tone="500"
              />
            </div>

            {/* User types pie chart */}
            <div className="text-2xl font-bold">
              ประเภทของผู้แบบทำแบบประเมินทั้งหมด
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mb-8">
              <div className="flex flex-col items-center justify-center">
                <PieChart
                  colors={["lightgray", "lightskyblue"]}
                  series={[
                    {
                      arcLabel: (item) => `${Math.round(item.value)}%`,
                      arcLabelMinAngle: 35,
                      arcLabelRadius: "60%",
                      data: [
                        {
                          id: 0,
                          value:
                            Math.round(
                              (demographics.collegecount /
                                (demographics.collegecount +
                                  demographics.highschoolcount)) *
                                100
                            ) || 0,
                          label: "อุดมศึกษา",
                        },
                        {
                          id: 1,
                          value:
                            Math.round(
                              (demographics.highschoolcount /
                                (demographics.collegecount +
                                  demographics.highschoolcount)) *
                                100
                            ) || 0,
                          label: "มัธยมศึกษา",
                        },
                      ],
                    },
                  ]}
                  sx={{
                    [`& .${pieArcLabelClasses.root}`]: {
                      fontWeight: "bold",
                    },
                  }}
                  width={400}
                  height={400}
                />
                <div className="flex flex-col items-start w-full">
                  <div>อุดมศึกษา : {demographics.collegecount} คน</div>
                  <div>มัธยมศึกษา : {demographics.highschoolcount} คน</div>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center mb-4">
                  <label className="mr-2 font-medium text-lg">
                    ประเภทผู้ใช้:
                  </label>
                  <select
                    className="border border-gray-300 rounded-md p-3 bg-white text-lg w-40"
                    value={userTypeFilter}
                    onChange={(e) => setUserTypeFilter(e.target.value)}
                  >
                    <option value="all">ทั้งหมด</option>
                    <option value="college">อุดมศึกษา</option>
                    <option value="highschool">มัธยมศึกษา</option>
                  </select>
                </div>
                <LineChart
                  width={800}
                  height={500}
                  series={[
                    {
                      data: monthlyData.userCounts,
                      label: "ผู้ใช้ใหม่",
                      color: "#3B82F6",
                    },
                    {
                      data: monthlyData.diagCounts,
                      label: "การประเมิน",
                      color: "#22C55E",
                    },
                    {
                      data: monthlyData.bookingCounts,
                      label: "นัดหมาย",
                      color: "#DC2626",
                    },
                  ]}
                  xAxis={[{ scaleType: "point", data: monthlyData.months }]}
                  yAxis={[{ min: 0 }]}
                  margin={{ left: 80, right: 80, top: 80, bottom: 80 }}
                />
              </div>
            </div>

            {/* Form type selector and results */}
            <div className="mt-10 border-4 border-[#003087] bg-white rounded-md">
              <div className="flex flex-row bg-[#003087] rounded-md p-4 items-center">
                <div className="text-2xl text-white m-4"> แบบประเมิน : </div>
                <select
                  className="w-[200px] border border-transparent rounded-xl p-2 text-xl bg-blue-600 text-white shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]"
                  onChange={(e) => {
                    setSelectedFormType(e.target.value);
                  }}
                  style={customStyles}
                >
                  <option value="">dass21</option>
                  <option value="burnout">burnout</option>
                  <option value="rq">rq</option>
                  <option value="stress">stress</option>
                  <option value="2Q8Q9Q">2Q8Q9Q</option>
                </select>
              </div>
              <div className="grid grid-cols-3 gap-4 m-10">
                {selectedFormType === "burnout" && (
                  <>
                    <StatCard
                      title="ด้านความอ่อนล้าทางอารมณ์ ระดับต่ำ"
                      value={emotionalExhaustionLevels.low}
                      color="green"
                    />
                    <StatCard
                      title="ด้านความอ่อนล้าทางอารมณ์ ระดับปานกลาง"
                      value={emotionalExhaustionLevels.medium}
                      color="yellow"
                    />
                    <StatCard
                      title="ด้านความอ่อนล้าทางอารมณ์ ระดับสูง"
                      value={emotionalExhaustionLevels.high}
                      color="red"
                    />
                    <StatCard
                      title="ด้านการลดความเป็นบุคคล ระดับต่ำ"
                      value={depersonalizationLevels.low}
                      color="green"
                    />
                    <StatCard
                      title="ด้านการลดความเป็นบุคคล ระดับปานกลาง"
                      value={depersonalizationLevels.medium}
                      color="yellow"
                    />
                    <StatCard
                      title="ด้านการลดความเป็นบุคคล ระดับสูง"
                      value={depersonalizationLevels.high}
                      color="red"
                    />
                    <StatCard
                      title="ด้านความสำเร็จส่วนบุคคล ระดับสูง"
                      value={personalAccomplishmentLevels.high}
                      color="green"
                    />
                    <StatCard
                      title="ด้านความสำเร็จส่วนบุคคล ระดับปานกลาง"
                      value={personalAccomplishmentLevels.medium}
                      color="yellow"
                    />
                    <StatCard
                      title="ด้านความสำเร็จส่วนบุคคล ระดับต่ำ"
                      value={personalAccomplishmentLevels.low}
                      color="red"
                    />
                  </>
                )}
                {selectedFormType === "rq" && (
                  <>
                    <StatCard
                      title="ด้านความทนทานทางอารมณ์ สูงกว่าเกณฑ์ปกติ"
                      value={rqEmotionLevels.high}
                      color="green"
                    />
                    <StatCard
                      title="ด้านความทนทานทางอารมณ์ เกณฑ์ปกติ"
                      value={rqEmotionLevels.medium}
                      color="yellow"
                    />
                    <StatCard
                      title="ด้านความทนทานทางอารมณ์ ต่ำกว่าเกณฑ์ปกติ"
                      value={rqEmotionLevels.low}
                      color="red"
                    />
                    <StatCard
                      title="ด้านกำลังใจ สูงกว่าเกณฑ์ปกติ"
                      value={rqEncouragementLevels.high}
                      color="green"
                    />
                    <StatCard
                      title="ด้านกำลังใจ เกณฑ์ปกติ"
                      value={rqEncouragementLevels.medium}
                      color="yellow"
                    />
                    <StatCard
                      title="ด้านกำลังใจ ต่ำกว่าเกณฑ์ปกติ"
                      value={rqEncouragementLevels.low}
                      color="red"
                    />
                    <StatCard
                      title="ด้านการจัดการกับปัญหา สูงกว่าเกณฑ์ปกติ"
                      value={rqProblemLevels.high}
                      color="green"
                    />
                    <StatCard
                      title="ด้านการจัดการกับปัญหา เกณฑ์ปกติ"
                      value={rqProblemLevels.medium}
                      color="yellow"
                    />
                    <StatCard
                      title="ด้านการจัดการกับปัญหา ต่ำกว่าเกณฑ์ปกติ"
                      value={rqProblemLevels.low}
                      color="red"
                    />
                  </>
                )}
                {selectedFormType === "stress" && (
                  <>
                    <StatCard
                      title="ไม่มีภาวะเครียด & เครียดในระดับปกติ"
                      value={stressLevels.low}
                      color="green"
                    />
                    <StatCard
                      title="เครียดปานกลาง"
                      value={stressLevels.medium}
                      color="yellow"
                    />
                    <StatCard
                      title="เครียดมาก"
                      value={stressLevels.high}
                      color="red"
                    />
                  </>
                )}
                {selectedFormType === "2Q8Q9Q" && (
                  <>
                    <StatCard
                      title="เศร้า หดหู่ ท้อแท้ ในช่วง 2 สัปดาห์"
                      value={mentalHealthScreening.sad2q}
                      color="green"
                    />
                    <StatCard
                      title="เบื่อ ไม่เพลิดเพลิน ในช่วง 2 สัปดาห์"
                      value={mentalHealthScreening.bored2q}
                      color="yellow"
                    />
                    <br />
                    <StatCard
                      title="ไม่มีหรือมีภาวะซึมเศร้าระดับน้อย"
                      value={mentalHealthScreening.depression9q.low}
                      color="green"
                    />
                    <StatCard
                      title="มีภาวะซึมเศร้าระดับปานกลาง"
                      value={mentalHealthScreening.depression9q.medium}
                      color="yellow"
                    />
                    <StatCard
                      title="มีภาวะซึมเศร้าระดับรุนแรง"
                      value={mentalHealthScreening.depression9q.high}
                      color="red"
                    />
                    <StatCard
                      title="ไม่มีหรือมีแนวโน้มจะฆ่าตัวตายในปัจจุบันระดับน้อย"
                      value={mentalHealthScreening.suicideRisk8q.low}
                      color="green"
                    />
                    <StatCard
                      title="มีแนวโน้มจะฆ่าตัวตายในปัจจุบันระดับปานกลาง"
                      value={mentalHealthScreening.suicideRisk8q.medium}
                      color="yellow"
                    />
                    <StatCard
                      title="มีแนวโน้มจะฆ่าตัวตายในปัจจุบันระดับรุนแรง"
                      value={mentalHealthScreening.suicideRisk8q.high}
                      color="red"
                    />
                  </>
                )}
                {selectedFormType === "" && (
                  <>
                    <StatCard
                      title="ความซึมเศร้า ระดับต่ำ"
                      value={depressionLevels.low}
                      color="blue"
                    />
                    <StatCard
                      title="ความซึมเศร้า ระดับกลาง"
                      value={depressionLevels.medium}
                      color="blue"
                    />
                    <StatCard
                      title="ความซึมเศร้า ระดับร้ายแรง"
                      value={depressionLevels.high}
                      color="blue"
                    />
                    <StatCard
                      title="ความวิตกกังวล ระดับต่ำ"
                      value={anxietyLevels.low}
                      color="violet"
                    />
                    <StatCard
                      title="ความวิตกกังวล ระดับกลาง"
                      value={anxietyLevels.medium}
                      color="violet"
                    />
                    <StatCard
                      title="ความวิตกกังวล ระดับร้ายแรง"
                      value={anxietyLevels.high}
                      color="violet"
                    />
                    <StatCard
                      title="ความเครียด ระดับต่ำ"
                      value={stressLevels.low}
                      color="red"
                    />
                    <StatCard
                      title="ความเครียด ระดับกลาง"
                      value={stressLevels.medium}
                      color="red"
                    />
                    <StatCard
                      title="ความเครียด ระดับร้ายแรง"
                      value={stressLevels.high}
                      color="red"
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const colors = {
  orange: "#FB923C", // orange-400
  blue: "#3B82F6", // blue-500
  green: "#22C55E", // green-500
  red: "#DC2626", // red-600
  violet: "#8B5CF6", // violet-500
  rose: "#FB7185", // rose-400
  yellow: "#EAB308", // yellow-500
};

const customStyles = {
  dropdownIndicator: (base) => ({
    ...base,
    color: "rgb(255, 255, 255)",
  }),
};

function StatCard({ title, value, color }) {
  // Determine if color is a hex value or a named color
  const bgColor = color.startsWith("#") ? color : colors[color] || "#9CA3AF"; // Use gray-400 as default

  return (
    <div
      className="flex flex-col justify-between rounded-md p-4 h-full"
      style={{ backgroundColor: bgColor }}
    >
      <div className="pb-4 text-lg text-black">{title}</div>
      <div className="text-4xl md:text-5xl lg:text-6xl text-black">{value}</div>
    </div>
  );
}
