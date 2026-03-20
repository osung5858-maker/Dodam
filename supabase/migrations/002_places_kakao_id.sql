-- 카카오맵 장소 ID를 places에 연동
ALTER TABLE places ADD COLUMN IF NOT EXISTS kakao_id TEXT UNIQUE;

-- 리뷰의 place_id FK를 nullable로 변경하고, kakao_place_id 컬럼 추가
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS kakao_place_id TEXT;
ALTER TABLE reviews ALTER COLUMN place_id DROP NOT NULL;

-- 리뷰 RLS: kakao_place_id 기반도 허용
DROP POLICY IF EXISTS "reviews_insert" ON reviews;
CREATE POLICY "reviews_insert" ON reviews FOR INSERT WITH CHECK (user_id = auth.uid());

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_reviews_kakao ON reviews(kakao_place_id);
CREATE INDEX IF NOT EXISTS idx_places_kakao ON places(kakao_id);
