-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for audit_logs
CREATE POLICY "Enable read access for authenticated users" ON audit_logs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users" ON audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policies for users table
CREATE POLICY "Users can read their own data" ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Grant necessary permissions to authenticated users
GRANT SELECT ON audit_logs TO authenticated;
GRANT INSERT ON audit_logs TO authenticated;
GRANT SELECT ON users TO authenticated;