import AnimateOnScroll from '../ui/AnimateOnScroll';
import BigStatsCards from '../cohort-result/BigStatsCards';
import PhotoGrid from '../cohort-result/PhotoGrid';
import AttendanceGrid from '../cohort-result/AttendanceGrid';
import CumulativeDistanceChart from '../cohort-result/CumulativeDistanceChart';
import MiracleMorningStat from '../cohort-result/MiracleMorningStat';

export default function Season0ResultsSection() {
  return (
    <section className="px-6 py-14 max-w-lg mx-auto">
      <AnimateOnScroll>
        <span className="pill text-accent-green block w-fit mx-auto">REAL DATA</span>
        <h2 className="font-kr text-3xl md:text-5xl font-black text-center mt-4 mb-3 text-text-primary leading-tight">
          후기는 누구나 만들지.<br />
          <span className="text-accent-green">우리는 30명 데이터를 공개한다</span>
        </h2>
        <p className="text-text-secondary text-center mb-8">
          2026-05-04 ~ 05-24 · 시즌0 21일 · 30명 91% 출석률
        </p>
      </AnimateOnScroll>

      <div className="space-y-4">
        <BigStatsCards />
        <PhotoGrid />
        <AttendanceGrid />
        <CumulativeDistanceChart />
        <MiracleMorningStat />
      </div>

      <p className="text-text-muted text-[11px] mt-6 text-center leading-relaxed">
        * 1000runclub 앱 인증 로그 집계. 멤버 이름은 첫 글자만 익명 처리.
      </p>
    </section>
  );
}
