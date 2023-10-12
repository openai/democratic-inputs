# Database Documentation
The `questions` and `answers` tables are designed to store information about experiments, users, and their interactions. The `questions` table keeps records of different questions presented to users in various experiments, along with metadata such as `step` and `question_type`.

The `answers` table stores responses given by users, also including metadata like `choice` and `text`.

Both tables are defined and interacted with through two Python files: `database.py` for the production code, which uses SQLAlchemy and PostgreSQL, and `mock_database.py` for testing, which uses Python dictionaries. 
