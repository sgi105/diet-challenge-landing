import { useState, useEffect } from 'react';

export default function UserInfoModal({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState({ name: '', phone: '', age: '', gender: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = '이름을 입력해주세요.';
    if (!form.phone.trim() || !/^01[0-9]{8,9}$/.test(form.phone.replace(/-/g, ''))) newErrors.phone = '휴대폰 번호를 올바르게 입력해주세요.';
    if (!form.age || form.age < 1 || form.age > 100) newErrors.age = '나이를 올바르게 입력해주세요.';
    if (!form.gender) newErrors.gender = '성별을 선택해주세요.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(form);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative bg-bg-card border border-border rounded-2xl w-full max-w-sm p-6 animate-modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition"
          aria-label="닫기"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-xl font-bold text-text-primary mb-1">참가 정보 입력</h2>
        <p className="text-text-muted text-sm mb-6">간단한 정보를 입력하시면 결제로 넘어갑니다.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-text-secondary text-sm font-medium mb-1.5">이름</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="홍길동"
              className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent-green transition text-sm"
            />
            {errors.name && <p className="text-accent-orange text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-text-secondary text-sm font-medium mb-1.5">휴대폰 번호</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="01012345678"
              className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent-green transition text-sm"
            />
            {errors.phone && <p className="text-accent-orange text-xs mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-text-secondary text-sm font-medium mb-1.5">나이</label>
            <input
              type="number"
              value={form.age}
              onChange={(e) => handleChange('age', e.target.value)}
              placeholder="30"
              min="1"
              max="100"
              className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent-green transition text-sm"
            />
            {errors.age && <p className="text-accent-orange text-xs mt-1">{errors.age}</p>}
          </div>

          <div>
            <label className="block text-text-secondary text-sm font-medium mb-1.5">성별</label>
            <div className="flex gap-3">
              {[
                { value: 'male', label: '남성' },
                { value: 'female', label: '여성' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleChange('gender', value)}
                  className={`flex-1 py-3 rounded-xl border text-sm font-medium transition ${
                    form.gender === value
                      ? 'border-accent-green bg-accent-green/10 text-accent-green'
                      : 'border-border bg-bg-primary text-text-muted hover:border-text-muted'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {errors.gender && <p className="text-accent-orange text-xs mt-1">{errors.gender}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-accent-green text-bg-primary font-bold py-4 rounded-xl mt-2 hover:brightness-110 transition text-sm"
          >
            결제하기
          </button>
        </form>
      </div>
    </div>
  );
}
