import os
import sqlite3
import tempfile
import unittest
import pandas as pd

import db
import resume
from db import init_db
from resume import get_latest_resume_content, save_parsed_data_to_db

class TestResumeFunctions(unittest.TestCase):
    def setUp(self):
        self.tmpdir = tempfile.TemporaryDirectory()
        self.db_path = os.path.join(self.tmpdir.name, "test.db")
        # Override both modules’ DB_PATH
        db.DB_PATH = self.db_path
        resume.DB_PATH = self.db_path

    def tearDown(self):
        self.tmpdir.cleanup()

    def test_init_db(self):
        init_db()
        conn = sqlite3.connect(db.DB_PATH)
        c = conn.cursor()
        c.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = {row[0] for row in c.fetchall()}
        conn.close()

        self.assertIn("raw_resume", tables)
        self.assertIn("questionnaire", tables)

    def test_get_latest_resume_content(self):
        init_db()
        conn = sqlite3.connect(db.DB_PATH)
        c = conn.cursor()
        sample = "Hello, world!"
        c.execute(
            "INSERT INTO raw_resume (id, file_path, content) VALUES (?, ?, ?)",
            (1, "dummy.pdf", sample)
        )
        conn.commit()
        conn.close()

        self.assertEqual(get_latest_resume_content(1), sample)
        self.assertEqual(get_latest_resume_content(9999), "")

    def test_save_parsed_data_to_db(self):
        sample = {
            "education": "B.S. in CS, KU (2024)",
            "experience": "Intern at FooCorp, Summer 2023",
            "skills": "Python, SQL, Git",
            "projects": "Resume Parser"
        }
        #:memory is an in-memory database that only exists when the code runs
        df = save_parsed_data_to_db(sample, db_url=":memory:")
        self.assertIsInstance(df, pd.DataFrame)
        self.assertEqual(len(df), 1)
        self.assertCountEqual(df.columns.tolist(), sample.keys())

if __name__ == "__main__":
    unittest.main()
