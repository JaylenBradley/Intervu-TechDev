import re
from typing import List, Dict, Any

# Constants for feedback parsing
FEEDBACK_PATTERN = r'Original:\s*([^\n]+)\s*Grade:\s*([^\n]+)\s*Feedback:\s*([^\n]+(?:\n(?!- Option)[^\n]+)*)\s*(- Option 1:[^\n]+(?:\n(?!- Option)[^\n]+)*)\s*(- Option 2:[^\n]+(?:\n(?!Original:)[^\n]+)*)'

def parse_feedback_response(feedback_text: str) -> List[Dict[str, Any]]:
    """Parse the AI feedback response to extract structured feedback items."""
    
    if not feedback_text:
        return []
    
    matches = re.findall(FEEDBACK_PATTERN, feedback_text, re.DOTALL)
    items = []
    
    for match in matches:
        original_text = match[0].strip()
        grade = match[1].strip()
        feedback = match[2].strip()
        option1 = match[3].replace('- Option 1:', '').strip()
        option2 = match[4].replace('- Option 2:', '').strip()
        
        # Remove bullet points from original text
        original_text = re.sub(r'^[•\-]\s*', '', original_text)
        original_text = re.sub(r'^\s*[•\-]\s*', '', original_text)
        original_text = original_text.strip()
        
        # Skip items that are just intro text
        original_lower = original_text.lower()
        if ('detailed analysis' in original_lower or 
            'here\'s' in original_lower or
            'analysis of' in original_lower):
            continue
        
        # Clean up options
        complete_options = []
        for option in [option1, option2]:
            option_text = option.strip()
            if (len(option_text) > 15 and 
                not option_text.endswith('...') and 
                not option_text.endswith('..') and
                not option_text.endswith('etc') and
                not option_text.endswith('etc.')):
                complete_options.append(option_text)
        
        if len(complete_options) >= 2:
            items.append({
                "original": original_text,
                "grade": grade,
                "feedback": feedback,
                "options": complete_options
            })
    
    return items 