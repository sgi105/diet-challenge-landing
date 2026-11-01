-- [785] 런트립 외부 신청 알림을 코치 메시지 대신 가인 휴대폰 문자로 보낸다.
--   문자 실패가 신청을 막으면 안 되니 예외는 삼키고 경고만 남긴다. 신청 행은 그대로 저장.
ALTER TABLE public.runtrip_applications
  ADD COLUMN IF NOT EXISTS gender text CHECK (gender IN ('male', 'female')),
  ADD COLUMN IF NOT EXISTS age int CHECK (age BETWEEN 14 AND 99);

DROP FUNCTION IF EXISTS public.runtrip_apply(text, text, text, text, text, text);

CREATE OR REPLACE FUNCTION public.runtrip_apply(
  p_name text, p_phone text, p_option text,
  p_utm_source text DEFAULT NULL, p_utm_medium text DEFAULT NULL, p_utm_campaign text DEFAULT NULL,
  p_gender text DEFAULT NULL, p_age int DEFAULT NULL
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name text := btrim(p_name);
  v_phone text := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
  v_id uuid;
BEGIN
  IF now() >= timestamptz '2026-11-05 00:00:00+09' THEN
    RAISE EXCEPTION 'runtrip_closed';
  END IF;

  INSERT INTO runtrip_applications (name, phone, option, gender, age, utm_source, utm_medium, utm_campaign)
  VALUES (v_name, v_phone, p_option, p_gender, p_age, left(p_utm_source, 100), left(p_utm_medium, 100), left(p_utm_campaign, 200))
  ON CONFLICT (phone) DO NOTHING
  RETURNING id INTO v_id;

  IF v_id IS NULL THEN
    RETURN false;
  END IF;

  -- 본문 첫 글자는 U+3164. 쏘다가 앞의 줄바꿈을 잘라서 [Web발신] 뒤에 붙지 않게 넣는다.
  BEGIN
    PERFORM send_sms_ssodaa(
      '01042403121',
      U&'\3164' || E'\n[런트립 외부 신청]\n' || left(v_name, 10) || ' '
        || CASE p_gender WHEN 'male' THEN '남 ' WHEN 'female' THEN '여 ' ELSE '' END
        || coalesce(p_age || '세 ', '') || v_phone || E'\n'
        || CASE p_option WHEN 'full' THEN '풀코스 29만원' ELSE '1박2일 19만원' END,
      NULL
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'runtrip_apply coach sms failed: %', SQLERRM;
  END;

  -- 신청자 입금 안내. 발신 번호가 가인 번호라 답장이 바로 간다.
  BEGIN
    PERFORM send_sms_ssodaa(
      v_phone,
      U&'\3164' || E'\n런트립에 온 걸 환영해!\n정말 좋은 시간이 될 수 있도록 열심히 준비하고 있으니 기대해 :)\n\n'
        || '1000 2641 8699 토스뱅크 신가인으로 '
        || CASE p_option WHEN 'full' THEN '29만원' ELSE '19만원' END
        || E' 오늘까지 입금 부탁할게!\n\n입금 하고 ''입금 완료''라고 이 번호로 문자 하나만 남겨줘',
      '웰니스 런트립 입금 안내'
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'runtrip_apply applicant sms failed: %', SQLERRM;
  END;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.runtrip_apply(text, text, text, text, text, text, text, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.runtrip_apply(text, text, text, text, text, text, text, int) TO anon, authenticated;
