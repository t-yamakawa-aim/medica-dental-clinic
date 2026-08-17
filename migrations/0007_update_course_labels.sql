-- コース表示名の更新
-- ・初診: 変更なし（既に「初診」）
-- ・初診メンテナンス → 初診メンテナンス・歯科検診
UPDATE course_settings SET label = '初診' WHERE course_type = 'initial_doctor';
UPDATE course_settings SET label = '初診メンテナンス・歯科検診' WHERE course_type = 'initial_maintenance';
