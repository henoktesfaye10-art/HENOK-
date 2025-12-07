import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { StudentProfile, Submission, Resource, GeckoLevel } from '../types';
import { SEMESTERS, WEEKS, getLevel, getGrade, getLevelProgress, BADGES, POINT_SYSTEM } from '../constants';
import { Calendar, Upload, Download, CheckCircle, AlertCircle, Award, TrendingUp, BookOpen, Star } from 'lucide-react';

interface Props {
  user: StudentProfile;
  refreshTrigger: number; // to force re-fetch
}

const StudentDashboard: React.FC<Props> = ({ user, refreshTrigger }) => {
  const [activeTab, setActiveTab] = useState<'study' | 'practice' | 'profile'>('study');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]); // For leaderboard
  
  // Form State
  const [selectedSemester, setSelectedSemester] = useState(SEMESTERS[0].id);
  const [selectedWeek, setSelectedWeek] = useState(WEEKS[0]);
  const [studyDesc, setStudyDesc] = useState('');
  const [helpTopics, setHelpTopics] = useState('');
  const [requestPaper, setRequestPaper] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const subs = await db.getSubmissions();
      const res = await db.getResources();
      const stus = await db.getStudents();
      
      // Filter submissions for this student
      setSubmissions(subs.filter(s => s.studentUsername === user.username));
      setResources(res);
      setStudents(stus.sort((a, b) => b.points - a.points)); // Sort for leaderboard
    };
    fetchData();
  }, [user.username, refreshTrigger, submitting]);

  // Derived Gamification Data
  const currentLevel = getLevel(user.points);
  const currentGrade = getGrade(user.points);
  const progress = getLevelProgress(user.points);
  const myRank = students.findIndex(s => s.username === user.username) + 1;

  // Check-In Status Logic
  const todayStr = new Date().toISOString().split('T')[0];
  const isCheckInToday = user.checkInDate === todayStr;
  const isFutureCheckIn = user.checkInDate && user.checkInDate > todayStr;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    // Check Duplicate
    const isDuplicate = submissions.some(s => s.semester === selectedSemester && s.week === selectedWeek);
    if (isDuplicate) {
      setMessage({ type: 'error', text: 'You have already submitted for this Semester and Week.' });
      setSubmitting(false);
      return;
    }

    const newSubmission: Submission = {
      id: Math.random().toString(36).substr(2, 9),
      studentUsername: user.username,
      semester: selectedSemester,
      week: selectedWeek,
      studyDescription: studyDesc,
      helpTopics,
      requestPastPaper: requestPaper,
      uploadedFile: file ? file.name : undefined,
      printed: false,
      timestamp: Date.now(),
      status: 'ontime' // simplified
    };

    await db.addSubmission(newSubmission);
    setMessage({ type: 'success', text: `Submitted successfully! +${POINT_SYSTEM.HOMEWORK} Points earned.` });
    
    // Reset form
    setStudyDesc('');
    setHelpTopics('');
    setRequestPaper(false);
    setFile(null);
    setSubmitting(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* LEFT COLUMN: Sidebar / Navigation & Status */}
      <div className="lg:col-span-3 space-y-6">
        
        {/* Profile Summary Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-green-600 p-4 text-center">
            <div className="w-20 h-20 bg-white rounded-full mx-auto flex items-center justify-center text-4xl shadow-inner border-4 border-green-700">
              {currentLevel === GeckoLevel.ALPHA ? '👑' : 
               currentLevel === GeckoLevel.STALKER ? '🦎' : 
               currentLevel === GeckoLevel.CLIMBER ? '🦗' : '🥚'}
            </div>
            <h2 className="text-white font-bold mt-2 text-lg">{user.name}</h2>
            <p className="text-green-100 text-sm font-medium">{currentLevel}</p>
          </div>
          <div className="p-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-bold text-gray-700">Level Progress</span>
              <span className="text-xs text-gray-500">{Math.round(progress.percent)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <div className="bg-green-500 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${progress.percent}%` }}></div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500">Points</p>
                <p className="text-xl font-bold text-gray-800">{user.points}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500">Grade</p>
                <p className={`text-xl font-bold ${currentGrade === 'A' || currentGrade === 'A+' ? 'text-green-600' : 'text-gray-800'}`}>{currentGrade}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Check-In Status Card */}
        <div className={`rounded-xl shadow-md border p-4 ${isCheckInToday ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className={`w-5 h-5 ${isCheckInToday ? 'text-green-600' : 'text-gray-500'}`} />
            <h3 className="font-bold text-gray-800">Check-In Status</h3>
          </div>
          {isCheckInToday ? (
            <div className="text-green-700 font-medium flex items-start gap-2">
              <CheckCircle className="w-5 h-5 mt-0.5" />
              <span>You are scheduled for a check-in <strong>TODAY</strong>!</span>
            </div>
          ) : isFutureCheckIn ? (
            <div className="text-blue-600 font-medium">
              Check-in scheduled for: <br />
              <span className="text-lg font-bold">{user.checkInDate}</span>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No upcoming check-ins scheduled.</p>
          )}
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
          <button 
            onClick={() => setActiveTab('study')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'study' ? 'bg-gray-100 text-gray-900 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <BookOpen className="w-5 h-5" />
            Study Tracker
          </button>
          <button 
            onClick={() => setActiveTab('practice')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'practice' ? 'bg-gray-100 text-gray-900 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Download className="w-5 h-5" />
            Practice Zone
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'profile' ? 'bg-gray-100 text-gray-900 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <TrendingUp className="w-5 h-5" />
            Gamification & Stats
          </button>
        </div>
      </div>

      {/* RIGHT COLUMN: Dynamic Content */}
      <div className="lg:col-span-9 space-y-6">
        
        {activeTab === 'study' && (
          <div className="space-y-6">
            {/* Submission Form */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Upload className="w-6 h-6 text-green-600" />
                Submit Weekly Study
              </h2>
              
              {message && (
                <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Semester</label>
                    <select 
                      value={selectedSemester}
                      onChange={(e) => setSelectedSemester(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none transition"
                    >
                      {SEMESTERS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Week</label>
                    <select 
                      value={selectedWeek}
                      onChange={(e) => setSelectedWeek(Number(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none transition"
                    >
                      {WEEKS.map(w => <option key={w} value={w}>Week {w}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">What did you study?</label>
                  <textarea 
                    value={studyDesc}
                    onChange={(e) => setStudyDesc(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg p-3 h-32 focus:ring-2 focus:ring-green-500 outline-none transition"
                    placeholder="Describe your learning activities..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Topics needing help (Optional)</label>
                  <input 
                    type="text"
                    value={helpTopics}
                    onChange={(e) => setHelpTopics(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none transition"
                    placeholder="e.g. Arrays, Logic Gates"
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <span className="block text-sm font-semibold text-gray-700 mb-2">Request Past Year Paper?</span>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="pastPaper" 
                        checked={requestPaper === false} 
                        onChange={() => setRequestPaper(false)}
                        className="text-green-600 focus:ring-green-500"
                      />
                      <span className="text-gray-700">No</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="pastPaper" 
                        checked={requestPaper === true} 
                        onChange={() => setRequestPaper(true)}
                        className="text-green-600 focus:ring-green-500"
                      />
                      <span className="text-gray-700">Yes</span>
                    </label>
                  </div>

                  {requestPaper && (
                    <div className="mt-4 animate-fade-in">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Upload Reference (Image/PDF)</label>
                      <input 
                        type="file"
                        onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">Upload the specific question or paper code you need printed.</p>
                    </div>
                  )}
                </div>

                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? 'Saving...' : 'Submit to Tracker'}
                  {!submitting && <CheckCircle className="w-5 h-5" />}
                </button>
              </form>
            </div>

            {/* Submission History */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">My Previous Submissions</h3>
              {submissions.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No submissions yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="p-3 font-semibold text-gray-700">Sem / Week</th>
                        <th className="p-3 font-semibold text-gray-700">Study Summary</th>
                        <th className="p-3 font-semibold text-gray-700">Past Paper</th>
                        <th className="p-3 font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map(sub => (
                        <tr key={sub.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-3">
                            <span className="font-bold text-gray-800">S{sub.semester}</span>
                            <span className="text-gray-500 block text-xs">Week {sub.week}</span>
                          </td>
                          <td className="p-3 text-gray-600 max-w-xs truncate">{sub.studyDescription}</td>
                          <td className="p-3">
                            {sub.requestPastPaper ? (
                              sub.printed ? (
                                <span className="inline-flex items-center px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-bold">
                                  Printed ✅
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded bg-yellow-100 text-yellow-700 text-xs font-bold">
                                  Pending ⏳
                                </span>
                              )
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="p-3 text-green-600 font-bold text-xs uppercase">{sub.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'practice' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Download className="w-6 h-6 text-blue-600" />
              Weekly Practice Zone
            </h2>
            <p className="text-gray-600 mb-6">Download worksheets and past papers uploaded by your teacher.</p>

            <div className="space-y-8">
              {SEMESTERS.map(sem => {
                const semResources = resources.filter(r => r.semester === sem.id);
                if (semResources.length === 0) return null;

                return (
                  <div key={sem.id} className="border rounded-lg p-4 bg-gray-50">
                    <h3 className="font-bold text-lg text-gray-800 border-b border-gray-200 pb-2 mb-4">{sem.label}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {semResources.map(res => (
                        <div key={res.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex justify-between items-start">
                          <div>
                            <span className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1 block">Week {res.week} • {res.type.replace('_', ' ')}</span>
                            <h4 className="font-semibold text-gray-900">{res.title}</h4>
                            <p className="text-xs text-gray-500 mt-1">{res.filename}</p>
                          </div>
                          <button className="text-gray-600 hover:text-blue-600 transition-colors p-2 bg-gray-100 rounded-full">
                            <Download className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
              {resources.length === 0 && (
                <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  No resources uploaded yet. Check back later!
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Badges Section */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-6 h-6 text-yellow-500" />
                Badges & Achievements
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Object.values(BADGES).map((badge) => {
                  const hasBadge = user.badges.includes(badge.id);
                  return (
                    <div key={badge.id} className={`p-4 rounded-lg text-center border-2 transition-all ${hasBadge ? 'border-yellow-400 bg-yellow-50' : 'border-gray-100 bg-gray-50 opacity-60 grayscale'}`}>
                      <div className="text-2xl mb-2">{badge.label.split(' ')[0]}</div>
                      <h4 className="font-bold text-gray-800 text-sm">{badge.label.split(' ').slice(1).join(' ')}</h4>
                      <p className="text-xs text-gray-500 mt-1">{badge.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Star className="w-6 h-6 text-purple-600" />
                Gecko Leaderboard (Top 10)
              </h2>
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3 text-sm font-bold text-gray-600">Rank</th>
                      <th className="p-3 text-sm font-bold text-gray-600">Student</th>
                      <th className="p-3 text-sm font-bold text-gray-600">Level</th>
                      <th className="p-3 text-sm font-bold text-gray-600 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {students.slice(0, 10).map((stu, index) => {
                      const isMe = stu.username === user.username;
                      return (
                        <tr key={stu.username} className={isMe ? 'bg-green-50' : 'hover:bg-gray-50'}>
                          <td className="p-3">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-700' : index === 1 ? 'bg-gray-200 text-gray-700' : index === 2 ? 'bg-orange-100 text-orange-800' : 'text-gray-500'}`}>
                              {index + 1}
                            </span>
                          </td>
                          <td className={`p-3 text-sm ${isMe ? 'font-bold text-green-800' : 'text-gray-700'}`}>
                            {stu.name} {isMe && '(You)'}
                          </td>
                          <td className="p-3 text-sm text-gray-500">
                            {getLevel(stu.points)}
                          </td>
                          <td className="p-3 text-sm font-bold text-gray-800 text-right">
                            {stu.points}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
