/**
 * RVRJC knowledge base.
 *
 * Every entry is transcribed from the official R.V.R. & J.C. College of
 * Engineering (Autonomous) website (https://rvrjc.ac.in) and carries the
 * DIRECT deep link to the exact page the fact came from — not the homepage.
 * The ask endpoint may only answer RVRJC-specific questions from these
 * chunks; it must never invent an RVRJC fact that is not written here.
 *
 * Verified against the official pages on 2026-09-01.
 */

export type KbChunk = {
  id: string;
  /** Short human topic name, used for the FAQ page and chat quick actions. */
  topic: string;
  /** Retrieval keywords (lowercase). */
  keywords: string[];
  /** Verified answer text (markdown-free plain text). */
  answer: string;
  sourceLabel: string;
  /** Direct deep link to the official page containing this information. */
  sourceUrl: string;
};

export const OFFICIAL_SITE = "https://rvrjc.ac.in";

export const KB: KbChunk[] = [
  {
    id: "admission-process",
    topic: "Admission Process",
    keywords: [
      "admission", "admissions", "apply", "eapcet", "eamcet", "ecet", "lateral entry",
      "b category", "management quota", "convener quota", "counselling", "eligibility",
      "join", "seat", "seats", "reservation", "10+2", "intermediate", "mpc",
    ],
    answer:
      "Admissions at RVR & JC College of Engineering are made as per the rules and regulations of the Government of Andhra Pradesh.\n\n" +
      "• 70% of seats (Category-A / Convener Quota) are filled through centralized counselling conducted by the Convener, AP EAPCET, on rank basis.\n" +
      "• The remaining 30% (Category-B / Management Quota) are filled by the college on rank/merit order as per government directions.\n" +
      "• All seats are ratified by the Government.\n" +
      "• Minimum qualification for B.Tech: 10+2 with MPC or equivalent.\n" +
      "• 10% Lateral Entry seats are available in the second year through AP ECET (diploma holders).\n" +
      "• Statutory reservations are followed as per government norms.\n\n" +
      "Admissions helpline: 94910 73318.",
    sourceLabel: "Official Admission Procedure page",
    sourceUrl: "https://rvrjc.ac.in/xadmission.php",
  },
  {
    id: "fee-structure",
    topic: "Fees",
    keywords: [
      "fee", "fees", "fee structure", "tuition", "tuition fee", "cost", "how much",
      "amount", "rupees", "category a", "category b", "mtech fee", "mba fee", "mca fee",
      "bba fee", "2nd year fees", "second year fees", "annual fee",
    ],
    answer:
      "Official fee structure (per year):\n\n" +
      "B.Tech (all branches) — Category-A / Convener Quota: Rs. 1,05,000 for 2025-26 (fixed by the Govt. of A.P.).\n" +
      "Category-B / Management Quota proposed tuition fee for 2026-27 varies by branch:\n" +
      "• Quantum Computing — Rs. 2,50,000\n" +
      "• AI, AI & Data Science, CSE, CSE (AI & ML) — Rs. 2,00,000\n" +
      "• CSE (Data Science) — Rs. 1,75,000\n" +
      "• Information Technology, ECE — Rs. 1,50,000\n" +
      "• EEE, Mechanical, Chemical, Civil — Rs. 75,000\n\n" +
      "BBA — Category-A Rs. 18,000; Category-B Rs. 50,000.\n" +
      "M.Tech (AI, AI & DS, Robotics & AI, Power Systems & Renewable Energy, Structural Engg., VLSI) — Rs. 90,000.\n" +
      "MBA and MCA — Rs. 60,000 each.\n\n" +
      "Optional charges: college bus transport Rs. 13,500 from Guntur and Rs. 15,000 from Chilakaluripet; hostel Rs. 48,000 for 2026-27 plus a refundable caution deposit of Rs. 4,000.\n\n" +
      "Scholarship-eligible candidates need not pay tuition fee under Category-A.",
    sourceLabel: "Official Fee Structure page",
    sourceUrl: "https://rvrjc.ac.in/xfeestructure.php",
  },
  {
    id: "fee-payment",
    topic: "Fee Payment",
    keywords: [
      "pay", "payment", "pay fees", "online payment", "how do i pay", "bus fee",
      "exam fee", "examination fee", "tuition payment", "common services fee",
      "transaction", "receipt", "payment status", "2nd year fees", "second year",
    ],
    answer:
      "Fees are paid through the college's official online fee payment portal. Separate payment gateways are provided for:\n\n" +
      "• Tuition / Common Services Fee — https://rvrjcce.ac.in/tuitionfee/tuitionfee.php\n" +
      "• Examination Fee — https://rvrjcce.ac.in/examfee/examfee.php\n" +
      "• Bus Fee — https://rvrjcce.ac.in/busfee/busfee.php\n\n" +
      "To pay your 2nd-year tuition fee, open the Tuition Fee link above, enter your registration/admission number, verify the amount shown for your branch and category, and complete the payment.\n\n" +
      "Note from the official terms: transaction fee charges are borne by the cardholder and are not refunded or reversed under any circumstances, including refunds, reversals or chargebacks. Payment status can be checked on the same fee payments page.",
    sourceLabel: "Official Fee Payments page",
    sourceUrl: "https://rvrjc.ac.in/xfeepayments.php",
  },
  {
    id: "academic-calendar",
    topic: "Academic Calendar",
    keywords: [
      "academic calendar", "calendar", "class work", "classwork", "mid", "first mid",
      "second mid", "last working day", "semester start", "sem end", "schedule",
      "important dates", "when do classes start", "odd semester",
    ],
    answer:
      "Academic calendars for B.Tech, M.Tech, MCA, MBA and BBA are published year-wise by the college (2018-19 through 2026-27), with a downloadable PDF for each class and regulation.\n\n" +
      "UG Academic Calendar, Odd Semester 2026-27 (Regulation R24):\n" +
      "• B.Tech IV Year & III Year, BBA II Year — class work from 17-JUN-2026; first mid 17-AUG-2026; last working day 24-OCT-2026; second mid 26-OCT-2026; semester-end exams from 11-NOV-2026.\n" +
      "• BBA III Year — class work from 24-JUN-2026, same mid/exam dates.\n" +
      "• B.Tech II Year — class work from 03-AUG-2026; first mid 21-SEP-2026; last working day 21-NOV-2026; second mid 23-NOV-2026; semester-end exams from 07-DEC-2026.\n" +
      "• B.Tech I Year — class work from 03-AUG-2026; first mid 02-NOV-2026.\n\n" +
      "Always download the PDF for your exact class and regulation from the official page for the authoritative dates.",
    sourceLabel: "Official Academic Calendars page",
    sourceUrl: "https://rvrjc.ac.in/xacademiccalender.php",
  },
  {
    id: "exam-timetable",
    topic: "Exam Time Table",
    keywords: [
      "time table", "timetable", "exam schedule", "examination time table", "exam date",
      "supply exam", "supplementary", "regular exam", "when is the exam", "released",
      "exam cell", "examination cell",
    ],
    answer:
      "Examination time tables are published by the Examination Cell year-wise (2021 to 2026) on the official time tables page, each row giving the exam end date, the examination details (course, semester, year, regulation, regular/supplementary) and a direct PDF link.\n\n" +
      "Recent entries for 2026 include: B.Tech Sem-IV 2nd Year R18 supplementary exams ending 21-09-2026, B.Tech Sem-VI 3rd Year R18 supplementary ending 19-09-2026, B.Tech Sem-IV 2nd Year R24 supplementary ending 18-09-2026, B.Tech Sem-VI 3rd Year R20 supplementary ending 17-09-2026, and BBA IV-Sem 2nd Year R24 supplementary ending 11-09-2026.\n\n" +
      "New time tables are released by the Examination Cell a few weeks before each exam session, so check the official page for your semester's notification.",
    sourceLabel: "Official Examination Time Tables page",
    sourceUrl: "https://rvrjcce.ac.in/xexamtimetables.php",
  },
  {
    id: "results",
    topic: "Results",
    keywords: [
      "result", "results", "marks", "grade", "cgpa", "sgpa", "revaluation",
      "regulation wise result", "register number", "regno", "check result",
    ],
    answer:
      "Published examination results are available from the Examination Cell:\n\n" +
      "• Results portal (batch-wise / examination-wise): https://rvrjcce.ac.in/examcell/results/\n" +
      "• Register-number-wise results: https://rvrjc.ac.in/examcell/results/regnoresultsR.php\n" +
      "• Consolidated results page: https://rvrjc.ac.in/xresults-new.php\n\n" +
      "Enter your register number on the RegNo-wise page to see your semester results. Malpractice cases and their punishments are also published by the Examination Cell.",
    sourceLabel: "Official Results page",
    sourceUrl: "https://rvrjc.ac.in/xresults-new.php",
  },
  {
    id: "departments",
    topic: "Departments",
    keywords: [
      "department", "departments", "branch", "branches", "programmes", "programs",
      "courses offered", "cse", "ece", "eee", "mechanical", "civil", "chemical", "it",
      "mba", "mca", "bba", "quantum", "ai", "data science", "csbs", "iot",
    ],
    answer:
      "Departments and programmes at RVR & JC College of Engineering (Autonomous):\n\n" +
      "Engineering: Computer Science & Engineering (rvrjc.ac.in/CSE), CSE (AI & ML) (/xcsm), CSE (Data Science) (/CSD), CSE (IoT) (/CSO), Computer Science & Business Systems – powered by TCS (/CSBS), Artificial Intelligence (/AI), AI & Data Science (/AIDS), Quantum Computing (/QTC), Information Technology (/IT), Electronics & Communication Engineering (/ECE), Electrical & Electronics Engineering (/EEE), Mechanical Engineering (/ME), Civil Engineering (/CE), Chemical Engineering (/Chemical).\n\n" +
      "Others: Computer Applications – MCA (/CA), Management Sciences – BBA & MBA (/MBA), Mathematics & Humanities (/mandh), Physics (/Physics), Chemistry (/Chemistry).",
    sourceLabel: "Official Programs Offered page",
    sourceUrl: "https://rvrjc.ac.in/xcourses.php",
  },
  {
    id: "placements",
    topic: "Placements",
    keywords: [
      "placement", "placements", "job", "recruitment", "campus interview", "company",
      "companies", "tpo", "career", "training and placement", "package", "internship",
    ],
    answer:
      "The Training & Placement Cell was established to create career opportunities in reputed corporates and organises campus recruitment drives, career guidance workshops, and in-house and outsourced corporate training programmes for pre-final and final year students. Its stated objectives include achieving 100% placements, inviting the best companies across industries, and strengthening industry–institute interaction.\n\n" +
      "Contacts:\n" +
      "• Ch. Srinivasa Rao, Training & Placement Officer — tpo@rvrjc.ac.in, +91 9491071947 / +91 9849958211\n" +
      "• Dr. K. Suresh Babu, Placement Officer — tpcell@rvrjc.ac.in, +91 9490750007\n\n" +
      "Students register and track drives on the placement portal: http://tandp.rvrjcce.ac.in",
    sourceLabel: "Official Training & Placements page",
    sourceUrl: "https://rvrjc.ac.in/xtrainingandplacements.php",
  },
  {
    id: "scholarships",
    topic: "Scholarships",
    keywords: ["scholarship", "scholarships", "fee reimbursement", "jyothi", "merit scholarship", "free tuition"],
    answer:
      "The college publishes its academic scholarship details on the official Academic Scholarship page. Note that under Category-A (Convener Quota), scholarship-eligible candidates need not pay tuition fee, as stated in the official fee structure.",
    sourceLabel: "Official Academic Scholarship page",
    sourceUrl: "https://rvrjc.ac.in/xscholarships.php",
  },
  {
    id: "certificates-office",
    topic: "Certificates & Office",
    keywords: [
      "bonafide", "certificate", "tc", "transfer certificate", "study certificate",
      "custodian", "office", "administrative office", "grievance", "complaint",
      "attestation", "duplicate",
    ],
    answer:
      "Bonafide, study and transfer certificate requests are handled by the college administrative office; the official website does not publish an online application form for them. The verified route is to apply in writing at the administrative office through your Head of Department, giving your name, register number, branch, year and the purpose of the certificate.\n\n" +
      "Use the College Services Directory to reach the correct office, and the Student Grievance Redressal Cell if a request is delayed:\n" +
      "• Services directory: https://rvrjc.ac.in/xstaffdirectory.php\n" +
      "• Grievance redressal: https://rvrjc.ac.in/xstudgrievances.php",
    sourceLabel: "Official College Services Directory",
    sourceUrl: "https://rvrjc.ac.in/xstaffdirectory.php",
  },
  {
    id: "notices",
    topic: "Notices",
    keywords: ["notice", "notices", "circular", "news", "announcement", "latest", "newsletter"],
    answer:
      "Latest official notices, circulars and news are posted on the college homepage under Latest News, Exam Schedules, Exam Results and Placements News sections. Newsletters are published separately at https://rvrjc.ac.in/xnewsletters.php.",
    sourceLabel: "Official RVRJC homepage notices",
    sourceUrl: "https://rvrjc.ac.in/index.php",
  },
  {
    id: "hostel-transport",
    topic: "Hostel & Transport",
    keywords: ["hostel", "hostels", "mess", "boarding", "lodging", "bus", "transport", "bus route", "bus fee"],
    answer:
      "Hostel: accommodation with boarding and lodging is optional and costs Rs. 48,000 for the academic year 2026-27, plus a refundable caution deposit of Rs. 4,000. Hostel details: https://rvrjcce.ac.in/xhostels.php\n\n" +
      "Transport: college bus transport is optional — Rs. 13,500 per year from Guntur and Rs. 15,000 per year from Chilakaluripet. Transport committee and routes: https://rvrjc.ac.in/transport.php; bus fee payment: https://rvrjcce.ac.in/busfee/busfee.php",
    sourceLabel: "Official Fee Structure (hostel & transport charges)",
    sourceUrl: "https://rvrjc.ac.in/xfeestructure.php",
  },
  {
    id: "academic-regulations",
    topic: "Academic Regulations",
    keywords: ["regulation", "regulations", "r24", "r20", "r18", "credits", "attendance", "detained", "promotion", "autonomous"],
    answer:
      "The college is autonomous (UGC autonomy letter dated 17-03-2024) and follows its own academic regulations — currently R24 for new UG batches, with R20 and R18 still in force for senior and supplementary batches. Full regulation documents, credit requirements, attendance and promotion rules are published on the official Academic Regulations page.",
    sourceLabel: "Official Academic Regulations page",
    sourceUrl: "https://rvrjc.ac.in/xacademicregulations.php",
  },
  {
    id: "library-facilities",
    topic: "Library & Facilities",
    keywords: ["library", "facilities", "lab", "labs", "moodle", "lms", "wifi", "sports", "campus"],
    answer:
      "Central Library: https://rvrjc.ac.in/xlibrary.php\n" +
      "Campus facilities overview: https://rvrjc.ac.in/xfacilities.php\n" +
      "Moodle / LMS for course material: http://courses.rvrjc.ac.in/moodle/\n" +
      "Sports and recreation: https://rvrjc.ac.in/xsportsactivities.php",
    sourceLabel: "Official Facilities page",
    sourceUrl: "https://rvrjc.ac.in/xfacilities.php",
  },
];

/** The seeded FAQ list — each question maps to a verified KB chunk. */
export const FAQ: { question: string; chunkId: string }[] = [
  { question: "Where can I find the academic calendar?", chunkId: "academic-calendar" },
  { question: "How do I pay 2nd year fees?", chunkId: "fee-payment" },
  { question: "When is the next exam timetable released?", chunkId: "exam-timetable" },
  { question: "How do I apply for a bonafide certificate?", chunkId: "certificates-office" },
  { question: "What is the B.Tech tuition fee per year?", chunkId: "fee-structure" },
  { question: "How are admissions done under Category-B?", chunkId: "admission-process" },
  { question: "Where do I check my semester results?", chunkId: "results" },
  { question: "How much is the hostel and bus fee?", chunkId: "hostel-transport" },
];
