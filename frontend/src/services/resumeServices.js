import { apiRequest, createFormData } from '../utils/apiHelpers';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export async function uploadResume(userId, file) {
  const formData = createFormData({
    file: file,
    user_id: userId
  });
  
  return apiRequest(`${BASE_URL}/api/resume/upload`, {
    method: "POST",
    body: formData,
  }, "Failed to upload resume");
}

export async function getResumeFeedbackByUserId(userId) {
  return apiRequest(`${BASE_URL}/api/resume/feedback?user_id=${userId}`, {}, "Failed to get feedback");
}

export async function fetchUserResume(userId) {
  try {
    return await apiRequest(`${BASE_URL}/api/resume/me?user_id=${userId}`, {}, "Failed to fetch resume");
  } catch (error) {
    if (error.message.includes("404")) return null;
    throw error;
  }
}

export async function improveResumeByUserId(userId) {
  return apiRequest(`${BASE_URL}/api/resume/improve?user_id=${userId}`, {}, "Failed to improve resume");
}

export async function tailorResumeToJobDescription(userId, jobDescription) {
  return apiRequest(`${BASE_URL}/api/resume/tailor`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, job_description: jobDescription })
  }, "Failed to tailor resume");
}

export async function exportTailoredResume(userId, format, tailoredResume) {
  const formData = new FormData();
  formData.append('user_id', userId);
  formData.append('format', format);
  formData.append('tailored_resume', tailoredResume);
  
  const response = await fetch(`${BASE_URL}/api/resume/export-tailored`, {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    throw new Error("Failed to export tailored resume");
  }
  return response.blob();
}