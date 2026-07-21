import { useState } from 'react';
import { PRESEASON } from '../data/configPre';

// 프리시즌 상태 훅 — 코호트 DB row가 아직 없어도 안전하게 동작한다.
// 무료 프리시즌은 선착순·정원·마감 로직이 없어 항상 'open'을 반환.
// (추후 마감/정원 로직이 필요하면 여기서 확장. 어떤 경우에도 throw 하지 않게 방어적으로 유지.)
export function useSeasonPreStatus() {
  const [status] = useState('open');
  return {
    status,
    isOpen: status === 'open',
    isFree: PRESEASON.isFree,
    cohortCode: PRESEASON.cohortCode,
  };
}

export default useSeasonPreStatus;
