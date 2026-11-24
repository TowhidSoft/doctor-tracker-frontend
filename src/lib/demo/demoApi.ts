/**
 * In-browser stand-in for the Express API, used when NEXT_PUBLIC_DEMO=true.
 *
 * It answers the same URLs and returns the same response shapes as the real backend
 * (filters, sorting, pagination, analytics, per-field validation errors), keeps its data in
 * localStorage so edits survive a reload, and is loaded lazily so normal builds never ship it.
 */
import dayjs from "dayjs";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { ApiMeta, Doctor } from "@/redux/service/admin/doctorApi";
import type { Patient } from "@/redux/service/admin/patientApi";
import type { AnalyticsOverview } from "@/redux/service/admin/analyticsApi";
import { GENDERS, PHONE_MESSAGE, PHONE_PATTERN, type Gender } from "@/lib/validation";
import { DEMO_EMAIL, DEMO_PASSWORD } from "./config";

type StoredDoctor = Omit<Doctor, "patientCount">;
type StoredPatient = Omit<Patient, "doctor">;
interface DemoDb {
  doctors: StoredDoctor[];
  patients: StoredPatient[];
}
interface FieldError {
  path: string;
  message: string;
}

/* ───────────── seed data (same shape and spread as the backend seed) ───────────── */

const DAY = 24 * 60 * 60 * 1000;

const DOCTORS: [string, string, string][] = [
  ["Dr. Ayesha Rahman", "Cardiology", "Square Hospital"],
  ["Dr. Imran Hossain", "Cardiology", "United Hospital"],
  ["Dr. Nusrat Jahan", "Neurology", "Evercare Hospital"],
  ["Dr. Tanvir Ahmed", "Orthopedics", "Popular Medical College Hospital"],
  ["Dr. Farzana Akter", "Pediatrics", "Dhaka Shishu Hospital"],
  ["Dr. Sabbir Khan", "Dermatology", "Labaid Hospital"],
  ["Dr. Mehnaz Chowdhury", "Gynecology", "Square Hospital"],
  ["Dr. Rafiq Islam", "General Medicine", "Ibn Sina Hospital"],
  ["Dr. Sumaiya Karim", "Endocrinology", "BIRDEM General Hospital"],
  ["Dr. Kamrul Hasan", "Gastroenterology", "United Hospital"],
  ["Dr. Tasnim Sultana", "Psychiatry", "Evercare Hospital"],
  ["Dr. Arif Mahmud", "Urology", "Labaid Hospital"],
  ["Dr. Lamia Haque", "Ophthalmology", "Ispahani Islamia Eye Institute"],
  ["Dr. Zahid Siddique", "ENT", "Ibn Sina Hospital"],
];
const CONDITIONS = [
  "Hypertension", "Type 2 Diabetes", "Migraine", "Asthma", "Back Pain", "Anemia",
  "Thyroid Disorder", "Allergic Rhinitis", "Arthritis", "Gastritis", "Anxiety", "Skin Allergy",
];
const FIRST = ["Rahim", "Karim", "Sadia", "Nabila", "Tariq", "Mitu", "Shuvo", "Rima", "Jamal", "Farhan", "Sumi", "Anika", "Hasan", "Mim", "Rony", "Tania", "Sohel", "Lima", "Faisal", "Joya"];
const LAST = ["Uddin", "Begum", "Mia", "Khatun", "Roy", "Das", "Sarker", "Mondal", "Talukder", "Sheikh", "Biswas", "Paul"];
const GENDER_POOL: Gender[] = ["Male", "Female", "Female", "Male", "Others"];

let idCounter = 0;
const newId = () => {
  idCounter += 1;
  return (Date.now().toString(16) + idCounter.toString(16).padStart(6, "0") + "0".repeat(24)).slice(0, 24);
};

function seed(): DemoDb {
  let state = 20261123; // deterministic, so every reset gives the same demo set
  const rand = () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
  const pick = <T,>(items: readonly T[]): T => items[Math.floor(rand() * items.length)];
  const now = Date.now();
  const when = (days: number) => new Date(now - Math.floor(rand() * days) * DAY - Math.floor(rand() * DAY)).toISOString();

  const doctors: StoredDoctor[] = DOCTORS.map(([name, specialization, hospital], index) => {
    const createdAt = when(85);
    return {
      id: newId(),
      name,
      specialization,
      hospital,
      phone: `+88017${String(10000000 + index * 7919).slice(0, 8)}`,
      email: `${name.toLowerCase().replace(/^dr\.\s*/, "").replace(/[^a-z]+/g, ".")}@doctortracker.demo`,
      createdAt,
      updatedAt: createdAt,
    };
  });

  const patients: StoredPatient[] = Array.from({ length: 150 }, (_, i) => {
    const first = pick(FIRST);
    const last = pick(LAST);
    const createdAt = when(90);
    return {
      id: newId(),
      name: `${first} ${last}`,
      age: 3 + Math.floor(rand() * 82),
      gender: pick(GENDER_POOL),
      phone: `+88017${String(10000000 + Math.floor(rand() * 89999999))}`,
      email: i % 3 === 0 ? null : `${first}.${last}${i}@mail.demo`.toLowerCase(),
      condition: pick(CONDITIONS),
      notes: i % 4 === 0 ? "Follow-up visit scheduled." : null,
      doctorId: pick(doctors).id,
      createdAt,
      updatedAt: createdAt,
    };
  });

  return { doctors, patients };
}

/* ───────────── storage ───────────── */

const STORAGE_KEY = "doctor-tracker-demo-v1";
let db: DemoDb | null = null;

const save = () => {
  try {
    if (typeof window !== "undefined" && db) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    /* private mode / quota: the demo still works, it just will not survive a reload */
  }
};

const load = (): DemoDb => {
  if (db) return db;
  try {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (raw) {
      const parsed = JSON.parse(raw) as DemoDb;
      if (Array.isArray(parsed.doctors) && Array.isArray(parsed.patients)) {
        db = parsed;
        return db;
      }
    }
  } catch {
    /* fall through to a fresh seed */
  }
  db = seed();
  save();
  return db;
};

export const resetDemoData = () => {
  db = seed();
  save();
};

/* ───────────── response helpers ───────────── */

const ok = <T,>(data: T, message: string, meta?: ApiMeta) => ({
  data: { status: true, message, ...(meta ? { meta } : {}), data },
});

const fail = (status: number, message: string, errors: FieldError[] = []) => ({
  error: { status, data: { status: false, message, errors } } as FetchBaseQueryError,
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const base64Url = (value: object) =>
  btoa(JSON.stringify(value)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

/** Looks like a JWT (the login page and middleware only read the payload); it is NOT a real credential. */
const fakeToken = (days: number) => {
  const iat = Math.floor(Date.now() / 1000);
  return `${base64Url({ alg: "none", typ: "JWT" })}.${base64Url({ id: "demo-admin", email: DEMO_EMAIL, role: "ADMIN", iat, exp: iat + days * 86400 })}.demo`;
};

/* ───────────── validation (mirrors the backend Zod rules) ───────────── */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const text = (value: unknown, label: string, max: number, errors: FieldError[], path: string) => {
  const v = typeof value === "string" ? value.trim() : "";
  if (!v) errors.push({ path, message: `${label} is required` });
  else if (v.length > max) errors.push({ path, message: `${label} must be at most ${max} characters` });
  return v;
};

function validateDoctor(body: Record<string, unknown>, partial: boolean): { errors: FieldError[]; value: Partial<StoredDoctor> } {
  const errors: FieldError[] = [];
  const value: Partial<StoredDoctor> = {};
  const has = (key: string) => !partial || body[key] !== undefined;
  if (has("name")) value.name = text(body.name, "Name", 100, errors, "name");
  if (has("specialization")) value.specialization = text(body.specialization, "Specialization", 80, errors, "specialization");
  if (has("hospital")) value.hospital = text(body.hospital, "Hospital", 120, errors, "hospital");
  if (has("phone")) {
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    if (!PHONE_PATTERN.test(phone)) errors.push({ path: "phone", message: PHONE_MESSAGE });
    value.phone = phone;
  }
  if (has("email")) {
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!EMAIL.test(email)) errors.push({ path: "email", message: "Enter a valid email address" });
    value.email = email;
  }
  if (partial && Object.keys(body).length === 0) errors.push({ path: "", message: "Send at least one field to update" });
  return { errors, value };
}

function validatePatient(body: Record<string, unknown>, partial: boolean): { errors: FieldError[]; value: Partial<StoredPatient> } {
  const errors: FieldError[] = [];
  const value: Partial<StoredPatient> = {};
  const has = (key: string) => !partial || body[key] !== undefined;
  if (has("name")) value.name = text(body.name, "Name", 100, errors, "name");
  if (has("age")) {
    const age = body.age;
    if (typeof age !== "number" || Number.isNaN(age)) errors.push({ path: "age", message: "Age is required" });
    else if (!Number.isInteger(age)) errors.push({ path: "age", message: "Age must be a whole number" });
    else if (age < 0) errors.push({ path: "age", message: "Age cannot be negative" });
    else if (age > 120) errors.push({ path: "age", message: "Age must be 120 or less" });
    else value.age = age;
  }
  if (has("gender")) {
    if (!GENDERS.includes(body.gender as Gender)) errors.push({ path: "gender", message: "Choose a gender" });
    else value.gender = body.gender as Gender;
  }
  if (has("phone")) {
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    if (!PHONE_PATTERN.test(phone)) errors.push({ path: "phone", message: PHONE_MESSAGE });
    value.phone = phone;
  }
  if (body.email !== undefined) {
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (email && !EMAIL.test(email)) errors.push({ path: "email", message: "Enter a valid email address" });
    value.email = email || null;
  }
  if (has("condition")) value.condition = text(body.condition, "Condition", 120, errors, "condition");
  if (body.notes !== undefined) {
    const notes = typeof body.notes === "string" ? body.notes.trim() : "";
    if (notes.length > 500) errors.push({ path: "notes", message: "Notes must be at most 500 characters" });
    value.notes = notes || null;
  }
  if (partial && Object.keys(body).length === 0) errors.push({ path: "", message: "Send at least one field to update" });
  return { errors, value };
}

/* ───────────── list helpers ───────────── */

type Params = Record<string, unknown>;
const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);
const int = (v: unknown, fallback: number, min: number, max: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.trunc(n))) : fallback;
};

const inRange = (iso: string, from?: string, to?: string) => {
  const t = dayjs(iso);
  if (from && t.isBefore(dayjs(from).startOf("day"))) return false;
  if (to && t.isAfter(dayjs(to).endOf("day"))) return false;
  return true;
};

const includes = (haystack: (string | null)[], needle: string) =>
  haystack.some((h) => (h ?? "").toLowerCase().includes(needle.toLowerCase()));

function sortBy<T extends { id: string }>(items: T[], key: keyof T, order: "asc" | "desc") {
  const dir = order === "asc" ? 1 : -1;
  return [...items].sort((a, b) => {
    const x = a[key];
    const y = b[key];
    const cmp = typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y));
    return (cmp || a.id.localeCompare(b.id)) * dir;
  });
}

function paginate<T>(items: T[], params: Params) {
  const limit = int(params.limit, 10, 1, 100);
  const page = int(params.page, 1, 1, 1_000_000);
  const total = items.length;
  const meta: ApiMeta = { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
  return { rows: items.slice((page - 1) * limit, page * limit), meta };
}

const withCount = (d: StoredDoctor): Doctor => ({ ...d, patientCount: load().patients.filter((p) => p.doctorId === d.id).length });
const withDoctor = (p: StoredPatient): Patient => {
  const d = load().doctors.find((x) => x.id === p.doctorId);
  return { ...p, doctor: { id: p.doctorId, name: d?.name ?? "Unknown", specialization: d?.specialization ?? "" } };
};

const topCounts = (values: string[], limit: number) => {
  const map = new Map<string, number>();
  values.forEach((v) => map.set(v, (map.get(v) ?? 0) + 1));
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
};

function listPatients(params: Params, pinnedDoctorId?: string) {
  const { patients } = load();
  const search = str(params.search);
  const condition = str(params.condition);
  const gender = str(params.gender);
  const doctorId = pinnedDoctorId ?? str(params.doctorId);
  const from = str(params.dateFrom);
  const to = str(params.dateTo);

  const filtered = patients.filter(
    (p) =>
      (!doctorId || p.doctorId === doctorId) &&
      (!condition || p.condition === condition) &&
      (!gender || p.gender === gender) &&
      inRange(p.createdAt, from, to) &&
      (!search || includes([p.name, p.condition, p.phone, p.email], search)),
  );
  const key = (["createdAt", "name", "age", "condition"] as const).find((k) => k === params.sortBy) ?? "createdAt";
  const order = params.sortOrder === "asc" ? "asc" : "desc";
  const { rows, meta } = paginate(sortBy(filtered, key, order), params);
  return ok(rows.map(withDoctor), "Patients retrieved successfully", meta);
}

function analytics(days: number) {
  const { doctors, patients } = load();
  const keys = Array.from({ length: days }, (_, i) => dayjs().subtract(days - 1 - i, "day").format("YYYY-MM-DD"));
  const first = dayjs(keys[0]).startOf("day");
  const perDay = (items: { createdAt: string }[]) => {
    const map = new Map<string, number>();
    items.forEach((i) => map.set(dayjs(i.createdAt).format("YYYY-MM-DD"), (map.get(dayjs(i.createdAt).format("YYYY-MM-DD")) ?? 0) + 1));
    return map;
  };
  const pDays = perDay(patients);
  const dDays = perDay(doctors);

  const byDoctor = topCounts(patients.map((p) => p.doctorId), 10).map(({ name: doctorId, count }) => {
    const d = doctors.find((x) => x.id === doctorId);
    return { doctorId, name: d?.name ?? "Unknown", specialization: d?.specialization ?? "", count };
  });

  const data: AnalyticsOverview = {
    totals: {
      doctors: doctors.length,
      patients: patients.length,
      avgPatientsPerDoctor: doctors.length ? Math.round((patients.length / doctors.length) * 10) / 10 : 0,
      newPatients: patients.filter((p) => !dayjs(p.createdAt).isBefore(first)).length,
      newDoctors: doctors.filter((d) => !dayjs(d.createdAt).isBefore(first)).length,
    },
    patientsPerDoctor: byDoctor,
    timeline: keys.map((date) => ({ date, patients: pDays.get(date) ?? 0, doctors: dDays.get(date) ?? 0 })),
    conditions: topCounts(patients.map((p) => p.condition), 8),
    gender: topCounts(patients.map((p) => p.gender), 3),
    specializations: topCounts(doctors.map((d) => d.specialization), 8),
    recentPatients: sortBy(patients, "createdAt", "desc").slice(0, 6).map(withDoctor),
  };
  return ok(data, "Analytics retrieved successfully");
}

/* ───────────── router ───────────── */

function route(method: string, segments: string[], params: Params, body: Record<string, unknown>) {
  const data = load();
  const [root, second, third, fourth] = segments;
  const findDoctor = (id: string) => data.doctors.find((d) => d.id === id);

  if (root === "auth" && second === "login" && method === "POST") {
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (email !== DEMO_EMAIL || body.password !== DEMO_PASSWORD) return fail(400, "Incorrect email or password");
    return ok(
      { id: "demo-admin", name: "Demo Admin", email: DEMO_EMAIL, role: "ADMIN", accessToken: fakeToken(7), refreshToken: fakeToken(30) },
      "Login successful",
    );
  }
  if (root === "auth" && second === "refreshToken" && method === "POST") {
    return ok({ accessToken: fakeToken(7), refreshToken: fakeToken(30) }, "Token refreshed");
  }
  if (root === "user" && method === "GET") {
    return ok({ id: "demo-admin", name: "Demo Admin", email: DEMO_EMAIL, phone: null, role: "ADMIN", createdAt: new Date().toISOString() }, "User profile found");
  }

  if (root === "analytics" && second === "overview" && method === "GET") {
    return analytics([7, 30, 90].includes(Number(params.days)) ? Number(params.days) : 30);
  }

  if (root === "doctors") {
    if (!second) {
      if (method === "GET") {
        const search = str(params.search);
        const specialization = str(params.specialization);
        const hospital = str(params.hospital);
        const filtered = data.doctors.filter(
          (d) =>
            (!specialization || d.specialization === specialization) &&
            (!hospital || d.hospital === hospital) &&
            inRange(d.createdAt, str(params.dateFrom), str(params.dateTo)) &&
            (!search || includes([d.name, d.hospital, d.specialization, d.phone, d.email], search)),
        );
        // Sort the shaped rows so "sort by patients" style keys stay possible later.
        const key = (["createdAt", "name", "specialization", "hospital"] as const).find((k) => k === params.sortBy) ?? "createdAt";
        const { rows, meta } = paginate(sortBy(filtered, key, params.sortOrder === "asc" ? "asc" : "desc"), params);
        return ok(rows.map(withCount), "Doctors retrieved successfully", meta);
      }
      if (method === "POST") {
        const { errors, value } = validateDoctor(body, false);
        if (!errors.length && data.doctors.some((d) => d.email === value.email)) {
          errors.push({ path: "email", message: "A doctor with this email already exists" });
        }
        if (errors.length) return fail(400, errors[0].message, errors);
        const now = new Date().toISOString();
        const doctor = { ...(value as Omit<StoredDoctor, "id" | "createdAt" | "updatedAt">), id: newId(), createdAt: now, updatedAt: now };
        data.doctors.push(doctor);
        save();
        return ok(withCount(doctor), "Doctor created successfully");
      }
    }

    if (second === "filter-options" && method === "GET") {
      const uniq = (values: string[]) => [...new Set(values)].sort((a, b) => a.localeCompare(b));
      return ok(
        { specializations: uniq(data.doctors.map((d) => d.specialization)), hospitals: uniq(data.doctors.map((d) => d.hospital)) },
        "Filter options retrieved successfully",
      );
    }

    if (second) {
      const doctor = findDoctor(second);
      if (!doctor) return fail(404, "Doctor not found");

      if (!third && method === "GET") return ok(withCount(doctor), "Doctor retrieved successfully");
      if (!third && method === "PATCH") {
        const { errors, value } = validateDoctor(body, true);
        if (!errors.length && value.email && data.doctors.some((d) => d.email === value.email && d.id !== doctor.id)) {
          errors.push({ path: "email", message: "A doctor with this email already exists" });
        }
        if (errors.length) return fail(400, errors[0].message, errors);
        Object.assign(doctor, value, { updatedAt: new Date().toISOString() });
        save();
        return ok(withCount(doctor), "Doctor updated successfully");
      }

      if (third === "patients" && !fourth) {
        if (method === "GET") return listPatients(params, doctor.id);
        if (method === "POST") {
          const { errors, value } = validatePatient(body, false);
          if (errors.length) return fail(400, errors[0].message, errors);
          const now = new Date().toISOString();
          const patient = {
            ...(value as Omit<StoredPatient, "id" | "doctorId" | "createdAt" | "updatedAt">),
            email: value.email ?? null,
            notes: value.notes ?? null,
            id: newId(),
            doctorId: doctor.id,
            createdAt: now,
            updatedAt: now,
          } as StoredPatient;
          data.patients.push(patient);
          save();
          return ok(withDoctor(patient), "Patient added successfully");
        }
      }
      if (third === "patients" && fourth && method === "DELETE") {
        const index = data.patients.findIndex((p) => p.id === fourth && p.doctorId === doctor.id);
        if (index === -1) return fail(404, "Patient not found");
        data.patients.splice(index, 1);
        save();
        return ok({ id: fourth }, "Patient deleted successfully");
      }
    }
  }

  if (root === "patients") {
    if (!second && method === "GET") return listPatients(params);
    if (second === "filter-options" && method === "GET") {
      const conditions = [...new Set(data.patients.map((p) => p.condition))].sort((a, b) => a.localeCompare(b));
      const doctors = [...data.doctors].sort((a, b) => a.name.localeCompare(b.name)).map(({ id, name }) => ({ id, name }));
      return ok({ conditions, doctors }, "Filter options retrieved successfully");
    }
    if (second && method === "PATCH") {
      const patient = data.patients.find((p) => p.id === second);
      if (!patient) return fail(404, "Patient not found");
      const { errors, value } = validatePatient(body, true);
      const doctorId = str(body.doctorId);
      if (doctorId && !findDoctor(doctorId)) errors.push({ path: "doctorId", message: "Doctor not found" });
      if (errors.length) return fail(400, errors[0].message, errors);
      Object.assign(patient, value, doctorId ? { doctorId } : {}, { updatedAt: new Date().toISOString() });
      save();
      return ok(withDoctor(patient), "Patient updated successfully");
    }
    if (second && method === "DELETE") {
      const index = data.patients.findIndex((p) => p.id === second);
      if (index === -1) return fail(404, "Patient not found");
      data.patients.splice(index, 1);
      save();
      return ok({ id: second }, "Patient deleted successfully");
    }
  }

  return fail(404, "Incorrect API");
}

/** Drop-in replacement for the real base query. */
export const handleDemoRequest: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args) => {
  await sleep(150 + Math.random() * 200); // feel like a network call so loading states are visible
  const request: FetchArgs = typeof args === "string" ? { url: args } : args;
  const segments = request.url.split("?")[0].replace(/^\/+|\/+$/g, "").split("/");
  try {
    return route((request.method ?? "GET").toUpperCase(), segments, (request.params ?? {}) as Params, (request.body ?? {}) as Record<string, unknown>);
  } catch (error) {
    console.error("[demo api]", error);
    return fail(500, "Something went wrong in the demo API");
  }
};
