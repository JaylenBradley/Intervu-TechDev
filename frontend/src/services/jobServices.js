const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export async function getUserJobs(userId) {
  try {
    const response = await fetch(`${BASE_URL}/api/jobs/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch jobs: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching jobs:", error);
    throw error;
  }
}

export async function createJobApplication(jobData) {
  try {
    const response = await fetch(`${BASE_URL}/api/jobs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jobData),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create job: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error creating job:", error);
    throw error;
  }
}

export async function updateJobApplication(applicationId, jobData) {
  try {
    const response = await fetch(`${BASE_URL}/api/jobs/${applicationId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jobData),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update job: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error updating job:", error);
    throw error;
  }
}

export async function deleteJobApplication(applicationId) {
  try {
    const response = await fetch(`${BASE_URL}/api/jobs/${applicationId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete job: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error deleting job:", error);
    throw error;
  }
}

export async function getJobApplication(applicationId) {
  try {
    const response = await fetch(`${BASE_URL}/api/jobs/application/${applicationId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch job: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching job:", error);
    throw error;
  }
}

export async function exportJobsToCSV(userId) {
  return await fetch(`${BASE_URL}/api/jobs/${userId}/export`, {
    method: "GET",
    credentials: "include"
  });
}

export async function exportJobsToGoogleSheets(userId) {
  const response = await fetch(`${BASE_URL}/api/jobs/export-to-sheets/${userId}`, {
    method: "GET",
    credentials: "include"
  });
  return response;
}