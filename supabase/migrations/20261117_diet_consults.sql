-- /diet 애슬릿 프로그램 1:1 상담 신청 (가인 2026-11-17)
--   런클럽 알림 신청(cohort_alerts)과 섞지 않는다 — send-alert-sms.mjs 가 그 표 전체에 문자를 보낸다.
--   신청은 diet_consult_apply() 하나로만 들어온다(anon 직접 INSERT 없음). 저장 → 가인 문자(답변 전부) → 신청자 접수 문자.
--   문자 실패가 신청을 막으면 안 되니 예외는 삼키고, 결과(요청 id 또는 에러)를 행에 남긴다 — 조용한 실패 추적용.

CREATE TABLE IF NOT EXISTS public.diet_consults (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 20),
  phone text NOT NULL CHECK (char_length(phone) BETWEEN 6 AND 30),
  phone_country text NOT NULL DEFAULT 'KR' CHECK (phone_country IN ('KR', 'INTL')),
  gender text CHECK (gender IN ('female', 'male')),
  age int CHECK (age BETWEEN 10 AND 99),
  spent_range text CHECK (char_length(spent_range) <= 40),
  spent_on text[] NOT NULL DEFAULT '{}',
  tried text[] NOT NULL DEFAULT '{}',
  hardest text CHECK (char_length(hardest) <= 40),
  worry text CHECK (char_length(worry) <= 500),
  utm_source text, utm_medium text, utm_campaign text,
  coach_sms text,      -- 가인 문자: net 요청 id 또는 'error: ...'
  applicant_sms text,  -- 신청자 문자: net 요청 id · 'skipped: ...' · 'error: ...'
  contacted_at timestamptz,
  memo text
);

ALTER TABLE public.diet_consults ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "coach select diet_consults" ON public.diet_consults;
CREATE POLICY "coach select diet_consults" ON public.diet_consults FOR SELECT
  USING (auth.uid() = ANY (ARRAY['02d34f88-ba89-4253-8b7d-f2189948ca71'::uuid, 'e26e7606-ff68-4136-8d91-16ab950e21b8'::uuid]));
DROP POLICY IF EXISTS "coach update diet_consults" ON public.diet_consults;
CREATE POLICY "coach update diet_consults" ON public.diet_consults FOR UPDATE
  USING (auth.uid() = ANY (ARRAY['02d34f88-ba89-4253-8b7d-f2189948ca71'::uuid, 'e26e7606-ff68-4136-8d91-16ab950e21b8'::uuid]));

CREATE OR REPLACE FUNCTION public.diet_consult_apply(
  p_name text, p_phone text, p_phone_country text,
  p_gender text, p_age int, p_spent_range text, p_spent_on text[], p_tried text[],
  p_hardest text, p_worry text,
  p_utm_source text DEFAULT NULL, p_utm_medium text DEFAULT NULL, p_utm_campaign text DEFAULT NULL
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name text := left(btrim(coalesce(p_name, '')), 20);
  v_country text := CASE WHEN p_phone_country = 'INTL' THEN 'INTL' ELSE 'KR' END;
  v_digits text := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
  v_phone text;
  v_id uuid;
  v_req bigint;
  v_body text;
BEGIN
  IF v_name = '' THEN RAISE EXCEPTION 'name_required'; END IF;
  IF v_country = 'KR' AND v_digits !~ '^01[016789][0-9]{7,8}$' THEN RAISE EXCEPTION 'invalid_phone'; END IF;
  IF v_country = 'INTL' AND char_length(v_digits) < 7 THEN RAISE EXCEPTION 'invalid_phone'; END IF;
  v_phone := CASE WHEN v_country = 'KR'
    THEN substr(v_digits, 1, 3) || '-' || substr(v_digits, 4, char_length(v_digits) - 7) || '-' || right(v_digits, 4)
    ELSE left(btrim(p_phone), 30) END;

  -- 같은 번호가 10분 안에 또 내면(뒤로 가기·두 번 누름) 새로 저장하지 않고 문자도 안 보낸다.
  IF EXISTS (SELECT 1 FROM diet_consults
             WHERE regexp_replace(phone, '[^0-9]', '', 'g') = v_digits AND created_at > now() - interval '10 minutes') THEN
    RETURN true;
  END IF;

  INSERT INTO diet_consults (name, phone, phone_country, gender, age, spent_range, spent_on, tried, hardest, worry,
                             utm_source, utm_medium, utm_campaign)
  VALUES (v_name, v_phone, v_country,
          CASE WHEN p_gender IN ('female', 'male') THEN p_gender END,
          CASE WHEN p_age BETWEEN 10 AND 99 THEN p_age END,
          left(p_spent_range, 40),
          coalesce((SELECT array_agg(left(x, 40)) FROM unnest(p_spent_on[1:10]) x), '{}'),
          coalesce((SELECT array_agg(left(x, 40)) FROM unnest(p_tried[1:10]) x), '{}'),
          left(p_hardest, 40), left(p_worry, 500),
          left(p_utm_source, 100), left(p_utm_medium, 100), left(p_utm_campaign, 200))
  RETURNING id INTO v_id;

  -- ① 가인에게 답변 전부. 본문 첫 글자 U+3164 = 쏘다가 앞 줄바꿈을 잘라 [Web발신] 뒤에 붙는 것 방지.
  v_body := U&'\3164' || E'\n[애슬릿 상담 신청]\n'
    || v_name || ' · ' || coalesce(CASE p_gender WHEN 'female' THEN '여' WHEN 'male' THEN '남' END, '-')
    || ' · ' || coalesce(p_age::text || '세', '-') || E'\n'
    || v_phone || CASE WHEN v_country = 'INTL' THEN ' (해외)' ELSE '' END || E'\n\n'
    || '쓴 돈: ' || coalesce(p_spent_range, '-') || E'\n'
    || '쓴 곳: ' || coalesce(array_to_string(p_spent_on, ', '), '-') || E'\n'
    || '해본 것: ' || coalesce(array_to_string(p_tried, ', '), '-') || E'\n'
    || '제일 어려움: ' || coalesce(p_hardest, '-') || E'\n\n'
    || '걱정: ' || coalesce(left(p_worry, 500), '-');
  BEGIN
    SELECT send_sms_ssodaa('01042403121', v_body, '애슬릿 상담 신청 · ' || v_name) INTO v_req;
    UPDATE diet_consults SET coach_sms = v_req::text WHERE id = v_id;
  EXCEPTION WHEN OTHERS THEN
    UPDATE diet_consults SET coach_sms = 'error: ' || left(SQLERRM, 200) WHERE id = v_id;
  END;

  -- ② 신청자 접수 문자 — 한국 번호만. 테스트 번호(010-9999-9999)는 건너뛴다.
  IF v_country <> 'KR' THEN
    UPDATE diet_consults SET applicant_sms = 'skipped: intl' WHERE id = v_id;
  ELSIF v_digits = '01099999999' THEN
    UPDATE diet_consults SET applicant_sms = 'skipped: test' WHERE id = v_id;
  ELSE
    BEGIN
      SELECT send_sms_ssodaa(
        v_digits,
        U&'\3164' || E'\n[TARZAN] ' || v_name || ', 애슬릿 프로그램 상담 신청 잘 받았어. 신청서 내가 직접 읽어보고 이 번호로 연락할게. - 타잔',
        '애슬릿 프로그램 상담 신청 접수'
      ) INTO v_req;
      UPDATE diet_consults SET applicant_sms = v_req::text WHERE id = v_id;
    EXCEPTION WHEN OTHERS THEN
      UPDATE diet_consults SET applicant_sms = 'error: ' || left(SQLERRM, 200) WHERE id = v_id;
    END;
  END IF;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.diet_consult_apply(text, text, text, text, int, text, text[], text[], text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.diet_consult_apply(text, text, text, text, int, text, text[], text[], text, text, text, text, text) TO anon, authenticated;
