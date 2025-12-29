-- Create image_history table
CREATE TABLE IF NOT EXISTS image_history (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  timestamp BIGINT NOT NULL,
  prompt TEXT NOT NULL,
  result_image TEXT NOT NULL,
  original_image TEXT,
  type VARCHAR(20) NOT NULL CHECK (type IN ('generation', 'edit')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries by user_id
CREATE INDEX IF NOT EXISTS idx_image_history_user_id ON image_history(user_id);
-- Create index for sorting by timestamp
CREATE INDEX IF NOT EXISTS idx_image_history_timestamp ON image_history(timestamp DESC);