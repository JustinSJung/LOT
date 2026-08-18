export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-900 px-6 py-8 text-center text-xs text-neutral-600">
      <p>
        100% 재미·연구 목적 콘텐츠입니다. 실제 당첨 확률을 예측하거나 보장하지 않습니다.
      </p>
      <p className="mt-1">
        데이터 출처:{" "}
        <a
          href="https://www.dhlottery.co.kr"
          target="_blank"
          rel="noopener noreferrer"
          className="text-neutral-500 underline decoration-neutral-700 hover:text-neutral-300"
        >
          동행복권
        </a>{" "}
        (공식 API 접속 제한으로 커뮤니티 미러 데이터 사용, 오차 가능성 있음)
      </p>
    </footer>
  );
}
