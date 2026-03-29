import { useState } from 'react';
import { Link } from 'react-router-dom';

const SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;
const ACCOUNT = '1000-2641-8699';

export default function ApplyPage() {
  const [form, setForm] = useState({
    name: '',
    age: '',
    phone: '',
    gender: '',
    currentWeight: '',
    targetWeight: '',
    otAttend: '',
    paid: '',
  });
  const [errors, setErrors] = useState({});
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = '이름을 입력해주세요.';
    if (!form.age || isNaN(form.age) || +form.age < 1 || +form.age > 100) e.age = '나이를 올바르게 입력해주세요.';
    if (!/^01[0-9]{8,9}$/.test(form.phone.replace(/-/g, ''))) e.phone = '전화번호를 올바르게 입력해주세요.';
    if (!form.gender) e.gender = '성별을 선택해주세요.';
    if (!form.currentWeight || isNaN(form.currentWeight)) e.currentWeight = '현재 몸무게를 입력해주세요.';
    if (!form.targetWeight || isNaN(form.targetWeight)) e.targetWeight = '목표 몸무게를 입력해주세요.';
    if (!form.otAttend) e.otAttend = 'OT 참석 여부를 선택해주세요.';
    if (!form.paid) e.paid = '입금 여부를 선택해주세요.';
    return e;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(ACCOUNT.replace(/-/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSubmitting(true);
    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, submittedAt: new Date().toLocaleString('ko-KR') }),
      });
      setSubmitted(true);
    } catch {
      alert('제출 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-bg-primary min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="text-5xl mb-6">✅</div>
        <h2 className="text-2xl font-extrabold text-text-primary mb-3">신청 완료!</h2>
        <p className="text-text-secondary leading-relaxed mb-2">
          확인 후 <span className="text-accent-green font-semibold">@bali_tarzan</span>으로 연락드릴게요.
        </p>
        <p className="text-text-muted text-sm mb-8">입금이 아직 안 됐다면 아래 계좌로 입금해주세요.</p>
        <div className="bg-bg-card border border-border rounded-xl p-4 mb-8 w-full max-w-sm">
          <p className="text-text-muted text-xs mb-1">토스뱅크 · 신가인</p>
          <p className="text-text-primary font-bold text-lg">{ACCOUNT}</p>
          <p className="text-accent-green text-sm font-semibold">200,000원</p>
        </div>
        <Link to="/" className="text-accent-green text-sm underline">← 메인으로 돌아가기</Link>
      </div>
    );
  }

  return (
    <div className="bg-bg-primary min-h-screen px-6 py-12">
      <div className="max-w-lg mx-auto">
        {/* 헤더 */}
        <Link to="/" className="text-text-muted text-sm hover:text-text-secondary transition-colors">← 뒤로</Link>
        <h1 className="text-2xl font-extrabold text-text-primary mt-4 mb-2">챌린지 신청서</h1>
        <p className="text-text-secondary text-sm mb-8">신청서 제출 후 DM으로 안내드립니다.</p>

        {/* 계좌 안내 */}
        <div className="bg-bg-card border border-border rounded-xl p-5 mb-8">
          <p className="text-text-secondary text-sm font-semibold mb-3">📌 예치금 입금 계좌</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-xs mb-0.5">토스뱅크 · 신가인</p>
              <p className="text-text-primary font-bold">{ACCOUNT}</p>
              <p className="text-accent-green text-sm font-semibold mt-0.5">200,000원</p>
            </div>
            <button
              onClick={handleCopy}
              className="text-xs font-semibold px-3 py-2 rounded-lg border border-accent-green text-accent-green hover:bg-accent-green/10 transition-colors"
            >
              {copied ? '복사됨 ✓' : '복사'}
            </button>
          </div>
        </div>

        {/* 폼 */}
        <div className="space-y-5">

          {/* 이름 */}
          <div>
            <label className="block text-text-secondary text-sm font-medium mb-1.5">이름</label>
            <input
              type="text"
              value={form.name}
              onChange={e => handleChange('name', e.target.value)}
              placeholder="홍길동"
              className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-green transition-colors"
            />
            {errors.name && <p className="text-accent-orange text-xs mt-1">{errors.name}</p>}
          </div>

          {/* 나이 / 성별 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-text-secondary text-sm font-medium mb-1.5">나이</label>
              <input
                type="number"
                value={form.age}
                onChange={e => handleChange('age', e.target.value)}
                placeholder="28"
                className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-green transition-colors"
              />
              {errors.age && <p className="text-accent-orange text-xs mt-1">{errors.age}</p>}
            </div>
            <div>
              <label className="block text-text-secondary text-sm font-medium mb-1.5">성별</label>
              <div className="flex gap-2">
                {['남', '여'].map(g => (
                  <button
                    key={g}
                    onClick={() => handleChange('gender', g)}
                    className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-colors ${
                      form.gender === g
                        ? 'border-accent-green bg-accent-green/10 text-accent-green'
                        : 'border-border text-text-secondary hover:border-accent-green/50'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
              {errors.gender && <p className="text-accent-orange text-xs mt-1">{errors.gender}</p>}
            </div>
          </div>

          {/* 전화번호 */}
          <div>
            <label className="block text-text-secondary text-sm font-medium mb-1.5">전화번호</label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => handleChange('phone', e.target.value)}
              placeholder="01012345678"
              className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-green transition-colors"
            />
            {errors.phone && <p className="text-accent-orange text-xs mt-1">{errors.phone}</p>}
          </div>

          {/* 현재 / 목표 몸무게 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-text-secondary text-sm font-medium mb-1.5">현재 몸무게</label>
              <div className="relative">
                <input
                  type="number"
                  value={form.currentWeight}
                  onChange={e => handleChange('currentWeight', e.target.value)}
                  placeholder="70"
                  className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 pr-10 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-green transition-colors"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted text-sm">kg</span>
              </div>
              {errors.currentWeight && <p className="text-accent-orange text-xs mt-1">{errors.currentWeight}</p>}
            </div>
            <div>
              <label className="block text-text-secondary text-sm font-medium mb-1.5">목표 몸무게</label>
              <div className="relative">
                <input
                  type="number"
                  value={form.targetWeight}
                  onChange={e => handleChange('targetWeight', e.target.value)}
                  placeholder="65"
                  className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 pr-10 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-green transition-colors"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted text-sm">kg</span>
              </div>
              {errors.targetWeight && <p className="text-accent-orange text-xs mt-1">{errors.targetWeight}</p>}
            </div>
          </div>

          {/* OT 참석 여부 */}
          <div>
            <label className="block text-text-secondary text-sm font-medium mb-1">
              4월 1일 저녁 9시 OT 참석 가능 여부
            </label>
            <p className="text-text-muted text-xs mb-2">팀원들과 만나는 자리로 강력 권장합니다. 불참 시 영상으로 가이드 전달 예정.</p>
            <div className="flex gap-2">
              {[{ label: '참석 가능', value: '참석' }, { label: '불참 (영상 수령)', value: '불참' }].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleChange('otAttend', opt.value)}
                  className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-colors ${
                    form.otAttend === opt.value
                      ? 'border-accent-green bg-accent-green/10 text-accent-green'
                      : 'border-border text-text-secondary hover:border-accent-green/50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {errors.otAttend && <p className="text-accent-orange text-xs mt-1">{errors.otAttend}</p>}
          </div>

          {/* 입금 여부 */}
          <div>
            <label className="block text-text-secondary text-sm font-medium mb-2">입금 여부</label>
            <div className="flex gap-2">
              {[{ label: '입금 완료', value: '완료' }, { label: '아직 안 함', value: '미완료' }].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleChange('paid', opt.value)}
                  className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-colors ${
                    form.paid === opt.value
                      ? 'border-accent-green bg-accent-green/10 text-accent-green'
                      : 'border-border text-text-secondary hover:border-accent-green/50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {errors.paid && <p className="text-accent-orange text-xs mt-1">{errors.paid}</p>}
          </div>

          {/* 제출 버튼 */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-accent-green text-bg-primary font-bold py-4 rounded-xl text-base hover:brightness-110 transition-all duration-300 disabled:opacity-50 mt-2"
          >
            {submitting ? '제출 중...' : '신청서 제출하기'}
          </button>

          <p className="text-text-muted text-xs text-center pb-8">
            제출 후 <span className="text-accent-green">@bali_tarzan</span>으로 안내 DM을 보내드립니다.
          </p>
        </div>
      </div>
    </div>
  );
}
