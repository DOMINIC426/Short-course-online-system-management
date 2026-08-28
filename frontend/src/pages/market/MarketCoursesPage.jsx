import { useEffect, useState } from "react";
import { Edit3, Trash2, Plus } from "lucide-react";
import { createCourse, deleteCourse, getCourses, setCourseStatus, updateCourse } from "../../api/marketApi.js";

const initialForm = { courseCode: "", title: "", description: "", duration: "", startDate: "", endDate: "", regOpenDate: "", regCloseDate: "", courseFee: "", maxStudents: "", minStudents: "" };

export default function MarketCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingCourse, setEditingCourse] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [dateError, setDateError] = useState("");
  const [studentError, setStudentError] = useState("");

  const today = new Date().toISOString().split("T")[0];

  async function loadCourses() {
    setCourses(await getCourses());
  }

  useEffect(() => {
    loadCourses().catch(() => setMessage("Unable to load courses."));
  }, []);

  function openCreateForm() {
    setEditingCourse(null);
    setForm(initialForm);
    setDateError("");
    setStudentError("");
    setMessage("");
    setShowForm(true);
  }

  function openEditForm(course) {
    setEditingCourse(course);
    setForm({
      courseCode: course.courseCode || "",
      title: course.title || "",
      description: course.description || "",
      duration: course.duration || "",
      startDate: course.startDate || "",
      endDate: course.endDate || "",
      regOpenDate: course.regOpenDate || "",
      regCloseDate: course.regCloseDate || "",
      courseFee: course.courseFee || "",
      maxStudents: course.maxStudents || "",
      minStudents: course.minStudents || "",
    });
    setDateError("");
    setStudentError("");
    setMessage("");
    setShowForm(true);
  }

  function updateField(event) {
    const nextForm = { ...form, [event.target.name]: event.target.value };
    setForm(nextForm);

    if (nextForm.maxStudents && nextForm.minStudents > nextForm.maxStudents) {
      setStudentError("Minimum students cannot be greater than maximum students.");
    } else {
      setStudentError("");
    }

    const dateFields = ["startDate", "endDate", "regOpenDate", "regCloseDate"];
    if (editingCourse && !dateFields.includes(event.target.name)) {
      setDateError("");
    } else if (event.target.name === "startDate" && event.target.value < today) {
      setDateError("Start date cannot be in the past.");
    } else if (nextForm.endDate && nextForm.startDate && nextForm.endDate < nextForm.startDate) {
      setDateError("End date cannot be before the start date.");
    } else if (nextForm.regOpenDate && nextForm.regOpenDate > nextForm.startDate) {
      setDateError("Registration open date cannot be after the course start date.");
    } else if (nextForm.regCloseDate && nextForm.regCloseDate > nextForm.endDate) {
      setDateError("Registration close date cannot be after the course end date.");
    } else if (nextForm.regOpenDate && nextForm.regCloseDate && nextForm.regCloseDate <= nextForm.regOpenDate) {
      setDateError("Registration close date must be after the registration open date.");
    } else if (nextForm.regCloseDate && nextForm.startDate && nextForm.regCloseDate === nextForm.startDate) {
      setDateError("Registration close date cannot be the same as the course start date.");
    } else {
      setDateError("");
    }
  }

  async function submit(event) {
    event.preventDefault();
    const dateFields = ["startDate", "endDate", "regOpenDate", "regCloseDate"];
    const datesChanged = !editingCourse || dateFields.some((field) => form[field] !== (editingCourse[field] || ""));
    if (datesChanged) {
      if (form.startDate < today) return setDateError("Start date cannot be in the past.");
      if (form.endDate < form.startDate) return setDateError("End date cannot be before the start date.");
      if (form.regOpenDate > form.startDate) return setDateError("Registration open date cannot be after the course start date.");
      if (form.regCloseDate > form.endDate) return setDateError("Registration close date cannot be after the course end date.");
      if (form.regCloseDate <= form.regOpenDate) return setDateError("Registration close date must be after the registration open date.");
      if (form.regCloseDate === form.startDate) return setDateError("Registration close date cannot be the same as the course start date.");
    }
    if (Number(form.minStudents) > Number(form.maxStudents)) return setStudentError("Minimum students cannot be greater than maximum students.");

    const fullPayload = {
      ...form,
      courseFee: Number(form.courseFee),
      maxStudents: Number(form.maxStudents),
      minStudents: Number(form.minStudents),
    };
    const payload = editingCourse
      ? Object.fromEntries(Object.entries(fullPayload).filter(([field, value]) => String(value) !== String(editingCourse[field] ?? "")))
      : fullPayload;

    try {
      if (editingCourse) {
        await updateCourse(editingCourse.id, payload);
        setMessage("Course updated successfully.");
      } else {
        await createCourse(payload);
        setMessage("Course created successfully.");
      }
      setForm(initialForm);
      setEditingCourse(null);
      setShowForm(false);
      await loadCourses();
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to save course.");
    }
  }

  async function remove(id) {
    if (!window.confirm("Delete this course?")) return;
    try {
      await deleteCourse(id);
      setMessage("Course deleted successfully.");
      await loadCourses();
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to delete course.");
    }
  }

  async function changeVisibility(course, status) {
    try {
      if (status === "PUBLISHED") {
        await setCourseStatus(course.id, true);
      } else {
        await updateCourse(course.id, { status: "DRAFT" });
      }
      setMessage(`Course is now ${status === "PUBLISHED" ? "public" : "draft"}.`);
      await loadCourses();
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to update course visibility.");
    }
  }

  const fields = [
    ["courseCode", "Course code"],
    ["title", "Title"],
    ["duration", "Duration"],
    ["startDate", "Start date", "date", today],
    ["endDate", "End date", "date", form.startDate || today],
    ["regOpenDate", "Registration opens", "date", today, form.startDate || undefined],
    ["regCloseDate", "Registration closes", "date", form.regOpenDate || today, form.endDate || undefined],
    ["courseFee", "Course fee", "number"],
    ["maxStudents", "Maximum students", "number", 1],
    ["minStudents", "Minimum students", "number", 1, form.maxStudents || undefined],
  ];

  return (
    <section className="mx-auto max-w-7xl">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#07529b]">Catalogue</p>
          <h1 className="mt-2 text-3xl font-extrabold">Short Courses</h1>
          <p className="mt-2 text-sm text-slate-500">Create, edit, publish, and maintain the public course catalogue.</p>
        </div>
        <button onClick={openCreateForm} className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-bold text-white">
          <Plus className="h-4 w-4" /> Add new course
        </button>
      </div>
      {message && <p className="mt-5 rounded-lg bg-blue-50 p-3 text-sm font-semibold text-[#07529b]">{message}</p>}
      {showForm && <form onSubmit={submit} className="mt-6 grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-3">
        <div className="sm:col-span-2 lg:col-span-3">
          <h2 className="text-lg font-extrabold">{editingCourse ? "Edit course" : "Create course"}</h2>
        </div>
        {fields.map(([name, label, type = "text", min, max]) => (
          <label key={name} className="text-sm font-semibold text-slate-700">
            {label}
            <input required name={name} type={type} min={min} max={max} value={form[name]} onChange={updateField} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal outline-none focus:border-[#07529b]" />
          </label>
        ))}
        <label className="text-sm font-semibold text-slate-700 sm:col-span-2 lg:col-span-3">Description
          <textarea required name="description" value={form.description} onChange={updateField} className="mt-1 min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal outline-none focus:border-[#07529b]" />
        </label>
        {dateError && <p className="text-sm font-semibold text-red-600 sm:col-span-2 lg:col-span-3">{dateError}</p>}
        {studentError && <p className="text-sm font-semibold text-red-600 sm:col-span-2 lg:col-span-3">{studentError}</p>}
        <div className="flex gap-3 sm:col-span-2 lg:col-span-3">
          <button type="submit" className="rounded-lg bg-[#07529b] px-4 py-2.5 text-sm font-bold text-white">{editingCourse ? "Save changes" : "Create course"}</button>
          <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700">Cancel</button>
        </div>
      </form>}
      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-195 text-left text-sm">
            <thead className="bg-blue-50 text-xs uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-5 py-3">Code</th>
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Duration</th>
                <th className="px-5 py-3">Fee</th>
                <th className="px-5 py-3">Capacity</th>
                <th className="px-5 py-3">Visibility</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id} className="border-t border-slate-100">
                  <td className="px-5 py-3 font-bold text-[#07529b]">{course.courseCode}</td>
                  <td className="px-5 py-3 font-semibold">{course.title}</td>
                  <td className="px-5 py-3 text-slate-500">{course.categoryName || "Uncategorised"}</td>
                  <td className="px-5 py-3">{course.duration}</td>
                  <td className="px-5 py-3">TZS {Number(course.courseFee).toLocaleString()}</td>
                  <td className="px-5 py-3">{course.maxStudents}</td>
                  <td className="px-5 py-3">
                    <select value={course.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT"} onChange={(event) => changeVisibility(course, event.target.value)} className="rounded-md border border-slate-300 px-2 py-1 text-xs font-bold text-slate-700">
                      <option value="PUBLISHED">Public</option>
                      <option value="DRAFT">Draft</option>
                    </select>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <button title="Edit course" onClick={() => openEditForm(course)} className="rounded p-1 text-[#07529b] hover:bg-blue-50">
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button title="Delete course" onClick={() => remove(course.id)} className="rounded p-1 text-red-600 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}