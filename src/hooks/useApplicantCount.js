import { useEffect, useState } from 'react';
import { listApplicantsPublic } from '../lib/applyApi';
import { COHORT2 } from '../data/config2';

// 코호트 신청자수 폴링(60초). enabled=false면 호출 안 함. 미정이면 null.
export function useApplicantCount(enabled = true) {
  const [count, setCount] = useState(null);
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    async function load() {
      try {
        const json = await listApplicantsPublic(COHORT2.cohortCode);
        if (alive) setCount(json?.count ?? null);
      } catch { /* ignore */ }
    }
    load();
    const t = setInterval(load, 60000);
    return () => { alive = false; clearInterval(t); };
  }, [enabled]);
  return count;
}
