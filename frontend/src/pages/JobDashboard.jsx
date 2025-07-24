import React, { useState, useEffect } from "react";
import {
  getUserJobs,
  createJobApplication,
  updateJobApplication,
  deleteJobApplication,
  exportJobsToGoogleSheets,
  exportJobsToCSV
} from "../services/jobServices";
import { IoCalendarOutline, IoTrashBinOutline } from "react-icons/io5";
import { CiExport, CiNoWaitingSign, CiMapPin } from "react-icons/ci";
import { FaPencilAlt } from "react-icons/fa";
import { GiArcheryTarget, GiMoneyStack } from "react-icons/gi";
import { PiConfetti, PiNotePencil } from "react-icons/pi";
import { RxCross1 } from "react-icons/rx";
import { TiPlusOutline } from "react-icons/ti";
import { FaBuilding, FaBriefcase, FaFlag, FaCalendarAlt, FaMapMarkerAlt, FaDollarSign } from "react-icons/fa";

const JobDashboard = ({ user }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

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

  const [filters, setFilters] = useState({
    company_name: "",
    company_sort: "asc", // or "desc"
    job_title: "",
    status: "",
    applied_date: "",
    location: "",
    salary_range: ""
  });

  const [filterOptions, setFilterOptions] = useState({
    company_names: [],
    job_titles: [],
    statuses: ["applied", "interviewing", "offer", "rejected", "withdrawn"],
    applied_dates: [],
    locations: [],
    salary_ranges: []
  });

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    loadJobs();
  }, [user]);

  // Populate filter options based on jobs
  useEffect(() => {
    setFilterOptions({
      company_names: Array.from(new Set(jobs.map(j => j.company_name).filter(Boolean))).sort(),
      job_titles: Array.from(new Set(jobs.map(j => j.job_title).filter(Boolean))).sort(),
      statuses: ["applied", "interviewing", "offer", "rejected", "withdrawn"],
      applied_dates: Array.from(new Set(jobs.map(j => {
        if (!j.applied_date) return null;
        const d = new Date(j.applied_date);
        return d instanceof Date && !isNaN(d) ? d.toLocaleDateString('en-CA') : null;
      }).filter(Boolean))).sort(),
      locations: Array.from(new Set(jobs.map(j => j.location).filter(Boolean))).sort(),
      salary_ranges: Array.from(new Set(jobs.map(j => j.salary_range).filter(Boolean))).sort(),
    });
  }, [jobs]);

  // Filtering logic
  const filteredJobs = jobs.filter(job => {
    if (filters.company_name && job.company_name !== filters.company_name) return false;
    if (filters.job_title && job.job_title !== filters.job_title) return false;
    if (filters.status && job.status !== filters.status) return false;
    if (filters.applied_date && job.applied_date) {
      const localDate = new Date(job.applied_date).toLocaleDateString('en-CA');
      if (localDate !== filters.applied_date) return false;
    }
    if (filters.location && job.location !== filters.location) return false;
    if (filters.salary_range && job.salary_range !== filters.salary_range) return false;
    return true;
  });

  // Sorting logic for company name
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (filters.company_sort === "asc") {
      return (a.company_name || "").localeCompare(b.company_name || "");
    } else {
      return (b.company_name || "").localeCompare(a.company_name || "");
    }
  });

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
        const updatedJob = await updateJobApplication(editingJob.id, formData);
        setJobs(prev => prev.map(job =>
          job.id === editingJob.id ? updatedJob : job
        ));
        setEditingJob(null);
      } else {
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
        await loadJobs();
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
      applied: <PiNotePencil/>,
      interviewing: <GiArcheryTarget/>,
      offer: <PiConfetti/>,
      rejected: <RxCross1/>,
      withdrawn: <CiNoWaitingSign/>
    };
    return icons[status] || <PiNotePencil/>;
  };

  const handleExportCSV = async () => {
    if (!user || !user.id) {
      alert("Please sign in to export your job applications.");
      return;
    }
    try {
      const response = await exportJobsToCSV(user.id);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
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
      const response = await exportJobsToGoogleSheets(user.id);
      if (response.redirected) {
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

  const stats = {
    applied: jobs.filter(j => j.status === 'applied').length,
    interviewing: jobs.filter(j => j.status === 'interviewing').length,
    offer: jobs.filter(j => j.status === 'offer').length,
    rejected: jobs.filter(j => j.status === 'rejected').length,
    total: jobs.length
  };

  if (loading) {
    return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="loader-lg"/>
    </div>
    );
  }

  return (
    <div className="min-h-screen">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-app-primary">Job Tracker Dashboard</h1>
            <p className="text-app-text mt-2">Track your job applications and interview progress</p>
          </div>
          <div className="flex gap-2">
            <button
              className="btn-primary text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
              onClick={() => {
                if (!user || !user.id) {
                  alert("Please sign in to export to Google Sheets.");
                  return;
                }
                window.open(`${backendUrl}/api/jobs/export-to-sheets/${user.id}`, '_blank');
              }}
            >
              <span>
                <CiExport/>
              </span>
              <span>Export to Google Sheets</span>
            </button>
            <button
              className="btn-primary text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
              onClick={() => setShowAddForm(true)}
            >
              <span className="vtintext-white">
                <TiPlusOutline/>
              </span>
              <span className="text-white">Add Application</span>
            </button>
          </div>
        </div>

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

        {/* Enhanced Filter UI */}
        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl shadow border border-blue-200 mb-8 p-6 sticky top-4 z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 items-end w-full">
            {/* Company Name Filter */}
            <div className="flex flex-col">
              <label className="flex items-center gap-1 text-xs font-semibold text-app-primary mb-1">
                <FaBuilding className="text-blue-400 text-base"/>
                Company Name
              </label>
              <div className="flex items-center gap-1">
                <select
                  value={filters.company_name}
                  onChange={e => setFilters(f => ({ ...f, company_name: e.target.value }))}
                  className="rounded-full border border-blue-200 px-3 py-1 text-sm bg-white focus:ring-2 focus:ring-blue-300 shadow-sm w-full"
                >
                  <option value="">All</option>
                  {filterOptions.company_names.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  className="ml-1 px-2 py-1 border border-blue-200 rounded-full text-xs bg-blue-100 hover:bg-blue-200 transition-colors"
                  onClick={() => setFilters(f => ({ ...f, company_sort: f.company_sort === "asc" ? "desc" : "asc" }))}
                  title="Toggle sort order"
                >
                  {filters.company_sort === "asc" ? "A→Z" : "Z→A"}
                </button>
              </div>
            </div>
            {/* Job Title Filter */}
            <div className="flex flex-col">
              <label className="flex items-center gap-1 text-xs font-semibold text-app-primary mb-1">
                <FaBriefcase className="text-green-400 text-base"/>
                Job Title
              </label>
              <select
                value={filters.job_title}
                onChange={e => setFilters(f => ({ ...f, job_title: e.target.value }))}
                className="rounded-full border border-green-200 px-3 py-1 text-sm bg-white focus:ring-2 focus:ring-green-300 shadow-sm w-full"
              >
                <option value="">All</option>
                {filterOptions.job_titles.map(title => (
                  <option key={title} value={title}>{title}</option>
                ))}
              </select>
            </div>
            {/* Status Filter */}
            <div className="flex flex-col">
              <label className="flex items-center gap-1 text-xs font-semibold text-app-primary mb-1">
                <FaFlag className="text-yellow-400 text-base"/>
                Status
              </label>
              <select
                value={filters.status}
                onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
                className="rounded-full border border-yellow-200 px-3 py-1 text-sm bg-white focus:ring-2 focus:ring-yellow-300 shadow-sm w-full"
              >
                <option value="">All</option>
                {filterOptions.statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            {/* Applied Date Filter */}
            <div className="flex flex-col">
              <label className="flex items-center gap-1 text-xs font-semibold text-app-primary mb-1">
                <FaCalendarAlt className="text-purple-400 text-base"/>
                Applied Date
              </label>
              <select
                value={filters.applied_date}
                onChange={e => setFilters(f => ({ ...f, applied_date: e.target.value }))}
                className="rounded-full border border-purple-200 px-3 py-1 text-sm bg-white focus:ring-2 focus:ring-purple-300 shadow-sm w-full"
              >
                <option value="">All</option>
                {filterOptions.applied_dates.map(date => (
                  <option key={date} value={date}>{date}</option>
                ))}
              </select>
            </div>
            {/* Location Filter */}
            <div className="flex flex-col">
              <label className="flex items-center gap-1 text-xs font-semibold text-app-primary mb-1">
                <FaMapMarkerAlt className="text-pink-400 text-base"/>
                Location
              </label>
              <select
                value={filters.location}
                onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}
                className="rounded-full border border-pink-200 px-3 py-1 text-sm bg-white focus:ring-2 focus:ring-pink-300 shadow-sm w-full"
              >
                <option value="">All</option>
                {filterOptions.locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
            {/* Salary Range Filter */}
            <div className="flex flex-col">
              <label className="flex items-center gap-1 text-xs font-semibold text-app-primary mb-1">
                <FaDollarSign className="text-indigo-400 text-base"/>
                Salary Range
              </label>
              <select
                value={filters.salary_range}
                onChange={e => setFilters(f => ({ ...f, salary_range: e.target.value }))}
                className="rounded-full border border-indigo-200 px-3 py-1 text-sm bg-white focus:ring-2 focus:ring-indigo-300 shadow-sm w-full"
              >
                <option value="">All</option>
                {filterOptions.salary_ranges.map(sal => (
                  <option key={sal} value={sal}>{sal}</option>
                ))}
              </select>
            </div>
            {/* Reset Filters Button - right aligned in last grid cell */}
            <div className="flex flex-col items-end justify-end h-full">
              <button
                type="button"
                className="px-4 py-2 rounded-full text-xs font-semibold bg-gray-200 hover:bg-gray-300 text-gray-700 border border-gray-300 shadow-sm mt-4 sm:mt-0"
                onClick={() => setFilters({
                  company_name: "",
                  company_sort: "asc",
                  job_title: "",
                  status: "",
                  applied_date: "",
                  location: "",
                  salary_range: ""
                })}
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-app-primary">Your Applications</h2>
          </div>

          {sortedJobs.length === 0 ? (
            <div className="p-8 text-center">
              <div className="flex items-center justify-center text-4xl mb-4">
                <PiNotePencil/>
              </div>
              <h3 className="text-lg font-medium text-app-text mb-2">No applications yet</h3>
              <p className="text-app-text/70">Start tracking your job search by adding your first application</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {sortedJobs.map((job) => (
                <div key={job.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-app-primary">{job.job_title}</h3>
                        <span className={`flex items-center justify center gap-0.5 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                          {getStatusIcon(job.status)} {job.status}
                        </span>
                      </div>
                      <p className="text-app-text font-medium mb-1">{job.company_name}</p>
                      <div className="flex items-center gap-4 text-sm text-app-text/70 mb-3">
                        <span className="flex items-center gap-0.5">
                          <CiMapPin/>
                          {job.location || 'No location'}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <GiMoneyStack/>
                          {job.salary_range || 'No salary info'}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <IoCalendarOutline />
                          Applied: {new Date(job.applied_date).toLocaleDateString()}
                        </span>
                      </div>
                      {job.notes && (
                        <p className="text-sm text-app-text/80 bg-gray-50 p-3 rounded-md">
                          <PiNotePencil/>
                          {job.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <select
                        value={job.status}
                        onChange={(e) => handleStatusChange(job.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-app-primary cursor-pointer"
                      >
                        <option value="applied">Applied</option>
                        <option value="interviewing">Interviewing</option>
                        <option value="offer">Offer</option>
                        <option value="rejected">Rejected</option>
                        <option value="withdrawn">Withdrawn</option>
                      </select>
                      <button
                        onClick={() => handleEdit(job)}
                        className="flex items-center justify-center gap-0.5 cursor-pointer job-edit-button text-sm"
                      >
                        <FaPencilAlt/>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(job.id)}
                        className="flex items-center justify-center gap-0.5 cursor-pointer text-red-500 hover:text-red-700 text-sm"
                      >
                        <IoTrashBinOutline/>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showAddForm && (
        <>
          <div className="fixed inset-0 z-40 backdrop-blur-sm pointer-events-auto"></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="bg-white text-black rounded-xl p-4 shadow-2xl max-w-md w-full border border-app-primary flex flex-col items-center max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-semibold text-app-primary mb-3">
                {editingJob ? 'Edit Application' : 'Add New Application'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-2 w-full">
                <div>
                  <label className="block text-sm font-medium text-app-text mb-1">Company Name *</label>
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-app-primary"
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
                    className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-app-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-app-text mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-app-primary"
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
                    className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-app-primary"
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
                    className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-app-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-app-text mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-app-primary"
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
                    className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-app-primary"
                    placeholder="Add any notes about this application..."
                  />
                </div>
                <div className="flex gap-2 pt-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 btn-primary text-white py-1.5 px-3 rounded-md transition-colors font-medium disabled:opacity-50 text-sm cursor-pointer"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-3">
                        <div className="loader-md" />
                        Saving...
                      </span>
                    ) : (
                      (editingJob ? 'Update' : 'Add') + ' Application'
                    )}
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
                    className="flex-1 bg-gray-300 text-gray-700 py-1.5 px-3 rounded-md hover:bg-gray-400 transition-colors font-medium text-sm cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default JobDashboard;