import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Search, Filter, Download, User } from 'lucide-react';
import { API_URL } from '../config';
import { getAuthToken } from '../utils/auth';

interface ReportStudent {
  _id: string;
  name: string;
  email: string;
  applications: number;
  interviewsCompleted: number;
  averageScore: number;
  recentScore: number;
  recentMaxScore: number;
  recentInterviewResultId: string | null;
}

export default function ReportsPage() {
  const [students, setStudents] = useState<ReportStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch(`${API_URL}/api/reports/students`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStudents(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch reports', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-primary" />
              Placement Analysis Reports
            </h1>
            <p className="mt-2 text-gray-600">Detailed overview of all students, applications, and performance.</p>
          </div>
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
          >
            <Download className="w-4 h-4" />
            Export Basic Data
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-center">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Students</h3>
            <p className="text-3xl font-bold text-gray-900">{students.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-center">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Interviews Finished</h3>
            <p className="text-3xl font-bold text-blue-600">
              {students.reduce((acc, curr) => acc + curr.interviewsCompleted, 0)}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-center">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Platform Average Score</h3>
            <p className="text-3xl font-bold text-emerald-600">
              {students.length > 0 
                ? Math.round(students.reduce((acc, curr) => acc + curr.averageScore, 0) / (students.filter(s => s.averageScore > 0).length || 1)) + '%'
                : 'N/A'}
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors sm:w-auto w-full justify-center text-sm font-medium">
            <Filter className="w-4 h-4" />
            Filter By Score
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-600">
                  <th className="p-4">Student Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4 text-center">Applications</th>
                  <th className="p-4 text-center">Interviews</th>
                  <th className="p-4 text-center">Latest Score</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">Loading student reports...</td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">No students found</td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs uppercase">
                            {student.name.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-900">{student.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600 text-sm">{student.email}</td>
                      <td className="p-4 text-center font-medium text-gray-700">{student.applications}</td>
                      <td className="p-4 text-center font-medium text-gray-700">{student.interviewsCompleted}</td>
                      <td className="p-4 text-center">
                        {student.recentMaxScore > 0 ? (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            (student.recentScore / student.recentMaxScore) >= 0.7 ? 'bg-green-100 text-green-800' :
                            (student.recentScore / student.recentMaxScore) >= 0.5 ? 'bg-yellow-100 text-yellow-800' :
                            student.recentScore > 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {student.recentScore}/{student.recentMaxScore}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            No Data
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {student.recentInterviewResultId ? (
                          <button 
                            onClick={() => navigate(`/interview-results/${student.recentInterviewResultId}`)}
                            className="text-primary hover:text-blue-700 text-sm font-medium transition-colors"
                          >
                            Detailed Report
                          </button>
                        ) : (
                          <span className="text-gray-400 text-sm">No Report</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
