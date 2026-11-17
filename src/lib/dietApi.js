import { supabase } from './applyApi';
import { savedUtm } from './alertApi';

// /diet 상담 신청 — diet_consult_apply() 하나로 저장 + 가인 문자 + 신청자 접수 문자(DB가 보냄).
export async function submitDietConsult(a) {
  const u = savedUtm();
  const { error } = await supabase.rpc('diet_consult_apply', {
    p_name: a.name.trim(),
    p_phone: a.phone,
    p_phone_country: a.phoneCountry,
    p_gender: a.gender,
    p_age: Number(a.age) || null,
    p_spent_range: a.spentRange,
    p_spent_on: a.spentOn || [],
    p_tried: a.tried || [],
    p_hardest: a.hardest,
    p_worry: (a.worry || '').trim(),
    p_utm_source: u.utm_source,
    p_utm_medium: u.utm_medium,
    p_utm_campaign: u.utm_campaign,
  });
  if (error) {
    if (/invalid_phone/.test(error.message)) throw new Error('번호 형식이 맞지 않아. 다시 확인해줘.');
    throw new Error('신청 중 문제가 생겼어. 잠시 뒤 다시 해줘.');
  }
}
