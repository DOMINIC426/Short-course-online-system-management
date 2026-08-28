import { useEffect, useState } from "react";
import { getInstructors } from "../../api/marketApi.js";

export default function MarketInstructorsPage() {
  const [instructors, setInstructors] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => { getInstructors().then(setInstructors).catch(() => setError("Unable to load instructors.")); }, []);
  return <section className="mx-auto max-w-7xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#07529b]">Teaching team</p><h1 className="mt-2 text-3xl font-extrabold">Instructors</h1>{error && <p className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}<div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><table className="w-full text-left text-sm"><thead className="bg-blue-50 text-xs uppercase tracking-wide"><tr><th className="px-5 py-3">Instructor</th><th className="px-5 py-3">Email</th><th className="px-5 py-3">Status</th></tr></thead><tbody>{instructors.map((instructor) => <tr key={instructor.id} className="border-t border-slate-100"><td className="px-5 py-3 font-bold">{instructor.name}</td><td className="px-5 py-3 text-slate-500">{instructor.email}</td><td className="px-5 py-3"><span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">{instructor.status}</span></td></tr>)}</tbody></table></div></section>;
}