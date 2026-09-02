-- KasirKu License Management Schema (Neon Version)
-- Simplified without RLS policies (Neon-compatible)

-- Licenses Table
CREATE TABLE IF NOT EXISTS licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_key TEXT NOT NULL UNIQUE,
  device_id TEXT,
  device_name TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACTIVE', 'REVOKED')),
  activated_at TIMESTAMP WITH TIME ZONE,
  reset_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_licenses_license_key ON licenses(license_key);
CREATE INDEX IF NOT EXISTS idx_licenses_device_id ON licenses(device_id);
CREATE INDEX IF NOT EXISTS idx_licenses_status ON licenses(status);
CREATE INDEX IF NOT EXISTS idx_licenses_created_at ON licenses(created_at DESC);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_licenses_updated_at ON licenses;
CREATE TRIGGER update_licenses_updated_at
BEFORE UPDATE ON licenses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Activation Logs (Optional - untuk audit trail)
CREATE TABLE IF NOT EXISTS activation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_key TEXT NOT NULL,
  device_id TEXT NOT NULL,
  device_name TEXT,
  action TEXT NOT NULL CHECK (action IN ('ACTIVATE', 'RESET', 'REVOKE')),
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT TRUE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activation_logs_license_key ON activation_logs(license_key);
CREATE INDEX IF NOT EXISTS idx_activation_logs_created_at ON activation_logs(created_at DESC);

-- Sample data (Optional - untuk testing)
INSERT INTO licenses (license_key, status) VALUES
  ('KASIR-TEST-1234-5678', 'PENDING'),
  ('KASIR-DEMO-ABCD-EFGH', 'PENDING')
ON CONFLICT (license_key) DO NOTHING;
