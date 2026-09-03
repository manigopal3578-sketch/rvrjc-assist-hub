/**
 * RVRJC knowledge base.
 *
 * Every entry is transcribed from the official R.V.R. & J.C. College of
 * Engineering (Autonomous) website (https://rvrjcce.ac.in) and carries the
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
  /** Direct link to the official PDF, when a verified download URL exists. */
  pdfUrl?: string;
};

export const OFFICIAL_SITE = "https://rvrjcce.ac.in";

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
    sourceUrl: "https://rvrjcce.ac.in/xadmission.php",
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
    sourceUrl: "https://rvrjcce.ac.in/xfeestructure.php",
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
    sourceUrl: "https://rvrjcce.ac.in/xfeepayments.php",
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
    sourceUrl: "https://rvrjcce.ac.in/xacademiccalender.php",
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
      "• Register-number-wise results: https://rvrjcce.ac.in/examcell/results/\n" +
      "• Consolidated results page: https://rvrjcce.ac.in/xresults-new.php\n\n" +
      "Enter your register number on the RegNo-wise page to see your semester results. Malpractice cases and their punishments are also published by the Examination Cell.",
    sourceLabel: "Official Results page",
    sourceUrl: "https://rvrjcce.ac.in/xresults-new.php",
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
      "Engineering: Computer Science & Engineering (rvrjcce.ac.in/CSE), CSE (AI & ML) (/xcsm), CSE (Data Science) (/CSD), CSE (IoT) (/CSO), Computer Science & Business Systems – powered by TCS (/CSBS), Artificial Intelligence (/AI), AI & Data Science (/AIDS), Quantum Computing (/QTC), Information Technology (/IT), Electronics & Communication Engineering (/ECE), Electrical & Electronics Engineering (/EEE), Mechanical Engineering (/ME), Civil Engineering (/CE), Chemical Engineering (/Chemical).\n\n" +
      "Others: Computer Applications – MCA (/CA), Management Sciences – BBA & MBA (/MBA), Mathematics & Humanities (/mandh), Physics (/Physics), Chemistry (/Chemistry).",
    sourceLabel: "Official Programs Offered page",
    sourceUrl: "https://rvrjcce.ac.in/xcourses.php",
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
    sourceUrl: "https://rvrjcce.ac.in/xtrainingandplacements.php",
  },
  {
    id: "scholarships",
    topic: "Scholarships",
    keywords: ["scholarship", "scholarships", "fee reimbursement", "jyothi", "merit scholarship", "free tuition"],
    answer:
      "The college publishes its academic scholarship details on the official Academic Scholarship page. Note that under Category-A (Convener Quota), scholarship-eligible candidates need not pay tuition fee, as stated in the official fee structure.",
    sourceLabel: "Official Academic Scholarship page",
    sourceUrl: "https://rvrjcce.ac.in/xscholarships.php",
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
      "• Services directory: https://rvrjcce.ac.in/xstaffdirectory.php\n" +
      "• Grievance redressal: https://rvrjcce.ac.in/xstudgrievances.php",
    sourceLabel: "Official College Services Directory",
    sourceUrl: "https://rvrjcce.ac.in/xstaffdirectory.php",
  },
  {
    id: "notices",
    topic: "Notices",
    keywords: ["notice", "notices", "circular", "news", "announcement", "latest", "newsletter"],
    answer:
      "Latest official notices, circulars and news are posted on the college homepage under Latest News, Exam Schedules, Exam Results and Placements News sections. Newsletters are published separately at https://rvrjcce.ac.in/xnewsletters.php.",
    sourceLabel: "Official RVRJC homepage notices",
    sourceUrl: "https://rvrjcce.ac.in/index.php",
  },
  {
    id: "hostel-transport",
    topic: "Hostel & Transport",
    keywords: ["hostel", "hostels", "mess", "boarding", "lodging", "bus", "transport", "bus route", "bus fee"],
    answer:
      "Hostel: accommodation with boarding and lodging is optional and costs Rs. 48,000 for the academic year 2026-27, plus a refundable caution deposit of Rs. 4,000. Hostel details: https://rvrjcce.ac.in/xhostels.php\n\n" +
      "Transport: college bus transport is optional — Rs. 13,500 per year from Guntur and Rs. 15,000 per year from Chilakaluripet. Transport committee and routes: https://rvrjcce.ac.in/xtransport.php; bus fee payment: https://rvrjcce.ac.in/busfee/busfee.php",
    sourceLabel: "Official Fee Structure (hostel & transport charges)",
    sourceUrl: "https://rvrjcce.ac.in/xfeestructure.php",
  },
  {
    id: "academic-regulations",
    topic: "Academic Regulations",
    keywords: ["regulation", "regulations", "r24", "r20", "r18", "credits", "attendance", "detained", "promotion", "autonomous"],
    answer:
      "The college is autonomous (UGC autonomy letter dated 17-03-2024) and follows its own academic regulations — currently R24 for new UG batches, with R20 and R18 still in force for senior and supplementary batches. Full regulation documents, credit requirements, attendance and promotion rules are published on the official Academic Regulations page.",
    sourceLabel: "Official Academic Regulations page",
    sourceUrl: "https://rvrjcce.ac.in/xacademicregulations.php",
  },
  {
    id: "library-facilities",
    topic: "Library & Facilities",
    keywords: ["library", "facilities", "lab", "labs", "moodle", "lms", "wifi", "sports", "campus"],
    answer:
      "Central Library: https://rvrjcce.ac.in/xlibrary.php\n" +
      "Campus facilities overview: https://rvrjcce.ac.in/xfacilities.php\n" +
      "Moodle / LMS for course material: http://courses.rvrjc.ac.in/moodle/\n" +
      "Sports and recreation: https://rvrjcce.ac.in/xsportsactivities.php",
    sourceLabel: "Official Facilities page",
    sourceUrl: "https://rvrjcce.ac.in/xfacilities.php",
  },
  {
    id: "lateral-entry",
    topic: "Lateral Entry (ECET)",
    keywords: [
      "lateral entry", "lateral", "ecet", "diploma", "diploma holder", "second year admission",
      "direct second year", "polytechnic",
    ],
    answer:
      "Lateral entry admissions are offered into the second year of B.Tech for diploma holders through AP ECET.\n\n" +
      "• 10% of the sanctioned intake is available as lateral entry seats in the second year.\n" +
      "• Selection is through AP ECET rank, under the rules of the Government of Andhra Pradesh; seats are ratified by the Government.\n" +
      "• Convener quota lateral seats are allotted in the centralized ECET counselling; remaining seats are filled by the college on merit as per government directions.\n\n" +
      "Admissions helpline: 94910 73318.",
    sourceLabel: "Official Admission Procedure page",
    sourceUrl: "https://rvrjcce.ac.in/xadmission.php",
  },
  {
    id: "category-b-application",
    topic: "Category-B Application",
    keywords: [
      "category b", "management quota", "apply for management", "spot admission",
      "application form", "how to apply", "submit application", "b category application",
      "30%", "college application",
    ],
    answer:
      "Category-B (Management Quota) covers 30% of seats and is filled directly by the college in rank / merit order as per government directions, with all seats ratified by the Government.\n\n" +
      "Verified steps:\n" +
      "1. Keep your AP EAPCET rank card, 10+2 (MPC) marks memo, TC, study certificates, caste/income certificates and Aadhaar ready.\n" +
      "2. Apply to the college with those details — use the official Admission Procedure page for the current notification and application form for the year.\n" +
      "3. Branch allotment follows merit order and seat availability; the tuition fee depends on the branch (see the official fee structure).\n" +
      "4. Confirm the seat by paying the fee through the official online tuition fee portal.\n\n" +
      "Admissions helpline: 94910 73318.",
    sourceLabel: "Official Admission Procedure page",
    sourceUrl: "https://rvrjcce.ac.in/xadmission.php",
  },
  {
    id: "exam-fee",
    topic: "Examination Fee",
    keywords: [
      "exam fee", "examination fee", "supply fee", "supplementary fee", "pay exam fee",
      "revaluation fee", "exam fee last date", "exam fee notification",
    ],
    answer:
      "Examination fees are paid online through the Examination Cell's own gateway: https://rvrjcce.ac.in/examfee/examfee.php\n\n" +
      "Enter your register number, select the examination shown for your semester and regulation, and complete the payment. Fee notifications and last dates for regular and supplementary examinations are published on the official examinations pages along with the time tables.\n\n" +
      "As per the official terms, transaction charges are borne by the cardholder and are not refunded or reversed under any circumstances.",
    sourceLabel: "Official Fee Payments page",
    sourceUrl: "https://rvrjcce.ac.in/xfeepayments.php",
  },
  {
    id: "grievance",
    topic: "Grievances & Student Support",
    keywords: [
      "grievance", "grievances", "complaint", "ragging", "anti ragging", "harassment",
      "committee", "redressal", "report", "help",
    ],
    answer:
      "The college runs a Student Grievance Redressal Cell for student complaints, including academic, administrative and disciplinary matters. Submit your grievance to the cell through your Head of Department or the administrative office; the members and procedure are published on the official page.\n\n" +
      "• Student grievance redressal: https://rvrjcce.ac.in/xstudgrievances.php\n" +
      "• College services directory (to reach the right office): https://rvrjcce.ac.in/xstaffdirectory.php",
    sourceLabel: "Official Student Grievances page",
    sourceUrl: "https://rvrjcce.ac.in/xstudgrievances.php",
  },
  {
    id: "moodle-lms",
    topic: "Moodle / Course Material",
    keywords: [
      "moodle", "lms", "course material", "notes", "study material", "online classes",
      "assignments", "login", "e-learning",
    ],
    answer:
      "Course material, unit notes and assignments are hosted on the college Moodle / LMS: http://courses.rvrjc.ac.in/moodle/\n\n" +
      "Log in with the credentials issued by your department; each subject is enrolled by the concerned faculty. For login issues, contact your subject faculty or department office (see the college services directory).",
    sourceLabel: "Official RVRJC Moodle / LMS",
    sourceUrl: "http://courses.rvrjc.ac.in/moodle/",
  },
  {
    id: "contact-location",
    topic: "Contact & Location",
    keywords: [
      "contact", "address", "location", "where is the college", "phone", "email",
      "helpline", "reach", "map", "chowdavaram", "guntur", "office timings",
    ],
    answer:
      "R.V.R. & J.C. College of Engineering (Autonomous) is located at Chandramoulipuram, Chowdavaram, Guntur – 522 019, Andhra Pradesh, India.\n\n" +
      "• College phone: 94910 73317 & 94910 73318 (also the admissions helpline)\n" +
      "• City office: R.V.R. & J.C. CoE City Office, Opposite Chinmaya Vidyalaya, S.V.N. Colony, Guntur – 522 006. Ph: 0863-2232505 (O), Fax: 0863-2350343\n" +
      "• Training & Placement: tpo@rvrjc.ac.in, +91 9491071947\n" +
      "• Department-wise and office-wise contacts are listed in the official college services directory: https://rvrjcce.ac.in/xstaffdirectory.php",
    sourceLabel: "Official Details of the College page",
    sourceUrl: "https://rvrjcce.ac.in/detailesofthecollege.php",
  },
  {
    id: "campus-map",
    topic: "Campus Map & Directions",
    keywords: [
      "campus map", "map", "directions", "how to reach", "route", "google maps", "locate",
      "location of college", "landmark", "bus stop", "railway station", "gate", "blocks",
      "which block", "organizational map", "city office",
    ],
    answer:
      "Campus map & location (official Campus Map page):\n\n" +
      "• Main campus: Chandramoulipuram, Chowdavaram, Guntur – 522 019, on the Guntur–Chilakaluripet side of Guntur city. Ph: 94910 73317 / 94910 73318.\n" +
      "• Map coordinates used on the official campus map: 16.254766, 80.325605.\n" +
      "• Google Maps directions: https://www.google.com/maps/dir/?api=1&destination=16.254766,80.325605\n" +
      "• City office: Opposite Chinmaya Vidyalaya, S.V.N. Colony, Guntur – 522 006. Ph: 0863-2232505.\n" +
      "• Inside the campus, each department has its own block and its own official page (CSE, ECE, EEE, ME, CE, Chemical, IT, AI, AIDS, QTC, CSBS, CSD, CSO, MCA, MBA/BBA, Mathematics & Humanities, Physics, Chemistry); the Examination Cell, Central Library, Training & Placement Cell and Student Wellness Centre are separate facilities listed on the official facilities page.\n" +
      "• College buses run from Guntur and Chilakaluripet — see the Transport Committee page: https://rvrjcce.ac.in/xtransport.php",
    sourceLabel: "Official Campus Map & Location page",
    sourceUrl: "https://rvrjcce.ac.in/xcampusmap.php",
  },
  {
    id: "admission-portal",
    topic: "Admission Portal",
    keywords: [
      "admission portal", "portal", "online application", "apply online", "counselling portal",
      "web options", "certificate verification", "application status", "status of application",
      "seat allotment", "allotment order", "cets", "apsche", "eapcet portal", "registration",
    ],
    answer:
      "There are two official routes, depending on your category:\n\n" +
      "1. Category-A (70%, Convener Quota): registration, fee payment, certificate verification, web options and seat allotment are all done on the Government of A.P. / APSCHE CETs admissions portal — https://cets.apsche.ap.gov.in/ — where you also track your application status and download the allotment order. RVRJC does not run this step.\n" +
      "2. Category-B (30%, Management Quota) and lateral entry (ECET): you apply directly to the college as per the notification on the official Admission Procedure page — https://rvrjcce.ac.in/xadmission.php — and confirm the seat by paying the tuition fee on the college's own portal: https://rvrjcce.ac.in/tuitionfee/tuitionfee.php\n\n" +
      "Admissions helpline: 94910 73318 (also 94910 73317).",
    sourceLabel: "Official Admission Procedure page",
    sourceUrl: "https://rvrjcce.ac.in/xadmission.php",
  },
  {
    id: "payment-status",
    topic: "Fee Payment Status",
    keywords: [
      "payment status", "fee status", "did my payment go through", "failed payment",
      "transaction failed", "receipt", "download receipt", "online fee status", "refund",
    ],
    answer:
      "Check a fee payment on the college's Online Fee Payment Status page: https://rvrjcce.ac.in/xonlinefeestatus.php — enter the register/admission number you used while paying.\n\n" +
      "The three payment gateways are separate, so check the one you used:\n" +
      "• Tuition / common services fee — https://rvrjcce.ac.in/tuitionfee/tuitionfee.php\n" +
      "• Examination fee — https://rvrjcce.ac.in/examfee/examfee.php\n" +
      "• Bus fee — https://rvrjcce.ac.in/busfee/busfee.php\n\n" +
      "Official terms: transaction fee charges are borne by the cardholder and are not refunded or reversed under any circumstances, including refunds, reversals or chargebacks. If an amount is debited but not shown, contact the college office on 94910 73317 / 94910 73318 with the transaction reference.",
    sourceLabel: "Official Fee Payments page",
    sourceUrl: "https://rvrjcce.ac.in/xfeepayments.php",
  },
  {
    id: "admission-documents",
    topic: "Admission Documents",
    keywords: [
      "documents", "document", "certificates required", "originals", "upload", "document upload",
      "what to bring", "tc", "caste certificate", "income certificate", "aadhaar", "rank card",
      "study certificate", "verification",
    ],
    answer:
      "Documents required at admission (as per the Government of A.P. admission rules the college follows):\n\n" +
      "• AP EAPCET / ECET rank card and hall ticket\n" +
      "• 10+2 (Intermediate, MPC) or diploma marks memo — minimum qualification for B.Tech is 10+2 with MPC or equivalent\n" +
      "• SSC / 10th certificate (for date of birth)\n" +
      "• Transfer Certificate (TC) and study certificates (Class VI to XII)\n" +
      "• Caste certificate and income certificate (for reservation and fee reimbursement)\n" +
      "• Aadhaar card and passport-size photographs\n\n" +
      "For Category-A, originals are uploaded/verified at the certificate-verification step of the APSCHE CETs counselling (https://cets.apsche.ap.gov.in/). For Category-B and lateral entry, submit them at the college admissions office — helpline 94910 73318. All seats are ratified by the Government.",
    sourceLabel: "Official Admission Procedure page",
    sourceUrl: "https://rvrjcce.ac.in/xadmission.php",
  },
  {
    id: "hall-ticket-exam-section",
    topic: "Hall Tickets & Exam Section",
    keywords: [
      "hall ticket", "hallticket", "admit card", "exam section", "exam cell contact",
      "malpractice", "revaluation", "recounting", "external examination", "internal examination",
    ],
    answer:
      "Hall tickets, examination notifications, internal and external examination matters are handled by the Examination Cell: https://rvrjcce.ac.in/examcell/\n\n" +
      "• Time tables (year-wise PDFs): https://rvrjcce.ac.in/xexamtimetables.php\n" +
      "• Results: https://rvrjcce.ac.in/examcell/results/ and https://rvrjcce.ac.in/xresults-new.php\n" +
      "• Examination fee payment: https://rvrjcce.ac.in/examfee/examfee.php\n" +
      "• Malpractice cases and their punishments are published by the Examination Cell.\n\n" +
      "Hall tickets are issued through your department once the examination fee is paid; collect or download it as announced in the exam notification for your semester.",
    sourceLabel: "Official Examination Section",
    sourceUrl: "https://rvrjcce.ac.in/examcell/",
  },
  {
    id: "transport-routes",
    topic: "Bus Routes & Transport",
    keywords: [
      "bus", "bus route", "transport", "transport committee", "bus timings", "college bus",
      "chilakaluripet", "guntur bus", "bus pass",
    ],
    answer:
      "College transport is optional and managed by the Transport Committee: https://rvrjcce.ac.in/xtransport.php\n\n" +
      "• Bus fee per year: Rs. 13,500 from Guntur and Rs. 15,000 from Chilakaluripet (official fee structure).\n" +
      "• Pay the bus fee online: https://rvrjcce.ac.in/busfee/busfee.php\n" +
      "• Route lists, stops and timings are published by the Transport Committee — check that page or the committee members for your stop.",
    sourceLabel: "Official Transport Committee page",
    sourceUrl: "https://rvrjcce.ac.in/xtransport.php",
  },
  {
    id: "syllabus",
    topic: "Scheme & Syllabus",
    keywords: [
      "syllabus", "scheme", "scheme and syllabus", "curriculum", "course structure",
      "subjects", "subject list", "syllabus pdf", "r26", "r24", "r20", "r18", "credits",
    ],
    answer:
      "Scheme & syllabus is published per department and per regulation (R26 / R24 / R20 / R18) on each department's own official page:\n\n" +
      "• CSE — https://rvrjcce.ac.in/CSE/schemeandsyllabus.php\n" +
      "• ECE — https://rvrjcce.ac.in/ECE/schemeandsyllabus.php\n" +
      "• EEE — https://rvrjcce.ac.in/EEE/schemeandsyllabus.php\n" +
      "• IT — https://rvrjcce.ac.in/IT/schemeandsyllabus.php\n" +
      "• Mechanical — https://rvrjcce.ac.in/ME/schemeandsyllabus.php\n" +
      "• Civil — https://rvrjcce.ac.in/CE/schemeandsyllabus.php\n" +
      "• Chemical — https://rvrjcce.ac.in/Chemical/schemeandsyllabus.php\n" +
      "• MCA — https://rvrjcce.ac.in/CA/schemeandsyllabus.php · MBA/BBA — https://rvrjcce.ac.in/MBA/schemeandsyllabus.php\n\n" +
      "Each page lists the semester-wise course structure with a PDF for every subject. The regulation documents themselves are at " +
      "https://rvrjcce.ac.in/files/R26-Regulations.pdf and https://rvrjcce.ac.in/files/R24-UG-Regulations.pdf.\n" +
      "In this app, open the Syllabus tab to pick your department and regulation and download the official PDFs directly.",
    sourceLabel: "Official Academic Regulations & Syllabus",
    sourceUrl: "https://rvrjcce.ac.in/xacademicregulations.php",
  },
  {
    id: "syllabus-schedule",
    topic: "Syllabus Schedule & Mid Exam Dates",
    keywords: [
      "syllabus schedule", "unit wise", "mid syllabus", "first mid", "second mid",
      "mid exam dates", "mid dates", "class work", "last working day", "sem end",
      "semester end", "how much syllabus", "portion",
    ],
    answer:
      "Syllabus coverage follows the mid-exam schedule in the official academic calendar (odd semester 2026-27):\n\n" +
      "• B.Tech III & IV Year (and BBA II Year): class work 17-JUN-2026 · first mid 17-AUG-2026 · last working day 24-OCT-2026 · second mid 26-OCT-2026 · sem-end exams from 11-NOV-2026\n" +
      "• B.Tech II Year: class work 03-AUG-2026 · first mid 21-SEP-2026 · last working day 21-NOV-2026 · second mid 23-NOV-2026 · sem-end exams from 07-DEC-2026\n" +
      "• B.Tech I Year: class work 03-AUG-2026 · first mid 02-NOV-2026 · second mid 02-JAN-2027 · sem-end exams from 20-JAN-2027\n\n" +
      "The first mid covers roughly the first half of the units and the second mid the remaining units; the exact unit split is announced by each subject teacher from the department's scheme & syllabus (https://rvrjcce.ac.in/xacademicregulations.php). Year-wise calendar PDFs: https://rvrjcce.ac.in/xacademiccalender.php",
    sourceLabel: "Official Academic Calendar",
    sourceUrl: "https://rvrjcce.ac.in/xacademiccalender.php",
  },
  {
    id: "hostel-rules",
    topic: "Hostel Rules & Facilities",
    keywords: [
      "hostel rules", "hostel", "hostels", "mens hostel", "men's hostel", "womens hostel",
      "women's hostel", "girls hostel", "warden", "mess", "biometric", "hostel timings",
      "hostel facilities", "hostel capacity",
    ],
    answer:
      "RVRJC runs three hostels (official hostels page: https://rvrjcce.ac.in/xhostels.php):\n\n" +
      "• Men's Hostel — inside the campus at Chandramoulipuram, 2 blocks, about 1250 students (https://rvrjcce.ac.in/xmenshostel.php)\n" +
      "• Women's Hostel — S.V.N. Colony, Guntur, 2 blocks, about 400 students, for 2nd–4th year and PG women students (https://rvrjcce.ac.in/xwomenshostel.php)\n" +
      "• First-Year Girls' Hostel — capacity 294, biometric entry/exit for security, hostel office 0863-2244171 (https://rvrjcce.ac.in/xgirlshostel.php)\n\n" +
      "Rules students must follow: stay in the allotted room, sign in/out at the entry register (biometric in the girls' hostel), be back before the notified closing time, take written warden permission for leave/outing, attend the mess timings, and keep ragging, alcohol, smoking and outside visitors out — ragging is punishable and reportable to the Anti-Ragging Committee (https://rvrjcce.ac.in/xstudgrievances.php).\n" +
      "Hostel fee 2026-27: Rs. 48,000 per year plus Rs. 4,000 refundable caution deposit.",
    sourceLabel: "Official Hostels page",
    sourceUrl: "https://rvrjcce.ac.in/xhostels.php",
  },
  {
    id: "hostel-application",
    topic: "Hostel Application & Fee",
    keywords: [
      "hostel application", "apply hostel", "hostel admission", "hostel form",
      "hostel fee", "hostel seat", "hostel dd", "caution deposit", "hostel payment",
      "hostel portal", "hostel status",
    ],
    answer:
      "How to get a hostel seat:\n\n" +
      "1. Take hostel admission at the time of / after college admission — apply to the Chief Warden through the hostel office (Men's hostel on campus; Women's hostel at S.V.N. Colony; first-year girls' hostel office 0863-2244171).\n" +
      "2. Pay the hostel fee: Rs. 48,000 per year plus Rs. 4,000 refundable caution deposit (2026-27 official fee structure — https://rvrjcce.ac.in/xfeestructure.php). Men's hostel receipts are paid by DD in favour of \"NES Hostels – Men's Hostel Receipts A/c\", Union Bank of India, Guntur, or as notified on the hostel page.\n" +
      "3. Submit the documents: admission/allotment letter, fee receipt or DD, Aadhaar, passport photos, parent contact and address proof, and a medical/undertaking form where asked.\n" +
      "4. Track any online payment at https://rvrjcce.ac.in/xonlinefeestatus.php and other fee payments at https://rvrjcce.ac.in/xfeepayments.php\n\n" +
      "In this app you can fill the Hostel Application form (Hostel tab) and it takes you to the official hostels page and payment portal.",
    sourceLabel: "Official Hostels page",
    sourceUrl: "https://rvrjcce.ac.in/xhostels.php",
  },
  {
    id: "library-hours",
    topic: "Central Library",
    keywords: [
      "library", "library hours", "library timings", "central library", "books",
      "borrow", "issue books", "e journals", "ejournals", "ebooks", "reading room",
      "delnet", "nptel", "library holiday",
    ],
    answer:
      "The Central Library is a five-floor library (official page: https://rvrjcce.ac.in/xlibrary.php).\n\n" +
      "Timings on working days:\n" +
      "• Library open 8:00 AM – 9:30 PM\n" +
      "• Book circulation (issue / return) 8:00 AM – 8:00 PM\n" +
      "• Sundays and holidays 10:00 AM – 4:30 PM\n\n" +
      "Collection: about 32,281 titles / 1,29,920 volumes, 22,984 e-journals and 12,399 e-books, plus back volumes, project reports and digital resources.\n" +
      "Borrowing: UG students 3 books for 14 days; PG students 4 books for 14 days. Renewal and reference/reading-room use as per library rules; carry your ID card.",
    sourceLabel: "Official Central Library page",
    sourceUrl: "https://rvrjcce.ac.in/xlibrary.php",
  },
  {
    id: "syllabus-regulation-which",
    topic: "Which Regulation Applies To Me",
    keywords: [
      "which regulation", "r26", "r24", "r20", "r18", "my regulation", "regulation applies",
      "admission year regulation", "old syllabus", "new syllabus", "syllabus version",
    ],
    answer:
      "RVRJC is autonomous, so your syllabus is decided by the regulation of your admission batch, not by the current year:\n\n" +
      "• R26 — students admitted from the 2026-27 batch\n" +
      "• R24 — batch admitted from 2024-25\n" +
      "• R20 — batch admitted from 2020-21\n" +
      "• R18 — older batches still clearing backlogs\n\n" +
      "Lateral-entry (ECET) students follow the regulation of the batch they join in II year. Pick your regulation on your department's scheme & syllabus page (for example https://rvrjcce.ac.in/CSE/schemeandsyllabus.php) to see the semester-wise course structure and the PDF for each subject. Regulation documents: https://rvrjcce.ac.in/xacademicregulations.php",
    sourceLabel: "Official Academic Regulations page",
    sourceUrl: "https://rvrjcce.ac.in/xacademicregulations.php",
  },
  {
    id: "syllabus-units-marks",
    topic: "Syllabus Units & Internal Marks",
    keywords: [
      "how many units", "units in a subject", "internal marks", "internal assessment",
      "mid marks", "sessional marks", "pass marks", "credits", "attendance percentage",
      "best of two mids", "exam pattern",
    ],
    answer:
      "Each theory subject in the autonomous regulations is organised into five units in the scheme & syllabus, and each semester has two mid examinations covering roughly half the units each.\n\n" +
      "• Internal (continuous) assessment plus the end-semester examination together make up the subject marks; the exact split, the weightage given to the two mids, assignments and the minimum marks needed to pass are printed in your regulation booklet (R26 / R24 / R20 / R18).\n" +
      "• Attendance: a minimum of 75% attendance is required to be eligible for the end-semester examination, with condonation only as allowed in the regulations.\n\n" +
      "Read the exact rule for your batch in the regulation PDF at https://rvrjcce.ac.in/xacademicregulations.php and the unit-wise content on your department's scheme & syllabus page.",
    sourceLabel: "Official Academic Regulations page",
    sourceUrl: "https://rvrjcce.ac.in/xacademicregulations.php",
  },
  {
    id: "hostel-timings-leave",
    topic: "Hostel Timings & Leave",
    keywords: [
      "hostel timings", "hostel time", "in time", "curfew", "hostel leave", "outing",
      "going home", "warden permission", "hostel gate", "late night", "hostel entry",
    ],
    answer:
      "Hostel entry/exit and leave are controlled by the Chief Warden and the resident wardens:\n\n" +
      "• Sign in and out at the hostel entry register every time you leave the hostel; the First-Year Girls' Hostel uses biometric entry/exit for security (https://rvrjcce.ac.in/xgirlshostel.php).\n" +
      "• Be back inside the hostel before the closing time notified on the hostel notice board, and follow the study-hour and mess timings displayed there.\n" +
      "• Home visits and outings need written permission from the warden, with the parent/guardian informed; the warden records the leave in the movement register.\n" +
      "• Ragging, alcohol, smoking and outside visitors in the rooms are prohibited — ragging is reportable to the Anti-Ragging Committee (https://rvrjcce.ac.in/xstudgrievances.php).\n\n" +
      "The exact in-time for the current year is notified by the hostel office — Men's hostel (on campus), Women's hostel S.V.N. Colony, first-year girls' hostel office 0863-2244171.",
    sourceLabel: "Official Hostels page",
    sourceUrl: "https://rvrjcce.ac.in/xhostels.php",
  },
  {
    id: "hostel-mess",
    topic: "Hostel Mess & Food",
    keywords: [
      "mess", "mess fee", "food", "canteen", "dining", "mess timings", "menu",
      "hostel food", "vegetarian", "mess bill",
    ],
    answer:
      "The hostels run their own mess and dining halls for resident students, with the daily menu and mess timings (breakfast, lunch, snacks, dinner) displayed in the hostel.\n\n" +
      "• The mess/food charges are part of the hostel fee for 2026-27: Rs. 48,000 per year plus Rs. 4,000 refundable caution deposit (official fee structure — https://rvrjcce.ac.in/xfeestructure.php).\n" +
      "• Men's hostel: inside the campus at Chandramoulipuram; Women's hostel: S.V.N. Colony, Guntur; First-Year Girls' Hostel: capacity 294.\n" +
      "• Special food requirements (medical/diet) should be given in writing to the warden at the time of hostel admission.\n\n" +
      "For the current menu and mess rules ask the hostel office; hostel pages: https://rvrjcce.ac.in/xhostels.php",
    sourceLabel: "Official Hostels page",
    sourceUrl: "https://rvrjcce.ac.in/xhostels.php",
  },
  {
    id: "library-eresources",
    topic: "Library E-Resources & Renewal",
    keywords: [
      "e journals", "ejournals", "ebooks", "e books", "delnet", "nptel", "digital library",
      "renew book", "renewal", "late fine", "lost book", "id card library", "reading room",
      "library rules", "how many books",
    ],
    answer:
      "Central Library (five floors — https://rvrjcce.ac.in/xlibrary.php):\n\n" +
      "• Borrowing: UG students 3 books for 14 days, PG students 4 books for 14 days. Books can be renewed at the circulation counter if no one else has reserved them; carry your college ID card for every transaction.\n" +
      "• Overdue books attract the fine notified by the library, and a lost book has to be replaced or paid for as per library rules.\n" +
      "• Digital resources: about 22,984 e-journals and 12,399 e-books, plus DELNET resources, NPTEL video lectures, back volumes, project reports and a digital/reading section — accessible from the library on campus.\n" +
      "• Timings: 8:00 AM – 9:30 PM on working days (circulation 8:00 AM – 8:00 PM); 10:00 AM – 4:30 PM on Sundays and holidays.",
    sourceLabel: "Official Central Library page",
    sourceUrl: "https://rvrjcce.ac.in/xlibrary.php",
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
  { question: "How do I apply for a Category-B management quota seat?", chunkId: "category-b-application" },
  { question: "How does lateral entry admission through AP ECET work?", chunkId: "lateral-entry" },
  { question: "How do I pay the examination fee online?", chunkId: "exam-fee" },
  { question: "Which branches and departments does RVRJC offer?", chunkId: "departments" },
  { question: "What is the Category-B tuition fee for CSE and AI branches?", chunkId: "fee-structure" },
  { question: "How do placements work and who do I contact?", chunkId: "placements" },
  { question: "Where do I download course material on Moodle?", chunkId: "moodle-lms" },
  { question: "How do I file a grievance or report ragging?", chunkId: "grievance" },
  { question: "What are the R24 regulations and attendance rules?", chunkId: "academic-regulations" },
  { question: "Where is the college located and how do I contact it?", chunkId: "contact-location" },
  { question: "Am I eligible for a scholarship or fee reimbursement?", chunkId: "scholarships" },
  { question: "Where are the latest notices and circulars published?", chunkId: "notices" },
  { question: "Where do I check my fee payment status?", chunkId: "payment-status" },
  { question: "Which documents do I need at the time of admission?", chunkId: "admission-documents" },
  { question: "Where is the official admission portal to apply online?", chunkId: "admission-portal" },
  { question: "How do I reach the college campus and where exactly is it?", chunkId: "campus-map" },
  { question: "How do I get my hall ticket for semester exams?", chunkId: "hall-ticket-exam-section" },
  { question: "What are the college bus routes and bus fee?", chunkId: "transport-routes" },
  { question: "Where do I download the scheme and syllabus for my branch?", chunkId: "syllabus" },
  { question: "What is the syllabus schedule and when are the mid exams?", chunkId: "syllabus-schedule" },
  { question: "What are the hostel rules and facilities?", chunkId: "hostel-rules" },
  { question: "How do I apply for a hostel seat and pay the hostel fee?", chunkId: "hostel-application" },
  { question: "What are the central library hours and how many books can I borrow?", chunkId: "library-hours" },
  { question: "Which regulation applies to my batch — R26, R24, R20 or R18?", chunkId: "syllabus-regulation-which" },
  { question: "How are mid marks, internal marks and attendance calculated?", chunkId: "syllabus-units-marks" },
  { question: "What are the hostel timings and how do I get leave permission?", chunkId: "hostel-timings-leave" },
  { question: "How much is the hostel mess fee and where is the dining hall?", chunkId: "hostel-mess" },
  { question: "What e-resources, e-journals and NPTEL access does the library give?", chunkId: "library-eresources" },
];


