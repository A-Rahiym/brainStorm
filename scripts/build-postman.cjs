/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require("node:fs");
const path = require("node:path");

const file = path.join(__dirname, "..", "config", "postman_collection.json");
const collection = JSON.parse(fs.readFileSync(file, "utf8"));

function url(raw, ...segments) {
  return { raw, host: ["{{base_url}}"], path: segments };
}

function jsonBody(obj) {
  return {
    mode: "raw",
    raw: JSON.stringify(obj, null, 2),
  };
}

function req(name, method, url, body, event) {
  const request = { method, header: [], url };
  if (body) {
    request.header = [{ key: "Content-Type", value: "application/json" }];
    request.body = jsonBody(body);
  }
  const item = { name, request };
  if (event) {
    item.event = [{ listen: "test", script: { exec: event, type: "text/javascript" } }];
  }
  return item;
}

const statusTest = (status, extra = []) => [
  `pm.test('status is ${status}', () => pm.response.to.have.status(${status}));`,
  ...extra,
];

const setVar = (varName) => [
  "const body = pm.response.json();",
  `pm.collectionVariables.set('${varName}', body.data.id);`,
];

const list = (pathSegments) =>
  req(`List ${pathSegments[pathSegments.length - 1]}`, "GET", url(`{{base_url}}/${pathSegments.join("/")}`, ...pathSegments), null, statusTest(200));

const getById = (name, varName) =>
  req(`Get ${name}`, "GET", url(`{{base_url}}/classroom/{{${varName}}}`, "classroom", `{{${varName}}}`), null, statusTest(200));

// ---------- Headmasters: add Create + List ----------
const hmFolder = collection.item.find((f) => f.name === "Headmasters");
hmFolder.item.push(
  req(
    "Create Headmaster",
    "POST",
    url("{{base_url}}/headmasters", "headmasters"),
    {
      firstName: "John",
      lastName: "Smith",
      email: "headmaster2@brainstorm.test",
      phone: "+2348000000009",
      staffNumber: "HST-002",
      dateOfBirth: "1975-05-20",
      employmentDate: "2020-01-05",
      status: "ACTIVE",
    },
    statusTest(201, setVar("headmaster_id"))
  )
);
hmFolder.item.push(
  req("List Headmasters", "GET", url("{{base_url}}/headmasters", "headmasters"), null, statusTest(200))
);

// ---------- Classroom folder ----------
const classroom = {
  name: "Classroom",
  item: [],
};

// Periods
classroom.item.push(
  req("Create Period", "POST", url("{{base_url}}/classroom/periods", "classroom", "periods"), {
    name: "Period 5",
    startTime: "13:00",
    endTime: "13:40",
  }, statusTest(201, setVar("period_id"))),
  req("List Periods", "GET", url("{{base_url}}/classroom/periods", "classroom", "periods"), null, statusTest(200)),
  req("Get Period", "GET", url("{{base_url}}/classroom/periods/{{period_id}}", "classroom", "periods", "{{period_id}}"), null, statusTest(200)),
  req("Update Period", "PATCH", url("{{base_url}}/classroom/periods/{{period_id}}", "classroom", "periods", "{{period_id}}"), { name: "Period 5 (revised)" }, statusTest(200))
);

// Timetable
classroom.item.push(
  req("Create Timetable Entry", "POST", url("{{base_url}}/classroom/timetable", "classroom", "timetable"), {
    classId: "{{class_id}}",
    teachingAssignmentId: "{{teacher_id}}",
    periodId: "{{period_id}}",
    dayOfWeek: "MONDAY",
  }, statusTest(201)),
  req("List Timetable", "GET", url("{{base_url}}/classroom/timetable", "classroom", "timetable"), null, statusTest(200))
);

// Attendance
classroom.item.push(
  req("Record Attendance", "POST", url("{{base_url}}/classroom/attendance", "classroom", "attendance"), {
    studentId: "{{student_id}}",
    classId: "{{class_id}}",
    termId: "{{term_id}}",
    date: "2026-09-14",
    status: "PRESENT",
  }, statusTest(201)),
  req("List Attendance", "GET", url("{{base_url}}/classroom/attendance", "classroom", "attendance"), null, statusTest(200))
);

// Assignments
classroom.item.push(
  req("Create Assignment", "POST", url("{{base_url}}/classroom/assignments", "classroom", "assignments"), {
    teachingAssignmentId: "{{teacher_id}}",
    title: "Algebra Worksheet 5",
    description: "Solve all problems",
    dueDate: "2026-10-05",
  }, statusTest(201, setVar("assignment_id"))),
  req("List Assignments", "GET", url("{{base_url}}/classroom/assignments", "classroom", "assignments"), null, statusTest(200)),
  req("Get Assignment", "GET", url("{{base_url}}/classroom/assignments/{{assignment_id}}", "classroom", "assignments", "{{assignment_id}}"), null, statusTest(200)),
  req("Update Assignment", "PATCH", url("{{base_url}}/classroom/assignments/{{assignment_id}}", "classroom", "assignments", "{{assignment_id}}"), { status: "CLOSED" }, statusTest(200))
);

// Assessments
classroom.item.push(
  req("Create Assessment", "POST", url("{{base_url}}/classroom/assessments", "classroom", "assessments"), {
    teachingAssignmentId: "{{teacher_id}}",
    termId: "{{term_id}}",
    name: "End of Term Exam",
    type: "EXAMINATION",
    maxScore: 100,
    date: "2026-11-20",
  }, statusTest(201, setVar("assessment_id"))),
  req("List Assessments", "GET", url("{{base_url}}/classroom/assessments", "classroom", "assessments"), null, statusTest(200)),
  req("Get Assessment", "GET", url("{{base_url}}/classroom/assessments/{{assessment_id}}", "classroom", "assessments", "{{assessment_id}}"), null, statusTest(200)),
  req("Update Assessment", "PATCH", url("{{base_url}}/classroom/assessments/{{assessment_id}}", "classroom", "assessments", "{{assessment_id}}"), { maxScore: 100 }, statusTest(200))
);

// Scores
classroom.item.push(
  req("Record Scores", "POST", url("{{base_url}}/classroom/scores", "classroom", "scores"), {
    assessmentId: "{{assessment_id}}",
    scores: [{ studentId: "{{student_id}}", score: 85 }],
  }, statusTest(201)),
  req("List Scores", "GET", url("{{base_url}}/classroom/scores?assessmentId={{assessment_id}}", "classroom", "scores"), null, statusTest(200)),
  req("Get Score", "GET", url("{{base_url}}/classroom/scores/{{score_id}}", "classroom", "scores", "{{score_id}}"), null, statusTest(200)),
  req("Update Score", "PATCH", url("{{base_url}}/classroom/scores/{{score_id}}", "classroom", "scores", "{{score_id}}"), { score: 90 }, statusTest(200))
);

// Submissions
classroom.item.push(
  req("Submit Assignment", "POST", url("{{base_url}}/classroom/submissions", "classroom", "submissions"), {
    assignmentId: "{{assignment_id}}",
    studentId: "{{student_id}}",
    content: "Completed worksheet attached",
  }, statusTest(201)),
  req("List Submissions", "GET", url("{{base_url}}/classroom/submissions", "classroom", "submissions"), null, statusTest(200)),
  req("Get Submission", "GET", url("{{base_url}}/classroom/submissions/{{submission_id}}", "classroom", "submissions", "{{submission_id}}"), null, statusTest(200)),
  req("Update Submission", "PATCH", url("{{base_url}}/classroom/submissions/{{submission_id}}", "classroom", "submissions", "{{submission_id}}"), { status: "GRADED" }, statusTest(200))
);

collection.item.push(classroom);

// ---------- Finance folder ----------
const finance = {
  name: "Finance",
  item: [],
};

// Fee structures
finance.item.push(
  req("Create Fee Structure", "POST", url("{{base_url}}/finance/fee-structures", "finance", "fee-structures"), {
    academicSessionId: "{{session_id}}",
    name: "Sports Fee",
    amount: 10000,
    description: "Termly sports levy",
  }, statusTest(201, setVar("fee_structure_id"))),
  req("List Fee Structures", "GET", url("{{base_url}}/finance/fee-structures", "finance", "fee-structures"), null, statusTest(200)),
  req("Get Fee Structure", "GET", url("{{base_url}}/finance/fee-structures/{{fee_structure_id}}", "finance", "fee-structures", "{{fee_structure_id}}"), null, statusTest(200)),
  req("Update Fee Structure", "PATCH", url("{{base_url}}/finance/fee-structures/{{fee_structure_id}}", "finance", "fee-structures", "{{fee_structure_id}}"), { amount: 12000 }, statusTest(200))
);

// Accounts
finance.item.push(
  req("Create Fee Accounts", "POST", url("{{base_url}}/finance/accounts", "finance", "accounts"), {
    feeStructureId: "{{fee_structure_id}}",
    studentIds: ["{{student_id}}"],
  }, statusTest(201, setVar("account_id"))),
  req("List Fee Accounts", "GET", url("{{base_url}}/finance/accounts", "finance", "accounts"), null, statusTest(200)),
  req("Get Fee Account", "GET", url("{{base_url}}/finance/accounts/{{account_id}}", "finance", "accounts", "{{account_id}}"), null, statusTest(200)),
  req("Update Fee Account", "PATCH", url("{{base_url}}/finance/accounts/{{account_id}}", "finance", "accounts", "{{account_id}}"), { amountDue: 12000 }, statusTest(200))
);

// Payments
finance.item.push(
  req("Record Payment", "POST", url("{{base_url}}/finance/payments", "finance", "payments"), {
    studentFeeAccountId: "{{account_id}}",
    amount: 5000,
    paymentMethod: "CASH",
    reference: "PAY-2026-9001",
  }, statusTest(201, setVar("payment_id"))),
  req("List Payments", "GET", url("{{base_url}}/finance/payments", "finance", "payments"), null, statusTest(200)),
  req("Get Payment", "GET", url("{{base_url}}/finance/payments/{{payment_id}}", "finance", "payments", "{{payment_id}}"), null, statusTest(200))
);

collection.item.push(finance);

// ---------- Dashboard folder ----------
collection.item.push({
  name: "Dashboard",
  item: [
    req("Get Dashboard", "GET", url("{{base_url}}/dashboard", "dashboard"), null, [
      "pm.test('status is 200', () => pm.response.to.have.status(200));",
      "const body = pm.response.json();",
      "pm.test('response has stats', () => pm.expect(body.data.stats).to.be.an('object'));",
    ]),
  ],
});

// ---------- variables ----------
const existingVars = new Set(collection.variable.map((v) => v.key));
for (const key of ["period_id", "assignment_id", "assessment_id", "fee_structure_id", "account_id", "payment_id", "score_id", "submission_id"]) {
  if (!existingVars.has(key)) collection.variable.push({ key, value: "" });
}

fs.writeFileSync(file, JSON.stringify(collection, null, 2) + "\n");
let count = 0;
const walk = (items) => items.forEach((i) => (i.request ? count++ : walk(i.item)));
walk(collection.item);
console.log("Postman updated:", count, "requests");
