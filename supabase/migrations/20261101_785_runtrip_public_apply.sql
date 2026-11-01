-- [785] 런트립 외부 신청 — 비로그인 방문자는 runtrip_apply() 로만 쓴다. 테이블 직접 접근은 코치만.
--   같은 번호 재신청은 무시(첫 신청 유지). 코치 알림은 코치 본인 대화에 남긴다.
CREATE TABLE IF NOT EXISTS public.runtrip_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 30),
  phone text NOT NULL UNIQUE CHECK (phone ~ '^01[0-9]{8,9}$'),
  option text NOT NULL CHECK (option IN ('full', 'weekend')),
  utm_source text,
  utm_medium text,
  utm_campaign text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.runtrip_applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS runtrip_applications_coach_all ON public.runtrip_applications;
CREATE POLICY runtrip_applications_coach_all ON public.runtrip_applications
  FOR ALL USING ((SELECT is_coach())) WITH CHECK ((SELECT is_coach()));

CREATE OR REPLACE FUNCTION public.runtrip_apply(
  p_name text, p_phone text, p_option text,
  p_utm_source text DEFAULT NULL, p_utm_medium text DEFAULT NULL, p_utm_campaign text DEFAULT NULL
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  coach_id constant uuid := '02d34f88-ba89-4253-8b7d-f2189948ca71';
  v_name text := btrim(p_name);
  v_phone text := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
  v_id uuid;
BEGIN
  IF now() >= timestamptz '2026-11-05 00:00:00+09' THEN
    RAISE EXCEPTION 'runtrip_closed';
  END IF;

  INSERT INTO runtrip_applications (name, phone, option, utm_source, utm_medium, utm_campaign)
  VALUES (v_name, v_phone, p_option, left(p_utm_source, 100), left(p_utm_medium, 100), left(p_utm_campaign, 200))
  ON CONFLICT (phone) DO NOTHING
  RETURNING id INTO v_id;

  IF v_id IS NULL THEN
    RETURN false;
  END IF;

  INSERT INTO coach_messages (user_id, sender_id, content)
  VALUES (coach_id, coach_id, E'[외부 런트립 신청]\n' || v_name || ' · ' || v_phone || E'\n'
    || CASE p_option WHEN 'full' THEN '풀코스 2박 3일 · 29만원' ELSE '주말 1박 2일 · 19만원' END);

  INSERT INTO notifications (actor_id, user_id, type, post_id)
  VALUES (coach_id, coach_id, 'message', NULL);

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.runtrip_apply(text, text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.runtrip_apply(text, text, text, text, text, text) TO anon, authenticated;

REVOKE ALL ON public.runtrip_applications FROM anon;
