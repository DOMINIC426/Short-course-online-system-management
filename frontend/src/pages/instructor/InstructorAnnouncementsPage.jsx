import React, { useEffect, useState } from "react";
import { instructorApi } from "../../api/instructorApi";
import { Send, Megaphone } from "lucide-react";

export default function InstructorAnnouncementsPage() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetAudience, setTargetAudience] = useState("ALL");

  useEffect(() => {
    instructorApi.getAssignedCourses().then((data) => {
      setCourses(data);
      if (data.length > 0) setSelectedCourse(data[0].id);
    });
  }, []);

  const handleSendAnnouncement = async (e) => {
    e.preventDefault();
    await instructorApi.sendAnnouncement({
      courseId: selectedCourse,
      title,
      content,
      targetAudience,
    });
    alert("Announcement successfully broadcasted to students!");
    setTitle("");
    setContent("");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Broadcast Announcement</h1>
        <p className="text-slate-500 text-sm mt-1">
          Send urgent updates or course notes directly to enrolled students.
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Megaphone className="w-5 h-5 text-blue-600" />
          <h2 className="font-bold text-slate-900">Create Announcement</h2>
        </div>

        <form onSubmit={handleSendAnnouncement} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Select Course
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Target Audience
            </label>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Enrolled Students</option>
              <option value="FULLY_PAID">Fully Paid Students Only</option>
              <option value="UNPAID">Unpaid / Outstanding Students Only</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Title</label>
            <input
              type="text"
              placeholder="e.g. Schedule Change for Lab Session"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Message</label>
            <textarea
              rows={4}
              placeholder="Type your message here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Send className="w-4 h-4" /> Send Announcement
          </button>
        </form>
      </div>
    </div>
  );
}