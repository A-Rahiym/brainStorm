/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");

const file = path.join(__dirname, "..", "config", "openapi.json");
const openapi = JSON.parse(fs.readFileSync(file, "utf8"));

const uuid = () => ({ type: "string", format: "uuid" });
const dateTime = () => ({ type: "string", format: "date-time" });
const date = () => ({ type: "string", format: "date" });
const nullable = (schema) => ({ ...schema, type: ["string", "null"] });

const ref = (name) => ({ $ref: `#/components/schemas/${name}` });

const created = () => ({
  id: uuid(),
  createdAt: dateTime(),
  updatedAt: dateTime(),
});

function success(refName) {
  return {
    200: {
      description: "OK",
      content: { "application/json": { schema: ref(refName) } },
    },
  };
}

function createdResponse(refName) {
  return {
    201: {
      description: "Created",
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["data"],
            properties: { data: ref(refName) },
          },
        },
      },
    },
    400: { $ref: "#/components/responses/BadRequest" },
    401: { $ref: "#/components/responses/Unauthorized" },
    403: { $ref: "#/components/responses/Forbidden" },
    404: { $ref: "#/components/responses/NotFound" },
    409: { $ref: "#/components/responses/Conflict" },
  };
}

function okResponse(refName) {
  return {
    200: {
      description: "OK",
      content: {
        "application/json": { schema: ref(refName) },
      },
    },
    401: { $ref: "#/components/responses/Unauthorized" },
    403: { $ref: "#/components/responses/Forbidden" },
    404: { $ref: "#/components/responses/NotFound" },
  };
}

function patchResponse(refName) {
  return {
    200: {
      description: "OK",
      content: {
        "application/json": { schema: ref(refName) },
      },
    },
    400: { $ref: "#/components/responses/BadRequest" },
    401: { $ref: "#/components/responses/Unauthorized" },
    403: { $ref: "#/components/responses/Forbidden" },
    404: { $ref: "#/components/responses/NotFound" },
    409: { $ref: "#/components/responses/Conflict" },
  };
}

function listResponse(refName) {
  return {
    200: {
      description: "OK",
      content: {
        "application/json": { schema: ref(`${refName}ListResponse`) },
      },
    },
    400: { $ref: "#/components/responses/BadRequest" },
    401: { $ref: "#/components/responses/Unauthorized" },
    403: { $ref: "#/components/responses/Forbidden" },
  };
}

function listRequest(params = []) {
  return [
    { $ref: "#/components/parameters/PageParam" },
    { $ref: "#/components/parameters/LimitParam" },
    ...params.map((p) => ({
      name: p.name,
      in: "query",
      required: false,
      schema: p.schema,
      description: p.description,
    })),
  ];
}

function idParams() {
  return [{ $ref: "#/components/parameters/IdParam" }];
}

const tag = (name) => ({ tags: [name], security: [{ sessionCookie: [] }] });

function resourcePaths({ tagName, item, create, update, list, entity, filters, withGet = true, withPatch = true }) {
  const paths = {};
  paths[item] = {};
  if (withGet) {
    paths[item].get = {
      ...tag(tagName),
      summary: `Get ${entity.toLowerCase()}`,
      operationId: `get${entity}`,
      parameters: idParams(),
      responses: okResponse(entity),
    };
  }
  if (withPatch && update) {
    paths[item].patch = {
      ...tag(tagName),
      summary: `Update ${entity.toLowerCase()}`,
      operationId: `update${entity}`,
      parameters: idParams(),
      requestBody: {
        required: true,
        content: { "application/json": { schema: ref(update) } },
      },
      responses: patchResponse(entity),
    };
  }
  return paths;
}

const S = openapi.components.schemas;

// ---------- schemas ----------
S.Assessment = {
  type: "object",
  required: ["id", "teachingAssignmentId", "termId", "name", "type", "maxScore", "date"],
  properties: {
    ...created(),
    teachingAssignmentId: uuid(),
    termId: uuid(),
    name: { type: "string" },
    type: { type: "string", enum: ["QUIZ", "TEST", "CA", "EXAMINATION"] },
    maxScore: { type: "number" },
    date: date(),
    teachingAssignment: ref("AssignmentTeachingAssignment"),
    term: {
      type: "object",
      properties: { id: uuid(), name: { type: "string" } },
    },
    scores: {
      type: "array",
      items: {
        type: "object",
        properties: { id: uuid(), studentId: uuid(), score: { type: "number" }, grade: { type: "object", properties: { id: uuid(), name: { type: "string" } } } },
      },
    },
  },
};
S.AssessmentTeachingAssignment = {
  type: "object",
  properties: {
    id: uuid(),
    teacher: { type: "object", properties: { id: uuid(), firstName: { type: "string" }, lastName: { type: "string" }, staffNumber: { type: "string" } } },
    classSubject: {
      type: "object",
      properties: {
        id: uuid(),
        class: { type: "object", properties: { id: uuid(), name: { type: "string" }, level: { type: "string" } } },
        subject: { type: "object", properties: { id: uuid(), name: { type: "string" }, code: { type: "string" } } },
      },
    },
    academicSession: { type: "object", properties: { id: uuid(), name: { type: "string" } } },
    term: { type: "object", properties: { id: uuid(), name: { type: "string" } } },
  },
};
S.CreateAssessmentRequest = {
  type: "object",
  required: ["teachingAssignmentId", "termId", "name", "type", "maxScore", "date"],
  properties: {
    teachingAssignmentId: uuid(),
    termId: uuid(),
    name: { type: "string", minLength: 1 },
    type: { type: "string", enum: ["QUIZ", "TEST", "CA", "EXAMINATION"] },
    maxScore: { type: "number", minimum: 0 },
    date: date(),
  },
};
S.UpdateAssessmentRequest = {
  type: "object",
  properties: {
    name: { type: "string", minLength: 1 },
    type: { type: "string", enum: ["QUIZ", "TEST", "CA", "EXAMINATION"] },
    maxScore: { type: "number", minimum: 0 },
    date: date(),
  },
};
S.AssessmentListResponse = { type: "object", required: ["data", "meta"], properties: { data: { type: "array", items: ref("Assessment") }, meta: ref("PaginationMeta") } };

S.Score = {
  type: "object",
  required: ["id", "assessmentId", "studentId", "score"],
  properties: {
    ...created(),
    assessmentId: uuid(),
    studentId: uuid(),
    gradeId: nullable(uuid()),
    score: { type: "number" },
    remark: nullable({ type: "string" }),
    assessment: { type: "object", properties: { id: uuid(), name: { type: "string" }, type: { type: "string" }, maxScore: { type: "number" }, date: date(), term: { type: "object", properties: { id: uuid(), name: { type: "string" } } } } },
    student: { type: "object", properties: { id: uuid(), firstName: { type: "string" }, lastName: { type: "string" }, admissionNumber: { type: "string" } } },
    grade: { type: "object", properties: { id: uuid(), name: { type: "string" } } },
  },
};
S.RecordScoresRequest = {
  type: "object",
  required: ["assessmentId", "scores"],
  properties: {
    assessmentId: uuid(),
    scores: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        required: ["studentId", "score"],
        properties: { studentId: uuid(), score: { type: "number", minimum: 0 }, remark: nullable({ type: "string" }) },
      },
    },
  },
};
S.UpdateScoreRequest = { type: "object", properties: { score: { type: "number", minimum: 0 }, remark: nullable({ type: "string" }) } };
S.ScoreListResponse = { type: "object", required: ["data", "meta"], properties: { data: { type: "array", items: ref("Score") }, meta: ref("PaginationMeta") } };

S.Submission = {
  type: "object",
  required: ["id", "assignmentId", "studentId", "submittedAt", "status"],
  properties: {
    ...created(),
    assignmentId: uuid(),
    studentId: uuid(),
    submittedAt: dateTime(),
    status: { type: "string", enum: ["SUBMITTED", "LATE", "GRADED"] },
    content: nullable({ type: "string" }),
    assignment: { type: "object", properties: { id: uuid(), title: { type: "string" }, status: { type: "string", enum: ["OPEN", "CLOSED"] }, dueDate: dateTime() } },
    student: { type: "object", properties: { id: uuid(), firstName: { type: "string" }, lastName: { type: "string" }, admissionNumber: { type: "string" } } },
  },
};
S.SubmitAssignmentRequest = {
  type: "object",
  required: ["assignmentId", "studentId"],
  properties: { assignmentId: uuid(), studentId: uuid(), content: nullable({ type: "string" }) },
};
S.UpdateSubmissionRequest = { type: "object", properties: { content: nullable({ type: "string" }), status: { type: "string", enum: ["SUBMITTED", "LATE", "GRADED"] } } };
S.SubmissionListResponse = { type: "object", required: ["data", "meta"], properties: { data: { type: "array", items: ref("Submission") }, meta: ref("PaginationMeta") } };

S.FeeStructure = {
  type: "object",
  required: ["id", "schoolId", "academicSessionId", "name", "amount"],
  properties: {
    ...created(),
    schoolId: uuid(),
    academicSessionId: uuid(),
    name: { type: "string" },
    amount: { type: "number" },
    description: nullable({ type: "string" }),
    academicSession: { type: "object", properties: { id: uuid(), name: { type: "string" }, status: { type: "string", enum: ["ACTIVE", "CLOSED"] } } },
    studentFeeAccounts: { type: "array", items: { type: "object", properties: { id: uuid(), studentId: uuid(), amountDue: { type: "number" }, status: { type: "string", enum: ["PENDING", "PARTIAL", "PAID"] } } } },
  },
};
S.CreateFeeStructureRequest = {
  type: "object",
  required: ["academicSessionId", "name", "amount"],
  properties: { academicSessionId: uuid(), name: { type: "string", minLength: 1 }, amount: { type: "number", minimum: 0 }, description: nullable({ type: "string" }) },
};
S.UpdateFeeStructureRequest = { type: "object", properties: { name: { type: "string", minLength: 1 }, amount: { type: "number", minimum: 0 }, description: nullable({ type: "string" }) } };
S.FeeStructureListResponse = { type: "object", required: ["data", "meta"], properties: { data: { type: "array", items: ref("FeeStructure") }, meta: ref("PaginationMeta") } };

S.StudentFeeAccount = {
  type: "object",
  required: ["id", "studentId", "feeStructureId", "amountDue", "status"],
  properties: {
    ...created(),
    studentId: uuid(),
    feeStructureId: uuid(),
    amountDue: { type: "number" },
    status: { type: "string", enum: ["PENDING", "PARTIAL", "PAID"] },
    student: { type: "object", properties: { id: uuid(), firstName: { type: "string" }, lastName: { type: "string" }, admissionNumber: { type: "string" } } },
    feeStructure: { type: "object", properties: { id: uuid(), name: { type: "string" }, amount: { type: "number" } } },
    payments: {
      type: "array",
      items: {
        type: "object",
        properties: { id: uuid(), amount: { type: "number" }, paymentDate: date(), paymentMethod: { type: "string", enum: ["CASH", "TRANSFER", "CARD", "ONLINE"] }, reference: { type: "string" }, status: { type: "string", enum: ["PENDING", "CONFIRMED", "FAILED"] } },
      },
    },
  },
};
S.CreateAccountsRequest = {
  type: "object",
  required: ["feeStructureId", "studentIds"],
  properties: { feeStructureId: uuid(), studentIds: { type: "array", minItems: 1, items: uuid() }, amountDue: { type: "number", minimum: 0 } },
};
S.UpdateAccountRequest = { type: "object", properties: { amountDue: { type: "number", minimum: 0 }, status: { type: "string", enum: ["PENDING", "PARTIAL", "PAID"] } } };
S.StudentFeeAccountListResponse = { type: "object", required: ["data", "meta"], properties: { data: { type: "array", items: ref("StudentFeeAccount") }, meta: ref("PaginationMeta") } };

S.Payment = {
  type: "object",
  required: ["id", "studentFeeAccountId", "amount", "paymentMethod", "reference", "status", "recordedBy"],
  properties: {
    ...created(),
    studentFeeAccountId: uuid(),
    amount: { type: "number" },
    paymentDate: date(),
    paymentMethod: { type: "string", enum: ["CASH", "TRANSFER", "CARD", "ONLINE"] },
    reference: { type: "string" },
    status: { type: "string", enum: ["PENDING", "CONFIRMED", "FAILED"] },
    recordedBy: uuid(),
    studentFeeAccount: { type: "object", properties: { id: uuid(), status: { type: "string" }, amountDue: { type: "number" }, student: { type: "object", properties: { id: uuid(), firstName: { type: "string" }, lastName: { type: "string" }, admissionNumber: { type: "string" } } }, feeStructure: { type: "object", properties: { id: uuid(), name: { type: "string" } } } } },
    recorder: { type: "object", properties: { id: uuid(), email: { type: "string" } } },
  },
};
S.RecordPaymentRequest = {
  type: "object",
  required: ["studentFeeAccountId", "amount", "reference"],
  properties: { studentFeeAccountId: uuid(), amount: { type: "number", minimum: 0 }, paymentMethod: { type: "string", enum: ["CASH", "TRANSFER", "CARD", "ONLINE"] }, reference: { type: "string", minLength: 1 }, status: { type: "string", enum: ["PENDING", "CONFIRMED", "FAILED"] } },
};
S.PaymentListResponse = { type: "object", required: ["data", "meta"], properties: { data: { type: "array", items: ref("Payment") }, meta: ref("PaginationMeta") } };

S.DashboardResponse = {
  type: "object",
  properties: {
    stats: { type: "object", properties: { students: { type: "number" }, teachers: { type: "number" }, subjects: { type: "number" }, classes: { type: "number" }, periods: { type: "number" } } },
    assignments: { type: "array", items: { type: "object", properties: { id: uuid(), title: { type: "string" }, subject: { type: "string" }, className: { type: "string" }, dueDate: dateTime(), status: { type: "string", enum: ["OPEN", "CLOSED"] } } } },
    fees: { type: "object", properties: { collected: { type: "number" }, expected: { type: "number" }, defaulters: { type: "number" } } },
    enrollments: { type: "object", properties: { total: { type: "number" }, boys: { type: "number" }, girls: { type: "number" }, byClass: { type: "array", items: { type: "object", properties: { className: { type: "string" }, students: { type: "number" }, color: { type: "string" } } } } } },
    agenda: { type: "array", items: { type: "object", properties: { id: uuid(), time: { type: "string" }, day: { type: "string" }, title: { type: "string" }, tag: { type: "string", enum: ["EVENT", "MEETING"] } } } },
    upcoming: { type: "array", items: { type: "object", properties: { id: uuid(), time: { type: "string" }, day: { type: "string" }, title: { type: "string" }, tag: { type: "string", enum: ["EVENT", "MEETING"] } } } },
    topStudents: { type: "array", items: { type: "object", properties: { id: uuid(), name: { type: "string" }, meta: { type: "string" }, score: { type: "string" }, grade: { type: "string" } } } },
    activities: { type: "array", items: { type: "object", properties: { id: { type: "string" }, kind: { type: "string" }, description: { type: "string" }, createdAt: dateTime() } } },
  },
};

// ---------- paths ----------
const P = openapi.paths;

// Headmasters collection
P["/headmasters"] = {
  post: {
    ...tag("Headmasters"),
    summary: "Create a headmaster",
    operationId: "createHeadmaster",
    requestBody: { required: true, content: { "application/json": { schema: ref("CreateHeadmasterRequest") } } },
    responses: createdResponse("Headmaster"),
  },
  get: {
    ...tag("Headmasters"),
    summary: "List headmasters",
    operationId: "listHeadmasters",
    parameters: listRequest(),
    responses: listResponse("Headmaster"),
  },
};

// Sessions by id
P["/academics/sessions/{id}"] = {
  get: {
    ...tag("Academics"),
    summary: "Get an academic session",
    operationId: "getSession",
    parameters: idParams(),
    responses: okResponse("AcademicSession"),
  },
  patch: {
    ...tag("Academics"),
    summary: "Update an academic session",
    operationId: "updateSession",
    parameters: idParams(),
    requestBody: { required: true, content: { "application/json": { schema: ref("UpdateSessionRequest") } } },
    responses: patchResponse("AcademicSession"),
  },
};

// Term by id
P["/academics/terms/{id}"] = {
  get: {
    ...tag("Academics"),
    summary: "Get a term",
    operationId: "getTerm",
    parameters: idParams(),
    responses: okResponse("Term"),
  },
};

// Assessments
P["/classroom/assessments"] = {
  post: {
    ...tag("Classroom"),
    summary: "Create an assessment",
    operationId: "createAssessment",
    requestBody: { required: true, content: { "application/json": { schema: ref("CreateAssessmentRequest") } } },
    responses: createdResponse("Assessment"),
  },
  get: {
    ...tag("Classroom"),
    summary: "List assessments",
    operationId: "listAssessments",
    parameters: listRequest([
      { name: "teachingAssignmentId", schema: uuid(), description: "Filter by teaching assignment" },
      { name: "termId", schema: uuid(), description: "Filter by term" },
    ]),
    responses: listResponse("Assessment"),
  },
};
P["/classroom/assessments/{id}"] = resourcePaths({ tagName: "Classroom", item: "/classroom/assessments/{id}", entity: "Assessment", update: "UpdateAssessmentRequest" });

// Scores
P["/classroom/scores"] = {
  post: {
    ...tag("Classroom"),
    summary: "Record scores for an assessment",
    operationId: "recordScores",
    requestBody: { required: true, content: { "application/json": { schema: ref("RecordScoresRequest") } } },
    responses: createdResponse("Score"),
  },
  get: {
    ...tag("Classroom"),
    summary: "List scores by assessment",
    operationId: "listScoresByAssessment",
    parameters: [
      { name: "assessmentId", in: "query", required: true, schema: uuid(), description: "Assessment to filter by" },
      { $ref: "#/components/parameters/PageParam" },
      { $ref: "#/components/parameters/LimitParam" },
    ],
    responses: listResponse("Score"),
  },
};
P["/classroom/scores/{id}"] = resourcePaths({ tagName: "Classroom", item: "/classroom/scores/{id}", entity: "Score", update: "UpdateScoreRequest" });

// Submissions
P["/classroom/submissions"] = {
  post: {
    ...tag("Classroom"),
    summary: "Record a submission for an assignment",
    operationId: "submitAssignment",
    requestBody: { required: true, content: { "application/json": { schema: ref("SubmitAssignmentRequest") } } },
    responses: createdResponse("Submission"),
  },
  get: {
    ...tag("Classroom"),
    summary: "List submissions",
    operationId: "listSubmissions",
    parameters: listRequest([
      { name: "assignmentId", schema: uuid(), description: "Filter by assignment" },
      { name: "studentId", schema: uuid(), description: "Filter by student" },
    ]),
    responses: listResponse("Submission"),
  },
};
P["/classroom/submissions/{id}"] = resourcePaths({ tagName: "Classroom", item: "/classroom/submissions/{id}", entity: "Submission", update: "UpdateSubmissionRequest" });

// Fee structures
P["/finance/fee-structures"] = {
  post: {
    ...tag("Finance"),
    summary: "Create a fee structure",
    operationId: "createFeeStructure",
    requestBody: { required: true, content: { "application/json": { schema: ref("CreateFeeStructureRequest") } } },
    responses: createdResponse("FeeStructure"),
  },
  get: {
    ...tag("Finance"),
    summary: "List fee structures",
    operationId: "listFeeStructures",
    parameters: listRequest([{ name: "sessionId", schema: uuid(), description: "Filter by academic session" }]),
    responses: listResponse("FeeStructure"),
  },
};
P["/finance/fee-structures/{id}"] = resourcePaths({ tagName: "Finance", item: "/finance/fee-structures/{id}", entity: "FeeStructure", update: "UpdateFeeStructureRequest" });

// Accounts
P["/finance/accounts"] = {
  post: {
    ...tag("Finance"),
    summary: "Create student fee accounts",
    operationId: "createAccounts",
    requestBody: { required: true, content: { "application/json": { schema: ref("CreateAccountsRequest") } } },
    responses: createdResponse("StudentFeeAccount"),
  },
  get: {
    ...tag("Finance"),
    summary: "List student fee accounts",
    operationId: "listAccounts",
    parameters: listRequest([
      { name: "studentId", schema: uuid(), description: "Filter by student" },
      { name: "feeStructureId", schema: uuid(), description: "Filter by fee structure" },
      { name: "status", schema: { type: "string", enum: ["PENDING", "PARTIAL", "PAID"] }, description: "Filter by account status" },
    ]),
    responses: listResponse("StudentFeeAccount"),
  },
};
P["/finance/accounts/{id}"] = resourcePaths({ tagName: "Finance", item: "/finance/accounts/{id}", entity: "StudentFeeAccount", update: "UpdateAccountRequest" });

// Payments
P["/finance/payments"] = {
  post: {
    ...tag("Finance"),
    summary: "Record a payment",
    operationId: "recordPayment",
    requestBody: { required: true, content: { "application/json": { schema: ref("RecordPaymentRequest") } } },
    responses: createdResponse("Payment"),
  },
  get: {
    ...tag("Finance"),
    summary: "List payments",
    operationId: "listPayments",
    parameters: listRequest([
      { name: "studentId", schema: uuid(), description: "Filter by student" },
      { name: "feeStructureId", schema: uuid(), description: "Filter by fee structure" },
    ]),
    responses: listResponse("Payment"),
  },
};
P["/finance/payments/{id}"] = resourcePaths({ tagName: "Finance", item: "/finance/payments/{id}", entity: "Payment", withPatch: false });

// Dashboard
P["/dashboard"] = {
  get: {
    ...tag("Dashboard"),
    summary: "Get role-based dashboard",
    operationId: "getDashboard",
    responses: okResponse("DashboardResponse"),
  },
};

// ---------- tags (dedupe, add Finance + Dashboard) ----------
const seen = new Set();
const tags = [];
for (const t of openapi.tags) {
  if (!seen.has(t.name)) {
    seen.add(t.name);
    tags.push(t);
  }
}
if (!seen.has("Finance")) tags.push({ name: "Finance", description: "Fee structures, student fee accounts, and payments" });
if (!seen.has("Dashboard")) tags.push({ name: "Dashboard", description: "Aggregated school and teacher dashboards" });
openapi.tags = tags;

openapi.info.version = "0.6.0";
openapi.info.title = "Brainstorm School Management API";

fs.writeFileSync(file, JSON.stringify(openapi, null, 2) + "\n");
console.log("OpenAPI updated:", Object.keys(P).length, "paths,", Object.keys(S).length, "schemas, v" + openapi.info.version);
