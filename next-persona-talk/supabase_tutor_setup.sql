-- ============================================
-- AI学習チューター: テーブル作成SQL
-- Supabase SQL Editor で実行してください
-- ============================================

-- 1. テーブル作成
CREATE TABLE IF NOT EXISTS tutor_learning_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  evaluation TEXT NOT NULL CHECK (evaluation IN ('A', 'B', 'C', 'D')),
  full_conversation JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. インデックス作成（検索高速化）
CREATE INDEX IF NOT EXISTS idx_tutor_logs_user_id ON tutor_learning_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_tutor_logs_created_at ON tutor_learning_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tutor_logs_subject ON tutor_learning_logs(subject);

-- 3. Row Level Security (RLS) 有効化
ALTER TABLE tutor_learning_logs ENABLE ROW LEVEL SECURITY;

-- 4. RLS ポリシー: 自分の記録の読み取り
CREATE POLICY "Users can read own logs"
  ON tutor_learning_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- 5. RLS ポリシー: 自分の記録の作成
CREATE POLICY "Users can insert own logs"
  ON tutor_learning_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 6. (オプション) 管理者は全記録閲覧可能にする場合:
-- 管理者用のポリシーを追加する場合は以下のコメントを外してください。
-- 事前に管理者ロールを設定する必要があります。
--
-- CREATE POLICY "Admins can read all logs"
--   ON tutor_learning_logs
--   FOR SELECT
--   USING (
--     EXISTS (
--       SELECT 1 FROM auth.users
--       WHERE auth.users.id = auth.uid()
--       AND auth.users.raw_user_meta_data->>'role' = 'admin'
--     )
--   );
