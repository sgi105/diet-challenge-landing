-- 시즌6 지원서 프리프레이밍 질문 "여태까지 왜 원하는 몸을 못 만들었다고 생각해?" 답.
-- consistency(꾸준히 못해서) | fun(재미가 없어서) | method(방법을 몰라서) | motivation(동기가 부족해서)
alter table public.applications add column if not exists fail_reason text;
