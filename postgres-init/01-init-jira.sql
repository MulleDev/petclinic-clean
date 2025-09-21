-- Jira Database Setup
CREATE USER jira WITH PASSWORD 'jira123';
CREATE DATABASE jiradb WITH OWNER jira ENCODING 'UTF8' LC_COLLATE = 'en_US.utf8' LC_CTYPE = 'en_US.utf8';
GRANT ALL PRIVILEGES ON DATABASE jiradb TO jira;

-- Switch to jiradb
\c jiradb jira;

-- Set up schema permissions
GRANT ALL ON SCHEMA public TO jira;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO jira;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO jira;
