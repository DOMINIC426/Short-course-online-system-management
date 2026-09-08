import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";

export default function MarketSettingsPage() {
  const { user } = useAuth();
  const [open, setOpen] = useState("profile");
  const [profileName, setProfileName] = useState(`${user?.firstName || "M."} ${user?.lastName || "Officer"}`);
  const [message, setMessage] = useState("");

  function save(event) {
    event.preventDefault();
    setMessage("Settings saved successfully.");
  }

  return <section className="mx-auto max-w-3xl"><div className="flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#07529b]">Workspace</p><h1 className="mt-2 text-3xl font-extrabold">Platform Settings</h1></div><button onClick={() => setMessage("Settings reset.")} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold text-slate-600">Reset</button></div>{message && <p className="mt-5 rounded-lg bg-blue-50 p-3 text-sm font-semibold text-[#07529b]">{message}</p>}<div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><button onClick={() => setOpen(open === "profile" ? "" : "profile")} className="flex w-full justify-between border-b border-slate-200 px-5 py-4 text-left font-extrabold">User Profile<span>{open === "profile" ? "−" : "+"}</span></button>{open === "profile" && <form onSubmit={save} className="grid gap-4 p-5"><label className="text-sm font-semibold">Profile name<input value={profileName} onChange={(event) => setProfileName(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" /></label><label className="text-sm font-semibold">Email<input value={user?.email || ""} readOnly className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-normal text-slate-500" /></label><button className="w-fit rounded-lg bg-[#07529b] px-4 py-2.5 text-sm font-bold text-white">Save changes</button></form>}</div><div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><button onClick={() => setOpen(open === "security" ? "" : "security")} className="flex w-full justify-between px-5 py-4 text-left font-extrabold">Security<span>{open === "security" ? "−" : "+"}</span></button>{open === "security" && <form onSubmit={save} className="grid gap-4 border-t border-slate-200 p-5"><label className="text-sm font-semibold">Current password<input required type="password" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" /></label><label className="text-sm font-semibold">New password<input required minLength="8" type="password" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" /></label><label className="text-sm font-semibold">Confirm password<input required minLength="8" type="password" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" /></label><button className="w-fit rounded-lg bg-[#07529b] px-4 py-2.5 text-sm font-bold text-white">Update password</button></form>}</div></section>;
}
