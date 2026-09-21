import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/applyApi';

// 알림 문자 수신 해제 (/off?id=<신청 id>) — 문자 맨 아래 링크로 들어온다.
// 링크에 들어있는 id 는 신청 한 건을 가리키는 임의의 값이라 남의 것을 추측해서 끌 수 없다.
// 지우지 않고 unsubscribed_at 만 찍는다 — 다음 기수 발송 대상에서 빠지고, 기록은 남는다.
export default function UnsubscribePage() {
  const [params] = useSearchParams();
  const id = params.get('id');
  const [state, setState] = useState(id ? 'working' : 'bad'); // working | done | bad | error

  useEffect(() => {
    if (!id) return;
    let alive = true;
    supabase
      .rpc('unsubscribe_cohort_alert', { p_id: id })
      .then(({ error }) => {
        if (!alive) return;
        setState(error ? 'error' : 'done');
      });
    return () => { alive = false; };
  }, [id]);

  return (
    <div className="min-h-dvh bg-bg-primary flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        {state === 'working' && <p className="text-text-secondary">처리 중...</p>}

        {state === 'done' && (
          <>
            <h1 className="font-kr text-2xl font-black text-text-primary mb-3">알림 해제 완료</h1>
            <p className="text-text-secondary text-sm leading-relaxed">
              앞으로 다음 기수 오픈 문자를 보내지 않을게.
              <br />
              마음 바뀌면 언제든 다시 신청하면 돼.
            </p>
          </>
        )}

        {(state === 'bad' || state === 'error') && (
          <>
            <h1 className="font-kr text-2xl font-black text-text-primary mb-3">해제하지 못했어</h1>
            <p className="text-text-secondary text-sm leading-relaxed">
              링크가 잘못됐거나 만료됐어.
              <br />
              문자로 답장 주면 직접 빼줄게.
            </p>
          </>
        )}

        <Link to="/" className="inline-block mt-8 text-text-muted text-sm underline">
          홈으로
        </Link>
      </div>
    </div>
  );
}
