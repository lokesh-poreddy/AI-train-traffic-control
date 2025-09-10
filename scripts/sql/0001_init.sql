-- Minimal schema aligned to spec (subset for demo)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  role TEXT,
  last_login TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trains (
  id SERIAL PRIMARY KEY,
  train_no TEXT UNIQUE,
  type TEXT,
  priority INT,
  length INT,
  max_speed INT
);

CREATE TABLE IF NOT EXISTS sections (
  id SERIAL PRIMARY KEY,
  name TEXT,
  length_m INT,
  capacity INT,
  junctions JSONB
);

CREATE TABLE IF NOT EXISTS recommendations (
  id SERIAL PRIMARY KEY,
  rec_uuid UUID,
  generated_by TEXT,
  metric_score FLOAT,
  payload JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  status TEXT
);

CREATE TABLE IF NOT EXISTS approvals (
  id SERIAL PRIMARY KEY,
  rec_id UUID,
  requested_by TEXT,
  approved_by TEXT,
  status TEXT,
  comments TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INT,
  action_type TEXT,
  action_payload JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recommendations_rec_uuid ON recommendations(rec_uuid);
CREATE INDEX IF NOT EXISTS idx_audit_logs_time ON audit_logs(timestamp);
