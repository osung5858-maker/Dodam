-- 이벤트 타입 확장: 기존 6종 → 12종
-- feed, sleep, poop, pee, temp, memo (기존)
-- + bath, pump, babyfood, snack, toddler_meal, medication (신규)

-- CHECK 제약 제거 후 새로 추가
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_type_check;
ALTER TABLE events ADD CONSTRAINT events_type_check
  CHECK (type IN (
    'feed',         -- 모유/분유
    'sleep',        -- 수면 (밤잠/낮잠)
    'poop',         -- 대변
    'pee',          -- 소변
    'temp',         -- 체온
    'memo',         -- 일반 메모 (하위호환)
    'bath',         -- 목욕
    'pump',         -- 유축
    'babyfood',     -- 이유식
    'snack',        -- 간식
    'toddler_meal', -- 유아식
    'medication'    -- 투약
  ));

-- 기존 memo 중 목욕 기록을 bath로 마이그레이션
UPDATE events SET type = 'bath' WHERE type = 'memo' AND tags->>'memoType' = 'bath';

-- 기존 memo 중 투약 기록을 medication으로 마이그레이션
UPDATE events SET type = 'medication' WHERE type = 'memo' AND tags->>'memoType' IS NULL;

-- 기존 feed 중 이유식을 babyfood로 마이그레이션
UPDATE events SET type = 'babyfood' WHERE type = 'feed' AND tags->>'feedType' = 'babyfood';

-- 기존 feed 중 간식을 snack으로 마이그레이션
UPDATE events SET type = 'snack' WHERE type = 'feed' AND tags->>'feedType' = 'snack';

-- 기존 feed 중 유아식을 toddler_meal로 마이그레이션
UPDATE events SET type = 'toddler_meal' WHERE type = 'feed' AND tags->>'feedType' = 'toddler_meal';
