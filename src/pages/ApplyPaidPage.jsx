import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { track } from '@vercel/analytics';
import { ACTIVE } from '../data/activeCohort';
import { fetchPayStatus } from '../lib/applyApi';
import { metaTrack } from '../lib/metaPixel';
import { logEvent } from '../lib/eventLog';

// 페이앱 결제 후 돌아오는 화면(returnurl). /apply/paid?id=<지원서 id>
//
// 결제 결과의 정본은 서버 통보(payapp-feedback)라서, 여기선 DB 에 결제 완료가 찍혔는지만 확인한다.
// 통보가 몇 초 늦게 올 수 있어서 잠깐 기다리며 다시 묻는다.
// 결제 완료가 확인되면 픽셀 Purchase 1회 — event_id 를 서버(CAPI)와 같은 "pay-<결제번호>" 로 맞춰 한 건으로 합친다.

const POLL_MS = 2000;
const POLL_MAX = 15; // 최대 30초

const FORM_KEYS = ['samurai-season2-apply-v1', 'samurai-season2-apply-referral-v1'];
const PENDING_PAY_KEY = `ttr_pending_pay_${ACTIVE.cohortCode}`;

function clearApplyStorage() {
  try {
    for (const k of FORM_KEYS) localStorage.removeItem(k);
    localStorage.removeItem(PENDING_PAY_KEY);
  } catch { /* ignore */ }
}

function purchaseSentOnce(mulNo) {
  const key = `ttr_purchase_sent_${mulNo}`;
  try {
    if (localStorage.getItem(key)) return false;
    localStorage.setItem(key, '1');
  } catch { /* 저장 못 해도 event_id 로 메타가 중복을 거른다 */ }
  return true;
}

export default function ApplyPaidPage() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const [status, setStatus] = useState(id ? 'checking' : 'missing'); // checking | paid | pending | cancelled | missing
  const tries = useRef(0);

  useEffect(() => {
    if (!id) return undefined;
    let timer;
    let alive = true;
    const check = async () => {
      tries.current += 1;
      let row = null;
      try { row = await fetchPayStatus(id); } catch { /* 네트워크 오류는 다시 시도 */ }
      if (!alive) return;
      if (row?.pay_state === 'paid') {
        setStatus('paid');
        clearApplyStorage();
        if (row.pay_mul_no && purchaseSentOnce(row.pay_mul_no)) {
          metaTrack('Purchase', { currency: 'KRW', value: row.pay_amount || ACTIVE.fee, content_name: 'apply_fee' }, { eventId: `pay-${row.pay_mul_no}` });
          track('apply_paid');
          logEvent('apply_paid', {});
        }
        return;
      }
      if (row?.pay_state === 'cancelled') { setStatus('cancelled'); return; }
      if (tries.current >= POLL_MAX) { setStatus('pending'); return; }
      timer = setTimeout(check, POLL_MS);
    };
    check();
    return () => { alive = false; clearTimeout(timer); };
  }, [id]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-5 py-4 flex items-center justify-between border-b border-white/10">
        <Link to="/" className="text-text-muted text-sm hover:text-accent-green transition-colors font-semibold">← 메인</Link>
        <span className="w-12" />
      </header>

      <main className="flex-1 px-6 py-12 flex flex-col">
        <div className="max-w-md mx-auto w-full text-center">
          {status === 'checking' && (
            <>
              <div className="w-14 h-14 mx-auto mb-6 rounded-full border-4 border-white/15 border-t-accent-green animate-spin" />
              <h1 className="font-kr text-2xl font-black text-text-primary mb-2">결제 확인 중</h1>
              <p className="text-text-muted text-sm">잠깐만 기다려줘. 이 화면을 닫지 마.</p>
            </>
          )}

          {status === 'paid' && (
            <>
              <div className="w-20 h-20 rounded-full bg-accent-green/20 flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="pill text-accent-green">무료 체험 확정</span>
              <h1 className="font-kr text-3xl font-black text-text-primary mt-4 mb-3 leading-tight">
                28일 무료 체험 시작!<br />같이 뛰자
              </h1>
              <p className="text-text-secondary text-sm mb-8">보증금 {ACTIVE.depositLabel} 결제가 확인됐어. 해내면 전액 돌려줄게.</p>

              <div className="bg-bg-card rounded-3xl p-6 text-left shadow-[0_12px_30px_rgba(0,0,0,0.15)] space-y-3 text-sm">
                <p className="text-card-ink font-extrabold">다음 순서</p>
                {/* 결제 후 안내는 단톡방 하나로(가인 2026-10-22) — 앱 입장·OT 링크 등 앞으로 진행은 전부 단톡방에서 */}
                <p className="text-card-ink-muted">💬 <span className="text-card-ink font-bold">{ACTIVE.chatInviteLabel}</span>에 단톡방에 초대할게. 앞으로 진행은 전부 거기서 안내해줄게</p>
                <p className="text-card-ink-muted">🎥 OT · <span className="text-card-ink font-bold">{ACTIVE.otLabel} {ACTIVE.otTimeLabel}</span></p>
                <p className="text-card-ink-muted">🏃 Day 1 · <span className="text-card-ink font-bold">{ACTIVE.startDateLabel}</span></p>
              </div>
            </>
          )}

          {(status === 'pending' || status === 'cancelled') && (
            <>
              <h1 className="font-kr text-2xl font-black text-text-primary mb-3">
                {status === 'cancelled' ? '결제가 취소됐어' : '결제가 아직 확인 안 됐어'}
              </h1>
              <p className="text-text-secondary text-sm leading-relaxed mb-8">
                {status === 'cancelled'
                  ? '지원서는 저장돼 있어. 아래 버튼으로 결제만 다시 하면 돼.'
                  : '결제를 마쳤는데 이 화면이 보이면 1-2분 뒤 새로고침해줘. 결제 전이라면 아래 버튼으로 이어서 하면 돼.'}
              </p>
              <Link
                to="/apply"
                className="block w-full bg-accent-green text-bg-primary text-center font-extrabold py-4 rounded-2xl hover:brightness-110 transition-all"
              >
                결제 이어서 하기 →
              </Link>
            </>
          )}

          {status === 'missing' && (
            <>
              <h1 className="font-kr text-2xl font-black text-text-primary mb-3">지원서 정보가 없어</h1>
              <Link to="/apply" className="text-accent-green font-bold text-sm">지원서로 가기 →</Link>
            </>
          )}

          <a
            href="https://www.instagram.com/bali_tarzan/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center mt-8 text-text-muted text-sm hover:text-accent-green"
          >
            💬 문의 · DM @bali_tarzan
          </a>
        </div>
      </main>
    </div>
  );
}
