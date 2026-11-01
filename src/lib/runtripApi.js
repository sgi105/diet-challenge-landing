import { supabase } from './applyApi';
import { savedUtm } from './alertApi';

// [785] 런트립 외부 신청 — 비로그인이라 RPC runtrip_apply 로만 쓴다(번호 형식·마감일은 서버가 검사).
export async function submitRuntripApplication({ name, phone, option }) {
  const utm = savedUtm();
  const { error } = await supabase.rpc('runtrip_apply', {
    p_name: name,
    p_phone: phone,
    p_option: option,
    p_utm_source: utm.utm_source,
    p_utm_medium: utm.utm_medium,
    p_utm_campaign: utm.utm_campaign,
  });
  if (error) throw error;
}
