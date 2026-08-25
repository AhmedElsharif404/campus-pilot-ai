export type AgendaItem = {
  id: string;
  time: string;
  duration: string;
  title: string;
  course: string;
  courseCode: string;
  kind: "class" | "study" | "deadline";
  note?: string;
  completed?: boolean;
};

export const courses = [
  {
    id: "bio-214",
    code: "BIO 214",
    name: "Cell Biology",
    instructor: "Dr. Maya Chen",
    color: "green",
    meetings: "Mon/Wed · 9:30–10:45",
    next: "Lab report · Sep 18",
  },
  {
    id: "hist-238",
    code: "HIST 238",
    name: "Cities & Memory",
    instructor: "Prof. Julian Reed",
    color: "blue",
    meetings: "Tue/Thu · 1:00–2:15",
    next: "Archive essay · Sep 22",
  },
  {
    id: "stat-201",
    code: "STAT 201",
    name: "Applied Statistics",
    instructor: "Dr. Nia Brooks",
    color: "amber",
    meetings: "Mon/Wed/Fri · 11:00–11:50",
    next: "Problem set 4 · Sep 19",
  },
  {
    id: "engl-170",
    code: "ENGL 170",
    name: "Writing the Natural World",
    instructor: "Prof. Eli Mora",
    color: "red",
    meetings: "Tue/Thu · 10:00–11:15",
    next: "Field notes · Sep 20",
  },
] as const;

export const agenda: AgendaItem[] = [
  {
    id: "a1",
    time: "9:30",
    duration: "75 min",
    title: "Cell Biology lecture",
    course: "Cell Biology",
    courseCode: "BIO 214",
    kind: "class",
    note: "Science Hall 204",
  },
  {
    id: "a2",
    time: "11:15",
    duration: "45 min",
    title: "Problem set 4 · questions 1–6",
    course: "Applied Statistics",
    courseCode: "STAT 201",
    kind: "study",
    note: "Planned from your Friday deadline",
  },
  {
    id: "a3",
    time: "1:00",
    duration: "75 min",
    title: "Cities & Memory seminar",
    course: "Cities & Memory",
    courseCode: "HIST 238",
    kind: "class",
    note: "Barton Hall 118",
  },
  {
    id: "a4",
    time: "3:30",
    duration: "50 min",
    title: "Lab report · draft results section",
    course: "Cell Biology",
    courseCode: "BIO 214",
    kind: "study",
    note: "High-priority plan session",
  },
  {
    id: "a5",
    time: "6:00",
    duration: "Due",
    title: "Reading response: urban archives",
    course: "Cities & Memory",
    courseCode: "HIST 238",
    kind: "deadline",
    note: "Submit on course portal",
  },
];

export const assignments = [
  {
    id: "as1",
    due: "Today, 6:00 PM",
    title: "Reading response: urban archives",
    course: "HIST 238",
    type: "Response",
    weight: "5%",
    urgency: "today",
    progress: 70,
  },
  {
    id: "as2",
    due: "Fri, Sep 18",
    title: "Cell membrane lab report",
    course: "BIO 214",
    type: "Lab",
    weight: "12%",
    urgency: "soon",
    progress: 42,
  },
  {
    id: "as3",
    due: "Sat, Sep 19",
    title: "Problem set 4",
    course: "STAT 201",
    type: "Problem set",
    weight: "4%",
    urgency: "soon",
    progress: 25,
  },
  {
    id: "as4",
    due: "Tue, Sep 22",
    title: "Archive essay · first draft",
    course: "HIST 238",
    type: "Essay",
    weight: "18%",
    urgency: "normal",
    progress: 10,
  },
  {
    id: "as5",
    due: "Thu, Sep 24",
    title: "Field notebook selection",
    course: "ENGL 170",
    type: "Writing",
    weight: "8%",
    urgency: "normal",
    progress: 0,
  },
] as const;

export const reviewFields = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    group: "Course",
    field: "Course title",
    value: "Cell Biology",
    confidence: 0.99,
    page: 1,
    source: "BIO 214: Cell Biology — Fall 2026",
    status: "pending",
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    group: "Course",
    field: "Instructor",
    value: "Dr. Maya Chen",
    confidence: 0.97,
    page: 1,
    source: "Instructor: Dr. Maya Chen · mchen@northbridge.edu",
    status: "pending",
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    group: "Meetings",
    field: "Lecture",
    value: "Monday & Wednesday, 9:30–10:45 AM",
    confidence: 0.96,
    page: 1,
    source: "Class meets M/W 9:30–10:45, Science Hall 204",
    status: "pending",
  },
  {
    id: "44444444-4444-4444-8444-444444444444",
    group: "Assignments",
    field: "Lab report",
    value: "September 18, 2026 at 11:59 PM",
    confidence: 0.91,
    page: 3,
    source: "Cell Membrane Lab Report — due Sept. 18 by 11:59pm",
    status: "pending",
  },
  {
    id: "55555555-5555-4555-8555-555555555555",
    group: "Exams",
    field: "Midterm examination",
    value: "October 12, 2026 at 9:30 AM",
    confidence: 0.98,
    page: 4,
    source: "Midterm Exam — Monday, October 12 during regular class hours.",
    status: "pending",
  },
  {
    id: "66666666-6666-4666-8666-666666666666",
    group: "Grading",
    field: "Participation weight",
    value: "10%",
    confidence: 0.72,
    page: 2,
    source: "Attendance and participation ........ 10 percent",
    status: "pending",
  },
] as const;
