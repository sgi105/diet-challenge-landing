import { useEffect, useState } from 'react';
import { countApplicantsPublic, getCachedCount } from '../lib/applyApi';
import { COHORT2 } from '../data/config2';

// 코호트 신청자수 폴링(60초). 캐시값으로 즉시 시작 후 백그라운드 갱신. enabled=false면 호출 안 함.
export function useApplicantCount(enabled = true) {
  const [count, setCount] = useState(getCachedCount);
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    async function load() {
      try {
        const n = await countApplicantsPublic(COHORT2.cohortCode);
        if (alive) setCount(n);
      } catch { /* ignore */ }
    }
    load();
    const t = setInterval(load, 60000);
    return () => { alive = false; clearInterval(t); };
  }, [enabled]);
  return count;
}
