-- [849] 하프 연장(시즌6) 토스 결제위젯 자동 확정 — 결제 페이지 challenge.samuraihabits.com/half/pay (랜딩 프로젝트)
--   서버(api/half-pay.js, Vercel icn1, service_role)만 부른다. anon·authenticated 실행 권한 없음.
--   기존 half_s6_apply / half_s6_mark / half_s6_status 는 건드리지 않는다(런클럽 feat/849 소유).

-- 결제 대상 찾기: 앱에서 넘어온 user_id(?u=) 또는 휴대폰 번호
CREATE OR REPLACE FUNCTION public.half_s6_pay_lookup(p_uid uuid DEFAULT NULL, p_phone text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_uid uuid := p_uid;
  v_digits text := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
  v_n int;
  o half_orders_s6;
  v_name text;
BEGIN
  IF v_uid IS NULL THEN
    IF length(v_digits) < 10 THEN RETURN jsonb_build_object('found', false, 'reason', 'no_key'); END IF;
    SELECT count(*), min(p.id::text)::uuid INTO v_n, v_uid
      FROM profiles p JOIN half_orders_s6 h ON h.user_id = p.id
     WHERE regexp_replace(coalesce(p.phone, ''), '\D', '', 'g') = v_digits;
    IF v_n <> 1 THEN RETURN jsonb_build_object('found', false, 'reason', CASE WHEN v_n = 0 THEN 'no_order' ELSE 'ambiguous' END); END IF;
  END IF;
  SELECT * INTO o FROM half_orders_s6 WHERE user_id = v_uid;
  IF NOT FOUND THEN RETURN jsonb_build_object('found', false, 'reason', 'no_order'); END IF;
  SELECT full_name INTO v_name FROM profiles WHERE id = v_uid;
  RETURN jsonb_build_object(
    'found', true, 'uid', o.user_id, 'name', coalesce(v_name, ''),
    'phone', (SELECT regexp_replace(coalesce(phone, ''), '\D', '', 'g') FROM profiles WHERE id = v_uid),
    'amount', o.amount, 'phase', o.phase, 'paid', o.paid_at IS NOT NULL,
    'cancelled', o.cancelled_at IS NOT NULL, 'live', half_s6_live(o),
    'deadline', half_s6_pay_deadline(o.applied_at), 'seat_no', half_s6_seat_no(o.user_id));
END $$;

-- 토스 승인 직후 확정: paid_at = 토스 승인 시각. 확정 메시지(멤버) + 결제 알림(코치 1:1) 자동
CREATE OR REPLACE FUNCTION public.half_s6_mark_toss(p_uid uuid, p_order_id text, p_payment_key text,
  p_amount int, p_approved_at timestamptz, p_method text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_coach uuid := '02d34f88-ba89-4253-8b7d-f2189948ca71';
  v_paid timestamptz := coalesce(p_approved_at, now());
BEGIN
  UPDATE half_orders_s6
     SET paid_at = v_paid, confirmed_by = NULL,
         note = left(concat_ws(' · ', nullif(note, ''), '토스 ' || coalesce(p_method, '') || ' ' || p_order_id), 500)
   WHERE user_id = p_uid AND cancelled_at IS NULL AND paid_at IS NULL AND amount = p_amount;
  IF NOT FOUND THEN RETURN jsonb_build_object('updated', false); END IF;
  -- 멤버에게: 확정 안내 (half_s6_mark 'paid' 와 같은 문구)
  INSERT INTO coach_messages (user_id, sender_id, content, is_coach)
  VALUES (p_uid, v_coach, E'✅ 결제 확인 · 하프 확정\n\n1/23(토) 오전 9시 북극곰 마라톤', true);
  INSERT INTO notifications (actor_id, user_id, type, post_id) VALUES (v_coach, p_uid, 'message', null);
  -- 코치에게: 멤버 명의 '결제 완료' (원래 멤버가 직접 남기던 메시지 대신)
  INSERT INTO coach_messages (user_id, sender_id, content)
  VALUES (p_uid, p_uid, '[하프 결제 완료 💳] ' || (p_amount / 10000)::text || '만원 · ' || coalesce(p_method, '토스') || ' (자동 확인)');
  INSERT INTO notifications (actor_id, user_id, type, post_id) VALUES (p_uid, v_coach, 'message', null);
  RETURN jsonb_build_object('updated', true, 'seat_no', half_s6_seat_no(p_uid));
END $$;

REVOKE ALL ON FUNCTION public.half_s6_pay_lookup(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.half_s6_mark_toss(uuid, text, text, int, timestamptz, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.half_s6_pay_lookup(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.half_s6_mark_toss(uuid, text, text, int, timestamptz, text) TO service_role;
