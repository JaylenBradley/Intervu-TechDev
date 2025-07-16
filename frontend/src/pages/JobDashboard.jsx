import React, { useState, useEffect } from "react";
import { getUserJobs, createJobApplication, updateJobApplication, deleteJobApplication } from "../services/jobServices";
import axios from "axios";

const JobDashboard = ({ user }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    company_name: "",
    job_title: "",
    job_description: "",
    application_url: "",
    salary_range: "",
    location: "",
    notes: "",
    status: "applied"
  });

  // Load jobs from API
  const loadJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!user || !user.id) {
        setError("Please sign in to view your job applications");
        setLoading(false);
        return;
      }
      const jobsData = await getUserJobs(user.id);
      setJobs(jobsData);
    } catch (err) {
      setError("Failed to load job applications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch jobs only after user is loaded
  useEffect(() => {
    if (!user) return;
    loadJobs();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (!user || !user.id) {
        setError("Please sign in to add job applications");
        return;
      }
      if (editingJob) {
        // Update existing job
        const updatedJob = await updateJobApplication(editingJob.id, formData);
        setJobs(prev => prev.map(job => 
          job.id === editingJob.id ? updatedJob : job
        ));
        setEditingJob(null);
      } else {
        // Add new job
        const newJob = await createJobApplication({
          ...formData,
          user_id: user.id
        });
        setJobs(prev => [...prev, newJob]);
      }
      setFormData({
        company_name: "",
        job_title: "",
        job_description: "",
        application_url: "",
        salary_range: "",
        location: "",
        notes: "",
        status: "applied"
      });
      setShowAddForm(false);
      setError(null);
    } catch (err) {
      setError("Failed to save job application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      const updatedJob = await updateJobApplication(jobId, { status: newStatus });
      setJobs(prev => prev.map(job => 
        job.id === jobId ? updatedJob : job
      ));
    } catch (err) {
      setError("Failed to update job status. Please try again.");
    }
  };

  const handleDelete = async (jobId) => {
    if (window.confirm("Are you sure you want to delete this application?")) {
      try {
        await deleteJobApplication(jobId);
        await loadJobs(); // Always refetch from backend after delete
        setError(null);
      } catch (err) {
        setError("Failed to delete job application. Please try again.");
      }
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setFormData({
      company_name: job.company_name || "",
      job_title: job.job_title || "",
      job_description: job.job_description || "",
      application_url: job.application_url || "",
      salary_range: job.salary_range || "",
      location: job.location || "",
      notes: job.notes || "",
      status: job.status || "applied"
    });
    setShowAddForm(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      applied: "bg-blue-100 text-blue-800",
      interviewing: "bg-yellow-100 text-yellow-800",
      offer: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      withdrawn: "bg-gray-100 text-gray-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status) => {
    const icons = {
      applied: "📝",
      interviewing: "🎯",
      offer: "🎉",
      rejected: "❌",
      withdrawn: "🚫"
    };
    return icons[status] || "📝";
  };

  // Export to CSV handler
  const handleExportCSV = async () => {
    if (!user || !user.id) {
      alert("Please sign in to export your job applications.");
      return;
    }
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}/api/jobs/${user.id}/export`,
        { responseType: "blob" }
      );
      // Create a link and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `job_applications_${user.id}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Failed to export job applications. Please try again.");
    }
  };

  const handleExportGoogleSheets = async () => {
    if (!user || !user.id) {
      alert("Please sign in to export to Google Sheets.");
      return;
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}/api/jobs/export-to-sheets/${user.id}`, {
        method: "GET",
        credentials: "include"
      });
      if (response.redirected) {
        // If OAuth flow, redirect the user
        window.location.href = response.url;
        return;
      }
      const data = await response.json();
      if (data.sheet_url) {
        window.open(data.sheet_url, "_blank");
      } else {
        alert("Failed to export to Google Sheets.");
      }
    } catch (err) {
      alert("Failed to export to Google Sheets. Please try again.");
    }
  };

  // Calculate stats
  const stats = {
    applied: jobs.filter(j => j.status === 'applied').length,
    interviewing: jobs.filter(j => j.status === 'interviewing').length,
    offer: jobs.filter(j => j.status === 'offer').length,
    rejected: jobs.filter(j => j.status === 'rejected').length,
    total: jobs.length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-app-background">
        <div className="flex items-center justify-center mt-24">
          <div className="text-2xl text-app-text">Loading job applications...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-background">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-app-primary">Job Tracker Dashboard</h1>
            <p className="text-app-text mt-2">Track your job applications and interview progress</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (!user || !user.id) {
                  alert("Please sign in to export to Google Sheets.");
                  return;
                }
                const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
                window.open(`${backendUrl}/api/jobs/export-to-sheets/${user.id}`, '_blank');
              }}
              className="bg-app-primary text-white px-6 py-3 rounded-lg hover:bg-app-primary/90 transition-colors flex items-center gap-2"
            >
              <span>⬆️</span>
              <span>Export to Google Sheets</span>
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-app-primary text-white px-6 py-3 rounded-lg hover:bg-app-primary/90 transition-colors flex items-center gap-2"
            >
              <span className="text-white">+</span>
              <span className="text-white">Add Application</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
            <button 
              onClick={() => setError(null)}
              className="float-right font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {Object.entries(stats).map(([status, count]) => (
            <div key={status} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-app-primary">{count}</div>
              <div className="text-sm text-app-text capitalize">{status}</div>
              {status === 'interviewing' && stats.total > 0 && (
                <div className="text-xs text-app-primary mt-1">{Math.round((count / stats.total) * 100)}% of total</div>
              )}
            </div>
          ))}
        </div>

        {/* Job Applications List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-app-primary">Your Applications</h2>
          </div>
          
          {jobs.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-app-text mb-2">No applications yet</h3>
              <p className="text-app-text/70">Start tracking your job search by adding your first application</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {jobs.map((job) => (
                <div key={job.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-app-primary">{job.job_title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                          {getStatusIcon(job.status)} {job.status}
                        </span>
                      </div>
                      <p className="text-app-text font-medium mb-1">{job.company_name}</p>
                      <div className="flex items-center gap-4 text-sm text-app-text/70 mb-3">
                        <span>📍 {job.location || 'No location'}</span>
                        <span>💰 {job.salary_range || 'No salary info'}</span>
                        <span>📅 Applied: {new Date(job.applied_date).toLocaleDateString()}</span>
                      </div>
                      {job.notes && (
                        <p className="text-sm text-app-text/80 bg-gray-50 p-3 rounded-md">
                          📝 {job.notes}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <select
                        value={job.status}
                        onChange={(e) => handleStatusChange(job.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-app-primary"
                      >
                        <option value="applied">Applied</option>
                        <option value="interviewing">Interviewing</option>
                        <option value="offer">Offer</option>
                        <option value="rejected">Rejected</option>
                        <option value="withdrawn">Withdrawn</option>
                      </select>
                      <button
                        onClick={() => handleEdit(job)}
                        className="text-app-primary hover:text-app-primary/80 text-sm"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(job.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Job Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold text-app-primary mb-4">
              {editingJob ? 'Edit Application' : 'Add New Application'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-app-text mb-1">Company Name *</label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-app-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-app-text mb-1">Job Title *</label>
                <input
                  type="text"
                  name="job_title"
                  value={formData.job_title}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-app-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-app-text mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-app-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-app-text mb-1">Salary Range</label>
                <input
                  type="text"
                  name="salary_range"
                  value={formData.salary_range}
                  onChange={handleInputChange}
                  placeholder="e.g., $100k - $150k"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-app-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-app-text mb-1">Application URL</label>
                <input
                  type="text"
                  name="application_url"
                  value={formData.application_url}
                  onChange={handleInputChange}
                  placeholder="e.g., https://www.company.com/careers or www.company.com"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-app-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-app-text mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-app-primary"
                >
                  <option value="applied">Applied</option>
                  <option value="interviewing">Interviewing</option>
                  <option value="offer">Offer</option>
                  <option value="rejected">Rejected</option>
                  <option value="withdrawn">Withdrawn</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-app-text mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-app-primary"
                  placeholder="Add any notes about this application..."
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-app-primary text-white py-2 px-4 rounded-md hover:bg-app-primary/90 transition-colors font-medium disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : (editingJob ? 'Update' : 'Add') + ' Application'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingJob(null);
                    setFormData({
                      company_name: "",
                      job_title: "",
                      job_description: "",
                      application_url: "",
                      salary_range: "",
                      location: "",
                      notes: "",
                      status: "applied"
                    });
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDashboard; 