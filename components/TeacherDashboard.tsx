import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { StudentProfile, Submission, Resource, GeckoLevel } from '../types';
import { SEMESTERS, WEEKS, POINT_SYSTEM, getLevel } from '../constants';
import { Upload, Calendar, Users, FileText, Check, X, Printer, Plus, Search } from 'lucide-react';

const TeacherDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'submissions' | 'resources' | 'checkins' | 'students'>('submissions');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [filterSemester, setFilterSemester] = useState('all');
  const [filterWeek, setFilterWeek] = useState('all');
  const [searchStudent, setSearchStudent] = useState('');

  // Resource Upload State
  const [uploadSem, setUploadSem] = useState(SEMESTERS[0].id);
  const [uploadWeek, setUploadWeek] = useState(WEEKS[0]);
  const [uploadType, setUploadType] = useState<'worksheet' | 'past_paper'>('worksheet');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  // Checkin State
  const [checkInStudent, setCheckInStudent] = useState('');
  const [checkInDate, setCheckInDate] = useState('');

  const refreshData = async () => {
    setLoading(true);
    const [subs, stus, res] = await Promise.all([
      db.getSubmissions(),
      db.getStudents(),
      db.getResources()
    ]);
    setSubmissions(subs);
    setStudents(stus);
    setResources(res);
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, [activeTab]);

  const handlePrintToggle = async (sub: Submission) => {
    const updated = { ...sub, printed: !sub.printed };
    await db.updateSubmission(updated);
    refreshData();
  };

  const handleResourceUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle || !uploadFile) return;

    const newResource: Resource = {
      id: Math.random().toString(36).substr(2, 9),
      title: uploadTitle,
      type: uploadType,
      semester: uploadSem,
      week: uploadWeek,
      filename: uploadFile.name,
      uploadedBy: 'Teacher',
      timestamp: Date.now()
    };

    await db.addResource(newResource);
    setUploadTitle('');
    setUploadFile(null);
    alert('Resource uploaded!');
    refreshData();
  };

  const handleSetCheckIn = async () => {
    if (!checkInStudent || !checkInDate) return;
    await db.updateCheckIn(checkInStudent, checkInDate);
    alert('Check-in scheduled!');
    refreshData();
  };

  const handleAddPoints = async (username: string, points: number) => {
    await db.updatePoints(username, points);
    refreshData();
  };

  // Filtering Logic
  const filteredSubmissions = submissions.filter(s => {
    const matchSem = filterSemester === 'all' || s.semester === filterSemester;
    const matchWeek = filterWeek === 'all' || s.week.toString() === filterWeek;
    const studentName = students.find(stu => stu.username === s.studentUsername)?.name.toLowerCase() || '';
    const matchName = studentName.includes(searchStudent.toLowerCase());
    return matchSem && matchWeek && matchName;
  });

  return (
    <div className="bg-white rounded-xl shadow-xl min-h-[80vh] flex flex-col md:flex-row overflow-hidden">
      
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 bg-gray-900 text-white flex-shrink-0">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold tracking-wider">TEACHER<br/><span className="text-green-500">CONTROL</span></h2>
        </div>
        <nav className="p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('submissions')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'submissions' ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
          >
            <FileText className="w-5 h-5" />
            Submissions
          </button>
          <button 
            onClick={() => setActiveTab('resources')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'resources' ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
          >
            <Upload className="w-5 h-5" />
            Upload Resources
          </button>
          <button 
            onClick={() => setActiveTab('checkins')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'checkins' ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
          >
            <Calendar className="w-5 h-5" />
            Check-Ins
          </button>
          <button 
            onClick={() => setActiveTab('students')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'students' ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
          >
            <Users className="w-5 h-5" />
            Students & Points
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50 p-6 md:p-8">
        
        {/* SUBMISSIONS TAB */}
        {activeTab === 'submissions' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
              <h2 className="text-2xl font-bold text-gray-800">Student Submissions</h2>
              <div className="flex gap-2 flex-wrap">
                <select value={filterSemester} onChange={e => setFilterSemester(e.target.value)} className="border p-2 rounded text-sm">
                  <option value="all">All Semesters</option>
                  {SEMESTERS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
                <select value={filterWeek} onChange={e => setFilterWeek(e.target.value)} className="border p-2 rounded text-sm">
                  <option value="all">All Weeks</option>
                  {WEEKS.map(w => <option key={w} value={w}>Week {w}</option>)}
                </select>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input 
                    placeholder="Search Student..." 
                    value={searchStudent}
                    onChange={e => setSearchStudent(e.target.value)}
                    className="pl-9 border p-2 rounded text-sm w-48" 
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-bold">
                  <tr>
                    <th className="p-4">Student</th>
                    <th className="p-4">Sem/Week</th>
                    <th className="p-4">Study Detail</th>
                    <th className="p-4">Help Needed</th>
                    <th className="p-4">Past Paper</th>
                    <th className="p-4 text-center">Printed?</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredSubmissions.map(sub => {
                    const student = students.find(s => s.username === sub.studentUsername);
                    return (
                      <tr key={sub.id} className="hover:bg-gray-50">
                        <td className="p-4 font-bold text-gray-800">{student?.name || sub.studentUsername}</td>
                        <td className="p-4">S{sub.semester} / W{sub.week}</td>
                        <td className="p-4 max-w-xs truncate text-gray-600" title={sub.studyDescription}>{sub.studyDescription}</td>
                        <td className="p-4 text-red-500 text-xs font-medium">{sub.helpTopics || '-'}</td>
                        <td className="p-4">
                          {sub.requestPastPaper ? (
                            <div className="flex flex-col text-xs">
                              <span className="font-bold text-blue-600">YES</span>
                              {sub.uploadedFile && <span className="text-gray-400 italic">{sub.uploadedFile}</span>}
                            </div>
                          ) : '-'}
                        </td>
                        <td className="p-4 text-center">
                          {sub.requestPastPaper && (
                            <button 
                              onClick={() => handlePrintToggle(sub)}
                              className={`p-2 rounded-full transition-colors ${sub.printed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredSubmissions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-400">No submissions found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* RESOURCES TAB */}
        {activeTab === 'resources' && (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Upload className="w-5 h-5 text-green-600" />
                Upload New Material
              </h2>
              <form onSubmit={handleResourceUpload} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Semester</label>
                    <select value={uploadSem} onChange={e => setUploadSem(e.target.value)} className="w-full border rounded p-2 text-sm">
                      {SEMESTERS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Week</label>
                    <select value={uploadWeek} onChange={e => setUploadWeek(Number(e.target.value))} className="w-full border rounded p-2 text-sm">
                      {WEEKS.map(w => <option key={w} value={w}>Week {w}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Resource Type</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer border p-3 rounded w-full hover:bg-gray-50">
                      <input type="radio" checked={uploadType === 'worksheet'} onChange={() => setUploadType('worksheet')} className="text-green-600" />
                      <span className="text-sm font-medium">Worksheet</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer border p-3 rounded w-full hover:bg-gray-50">
                      <input type="radio" checked={uploadType === 'past_paper'} onChange={() => setUploadType('past_paper')} className="text-green-600" />
                      <span className="text-sm font-medium">Past Paper</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title</label>
                  <input type="text" value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} className="w-full border rounded p-2 text-sm" placeholder="e.g. Logic Gates Intro" required />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">File</label>
                  <input type="file" onChange={e => setUploadFile(e.target.files ? e.target.files[0] : null)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" required />
                </div>

                <button type="submit" className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition">Upload to Central DB</button>
              </form>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Existing Resources</h3>
              <ul className="space-y-3">
                {resources.map(res => (
                  <li key={res.id} className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                    <div>
                      <p className="font-bold text-sm text-gray-800">{res.title}</p>
                      <p className="text-xs text-gray-500">S{res.semester} • Week {res.week} • {res.type}</p>
                    </div>
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded">{res.filename}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* CHECK-INS TAB */}
        {activeTab === 'checkins' && (
          <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Schedule Check-Ins
            </h2>
            
            <div className="flex gap-4 mb-8">
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Student</label>
                <select value={checkInStudent} onChange={e => setCheckInStudent(e.target.value)} className="w-full border rounded p-2">
                  <option value="">Select Student...</option>
                  {students.map(s => <option key={s.username} value={s.username}>{s.name}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
                <input type="date" value={checkInDate} onChange={e => setCheckInDate(e.target.value)} className="w-full border rounded p-2" />
              </div>
              <div className="flex items-end">
                <button onClick={handleSetCheckIn} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-bold h-10">Set</button>
              </div>
            </div>

            <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Upcoming Check-Ins</h3>
            <div className="space-y-2">
              {students.filter(s => s.checkInDate).map(s => (
                <div key={s.username} className="flex justify-between items-center p-3 bg-blue-50 border border-blue-100 rounded">
                  <span className="font-medium text-gray-800">{s.name}</span>
                  <span className="font-bold text-blue-600">{s.checkInDate}</span>
                </div>
              ))}
              {students.filter(s => s.checkInDate).length === 0 && <p className="text-gray-400 text-sm">No active schedules.</p>}
            </div>
          </div>
        )}

        {/* STUDENTS / GAMIFICATION TAB */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Manage Students & Points</h2>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4">Student</th>
                  <th className="p-4">Level</th>
                  <th className="p-4 text-right">Current Points</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map(stu => (
                  <tr key={stu.username} className="hover:bg-gray-50">
                    <td className="p-4 font-bold text-gray-800">{stu.name}</td>
                    <td className="p-4 text-gray-600">{getLevel(stu.points)}</td>
                    <td className="p-4 text-right font-mono font-bold text-lg">{stu.points}</td>
                    <td className="p-4 flex justify-center gap-2">
                      <button 
                        onClick={() => handleAddPoints(stu.username, POINT_SYSTEM.CLASSWORK)}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs font-bold hover:bg-green-200"
                        title="Classwork (+3)"
                      >
                        +CW
                      </button>
                      <button 
                         onClick={() => handleAddPoints(stu.username, POINT_SYSTEM.QUIZ)}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-xs font-bold hover:bg-purple-200"
                        title="Quiz (+2)"
                      >
                        +Q
                      </button>
                      <button 
                        onClick={() => handleAddPoints(stu.username, POINT_SYSTEM.TOP_PERFORMER)}
                        className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-bold hover:bg-yellow-200"
                        title="Top Performer (+10)"
                      >
                        +Top
                      </button>
                      <button 
                        onClick={() => handleAddPoints(stu.username, POINT_SYSTEM.LATE_PENALTY)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-bold hover:bg-red-200"
                        title="Late (-2)"
                      >
                        -Late
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};

export default TeacherDashboard;