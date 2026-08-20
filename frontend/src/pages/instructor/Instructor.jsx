import { Link } from "react-router-dom";
import {
	ArrowRight,
	BookOpen,
	CalendarDays,
	CheckCircle2,
	ClipboardCheck,
	Clock3,
	FileCheck2,
	Users,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

const STATS = [
	{ label: "Active courses", value: "4", detail: "2 starting this month", icon: BookOpen, tone: "blue" },
	{ label: "Enrolled students", value: "128", detail: "Across all intakes", icon: Users, tone: "teal" },
	{ label: "Pending submissions", value: "17", detail: "Need your review", icon: ClipboardCheck, tone: "orange" },
	{ label: "Average attendance", value: "86%", detail: "+4% from last month", icon: CheckCircle2, tone: "green" },
];

const SCHEDULE = [
	{ time: "09:00 - 11:00", title: "Data Analysis for Evidence-Based Decision Making", group: "September 2026 intake", room: "Room 204" },
	{ time: "14:00 - 15:30", title: "Research Methods in Public Administration", group: "Weekend intake", room: "Online class" },
];

const COURSES = [
	{ name: "Data Analysis for Evidence-Based Decision Making", intake: "September 2026 intake", students: 42, progress: 68, status: "In progress" },
	{ name: "Project Planning and Management", intake: "August 2026 intake", students: 36, progress: 84, status: "In progress" },
	{ name: "Research Methods in Public Administration", intake: "Weekend intake", students: 50, progress: 35, status: "In progress" },
];

const toneClasses = {
	blue: "bg-blue-50 text-blue-700",
	teal: "bg-teal-50 text-teal-700",
	orange: "bg-orange-50 text-orange-700",
	green: "bg-emerald-50 text-emerald-700",
};

export default function Instructor() {
	const { user } = useAuth();
	const displayName = user?.firstName || user?.username || "Instructor";

	return (
		<div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
			<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
				<div>
					<p className="text-sm font-semibold uppercase tracking-wide text-udom-primary">Welcome Instructor </p>
					<h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">Greetings, {displayName}</h1>
					<p className="mt-2 text-sm text-slate-600">Here is what needs your attention across your courses.</p>
				</div>
				<Link to="/instructor/courses" className="inline-flex items-center justify-center gap-2 rounded-md bg-udom-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-udom-primary-dark">
					Manage courses 
				</Link>
			</div>

			<div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{STATS.map(({ label, value, detail, icon: Icon, tone }) => (
					<div key={label} className="rounded-2xl border border-slate-200 bg-white p-5">
						<div className="flex items-start justify-between gap-3">
							<p className="text-sm font-medium text-slate-600">{label}</p>
							<span className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneClasses[tone]}`}><Icon className="h-5 w-5" /></span>
						</div>
						<p className="mt-4 text-3xl font-bold text-slate-900">{value}</p>
						<p className="mt-1 text-xs text-slate-500">{detail}</p>
					</div>
				))}
			</div>

			<div className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
				<section className="rounded-2xl border border-slate-200 bg-white">
					<div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
						<div><h2 className="font-semibold text-slate-900">Today&apos;s schedule</h2><p className="mt-1 text-xs text-slate-500">Thursday, 20 August 2026</p></div>
						<CalendarDays className="h-5 w-5 text-udom-primary" />
					</div>
					<div className="divide-y divide-slate-100">
						{SCHEDULE.map((item) => (
							<div key={item.time} className="flex gap-4 px-5 py-5">
								<div className="w-24 flex-shrink-0 text-xs font-semibold text-udom-primary"><Clock3 className="mr-1 inline h-3.5 w-3.5" />{item.time}</div>
								<div><p className="text-sm font-semibold text-slate-900">{item.title}</p><p className="mt-1 text-xs text-slate-500">{item.group} &middot; {item.room}</p></div>
							</div>
						))}
					</div>
				</section>

				<section className="rounded-2xl border border-slate-200 bg-white">
					<div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="font-semibold text-slate-900">Review queue</h2><p className="mt-1 text-xs text-slate-500">Submissions waiting for feedback</p></div><FileCheck2 className="h-5 w-5 text-orange-500" /></div>
					<div className="space-y-4 p-5">
						<div className="flex items-center justify-between rounded-xl bg-orange-50 p-4"><div><p className="text-2xl font-bold text-orange-700">17</p><p className="text-xs text-orange-800">Assignments to grade</p></div><Link to="/instructor/submissions" className="text-xs font-semibold text-orange-700 hover:underline">Open queue</Link></div>
						<div className="flex items-center justify-between rounded-xl bg-slate-50 p-4"><div><p className="text-2xl font-bold text-slate-800">6</p><p className="text-xs text-slate-600">Unread student messages</p></div><Link to="/instructor/messages" className="text-xs font-semibold text-udom-primary hover:underline">View messages</Link></div>
					</div>
				</section>
			</div>

			<section className="mt-8 rounded-2xl border border-slate-200 bg-white">
				<div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="font-semibold text-slate-900">Your courses</h2><p className="mt-1 text-xs text-slate-500">Current teaching assignments and progress</p></div><Link to="/instructor/courses" className="text-sm font-semibold text-udom-primary hover:underline">View all</Link></div>
				<div className="grid gap-4 p-5 md:grid-cols-3">
					{COURSES.map((course) => (
						<article key={course.name} className="rounded-xl border border-slate-200 p-4">
							<div className="flex items-start justify-between gap-3"><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">{course.status}</span><span className="text-xs text-slate-500">{course.students} students</span></div>
							<h3 className="mt-4 text-sm font-semibold leading-5 text-slate-900">{course.name}</h3><p className="mt-1 text-xs text-slate-500">{course.intake}</p>
							<div className="mt-5"><div className="flex justify-between text-xs text-slate-500"><span>Course progress</span><span>{course.progress}%</span></div><div className="mt-2 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-udom-primary" style={{ width: `${course.progress}%` }} /></div></div>
						</article>
					))}
				</div>
			</section>
		</div>
	);
}


