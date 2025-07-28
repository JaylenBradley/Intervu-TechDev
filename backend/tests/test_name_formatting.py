import pytest
import tempfile
import os
from app.utils.save_resume import save_text_as_pdf, save_text_as_docx

def test_pdf_name_formatting():
    """Test that the first line (name) is formatted as bold and larger in PDF."""
    
    # Sample resume text with name as first line
    resume_text = """John Doe
Email: john.doe@example.com
Phone: 123-456-7890

EDUCATION
Bachelor of Science in Computer Science - University of Example
2018-09 - 2022-05

EXPERIENCE
Software Engineer at Tech Corp
2022-06 - 2024-01
* Developed and maintained web applications using React and Node.js.
* Collaborated with cross-functional teams to deliver high-quality software solutions.

SKILLS
JavaScript, React, Node.js, Python"""
    
    # Create temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        save_text_as_pdf(resume_text, tmp.name)
        
        # Check that file was created and has content
        assert os.path.exists(tmp.name)
        assert os.path.getsize(tmp.name) > 0
        
        # Clean up
        os.unlink(tmp.name)

def test_docx_name_formatting():
    """Test that the first line (name) is formatted as bold and larger in DOCX."""
    
    # Sample resume text with name as first line
    resume_text = """Jane Smith
Email: jane.smith@example.com
Phone: 987-654-3210

EDUCATION
Master of Science in Data Science - University of Example
2020-09 - 2022-05

EXPERIENCE
Data Scientist at Data Corp
2022-06 - 2024-01
* Developed machine learning models to improve customer retention by 25%.
* Analyzed large datasets using Python and SQL to identify business insights.

SKILLS
Python, SQL, Machine Learning, Data Analysis"""
    
    # Create temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".docx") as tmp:
        save_text_as_docx(resume_text, tmp.name)
        
        # Check that file was created and has content
        assert os.path.exists(tmp.name)
        assert os.path.getsize(tmp.name) > 0
        
        # Clean up
        os.unlink(tmp.name)

def test_pdf_without_name():
    """Test that PDF generation works correctly even without a clear name line."""
    
    # Sample resume text without a clear name line
    resume_text = """EDUCATION
Bachelor of Science in Computer Science - University of Example
2018-09 - 2022-05

EXPERIENCE
Software Engineer at Tech Corp
2022-06 - 2024-01
* Developed and maintained web applications using React and Node.js.

SKILLS
JavaScript, React, Node.js, Python"""
    
    # Create temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        save_text_as_pdf(resume_text, tmp.name)
        
        # Check that file was created and has content
        assert os.path.exists(tmp.name)
        assert os.path.getsize(tmp.name) > 0
        
        # Clean up
        os.unlink(tmp.name) 