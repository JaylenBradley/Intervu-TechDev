/**
 * Centralized API error handling
 * @param {Response} response - Fetch response object
 * @param {string} errorMessage - Custom error message
 * @returns {Promise} Response data
 */
export async function handleApiResponse(response, errorMessage = "API request failed") {
  if (!response.ok) {
    // Try to get error details from response
    let errorDetail = errorMessage;
    try {
      const errorData = await response.json();
      errorDetail = errorData.detail || errorData.message || errorMessage;
    } catch {
      // If we can't parse the error response, use the status text
      errorDetail = response.statusText || errorMessage;
    }
    throw new Error(errorDetail);
  }
  return response.json();
}

/**
 * Centralized fetch wrapper with error handling
 * @param {string} url - API endpoint URL
 * @param {Object} options - Fetch options
 * @param {string} errorMessage - Custom error message
 * @returns {Promise} Response data
 */
export async function apiRequest(url, options = {}, errorMessage = "API request failed") {
  try {
    const response = await fetch(url, options);
    return await handleApiResponse(response, errorMessage);
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

/**
 * Create FormData for file uploads
 * @param {Object} data - Data to append to FormData
 * @returns {FormData} FormData object
 */
export function createFormData(data) {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value);
  });
  return formData;
} 