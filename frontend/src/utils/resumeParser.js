// Constants for feedback parsing
const FEEDBACK_PATTERN = /Original:\s*([^\n]+)\s*Grade:\s*([^\n]+)\s*Feedback:\s*([^\n]+(?:\n(?!- Option)[^\n]+)*)\s*(- Option 1:[^\n]+(?:\n(?!- Option)[^\n]+)*)\s*(- Option 2:[^\n]+(?:\n(?!Original:)[^\n]+)*)/g;

/**
 * Parse raw feedback string into structured data
 * @param {string} raw - Raw feedback text from API
 * @returns {Array} Array of parsed feedback items
 */
export function parseFeedback(raw) {
  if (typeof raw !== "string") return [];
  
  const matches = [...raw.matchAll(FEEDBACK_PATTERN)];
  const pairs = [];
  
  for (const match of matches) {
    const originalText = match[1].trim().replace(/^[•\-]\s*/, '').replace(/^\s*[•\-]\s*/, '').trim();
    const grade = match[2].trim();
    const feedback = match[3].trim();
    const option1 = match[4].replace('- Option 1:', '').trim();
    const option2 = match[5].replace('- Option 2:', '').trim();
    
    // Skip items that are just intro text
    if (originalText.toLowerCase().includes('detailed analysis') || 
        originalText.toLowerCase().includes('here\'s') ||
        originalText.toLowerCase().includes('analysis of')) {
      continue;
    }
    
    // Clean up options
    const completeOptions = [];
    for (const option of [option1, option2]) {
      const optionText = option.trim();
      if (optionText.length > 15 && 
          !optionText.endsWith('...') && 
          !optionText.endsWith('..') &&
          !optionText.endsWith('etc') &&
          !optionText.endsWith('etc.')) {
        completeOptions.push(optionText);
      }
    }
    
    if (completeOptions.length >= 2) {
      pairs.push({
        original: originalText,
        grade: grade,
        feedback: feedback,
        options: completeOptions
      });
    }
  }
  
  console.log("Parsed pairs:", pairs);
  return pairs;
} 