/*
  # Terms Agreements Tracking

  1. New Tables
    - `terms_agreements`
      - `id` (uuid, primary key) - Unique identifier for each agreement
      - `ip_address` (text) - IP address of user who agreed
      - `user_agent` (text) - Browser/device information
      - `agreed_at` (timestamptz) - Timestamp when terms were agreed to
      - `created_at` (timestamptz) - Record creation timestamp
  
  2. Security
    - Enable RLS on `terms_agreements` table
    - Add policy for public insert (to allow users to record their agreement)
    - No read/update/delete policies (admin only access through service role)

  3. Purpose
    - Tracks who has agreed to terms and conditions
    - Prevents unauthorized use of the demo
    - Maintains audit trail of agreements
*/

CREATE TABLE IF NOT EXISTS terms_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  user_agent text NOT NULL,
  agreed_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE terms_agreements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can record their agreement"
  ON terms_agreements
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_terms_agreements_ip ON terms_agreements(ip_address);
CREATE INDEX IF NOT EXISTS idx_terms_agreements_agreed_at ON terms_agreements(agreed_at);