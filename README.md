# MacroFundamental Research Desk

미국 상장사의 뉴스, 공시, 실적 가이던스, 거시경제 방향, 금리, 정책, 섹터 순환 흐름을 함께 반영해 자동 점수를 재평가하는 리서치 대시보드 MVP입니다.

## 실행

의존성 없이 Python 표준 라이브러리만으로 실행됩니다.

```bash
python3 server.py
```

브라우저에서 `http://localhost:4173`을 열면 됩니다.

## Render 배포

1. GitHub 저장소를 만들고 이 폴더의 파일을 커밋합니다.
2. Render에서 새 Web Service를 생성하고 GitHub 저장소를 연결합니다.
3. 설정은 다음을 사용합니다.
   - Runtime: Python
   - Build command: `true`
   - Start command: `python3 server.py`
   - Plan: Free 또는 Starter
4. 배포 후 Render 기본 URL에서 `/`, `/api/news?type=market`, `/api/indices`, `/api/flows`, `/api/universe`를 확인합니다.

`render.yaml`이 포함되어 있어 Render Blueprint로도 배포할 수 있습니다.

## 구현된 MVP

- 시장 메인 페이지: 거시경제 방향, 최신 시장 뉴스, 섹터 강약 그래프
- 시장 메인 페이지: 공포·탐욕지수, S&P 500, Nasdaq Composite, Dow Jones, VIX, 10년물 금리, QQQ 등 유명 지수 카드
- 종목 상세 페이지: 회사 점수, 외부 환경 점수, 이벤트 타임라인, 종목/관련 뉴스, 재평가 메모
- Nasdaq-100 101개 티커 전체와 `HIMS`, `OSCR`, `SOFI`, `HOOD`, `RKLB`, `RDDT`, `DUOL`, `NET`, `TMDX`, `IONQ` 등 추가 성장주
- 회사 자체 점수: `growth`, `profitability`, `fundamentals`, `guidance`, `companyRisk`
- 외부 환경 점수: `macroRegime`, `rateSensitivity`, `policyImpact`, `sectorMomentum`, `cycleFit`
- 종합 점수 `compositeScore`
- 뉴스/공시 반영 시 회사 점수 변경. 같은 이벤트는 반복 클릭해도 중복 반영되지 않습니다.
- 매크로 이벤트 반영 시 금리 민감도, 정책 영향, 섹터 사이클 점수 변경. 같은 이벤트는 반복 클릭해도 중복 반영되지 않습니다.
- 종목 상세의 `재평가 반영` 버튼 하나로 뉴스/공시 요인과 매크로 요인을 함께 반영합니다.
- 고위험·저수익 성장주는 뉴스/공시 이벤트가 항상 긍정적으로 반영되지 않고 리스크 상승 또는 수익성 하향으로도 반영됩니다.
- 선택한 티커별 최신 뉴스 헤드라인과 관련 섹터·매크로 뉴스 헤드라인. 제목은 한국어로 번역하고, 가능한 경우 기사 대표 이미지를 함께 표시합니다.
- 섹터 순환 흐름은 상세 페이지에서 제거하고 시장 메인 페이지의 막대그래프로 이동
- 기업 요인, 매크로 요인, 섹터 요인, 정책 요인을 분리한 재평가 메모

## 다음 구현 단계

1. Next.js 앱으로 전환하고 PostgreSQL/Supabase 저장소를 연결합니다.
2. SEC EDGAR, FRED, 재무 데이터 API, 뉴스 API 수집 작업을 추가합니다.
3. OpenAI API로 원문 요약, 이벤트 분류, 점수 변경 근거 생성을 연결합니다.
4. 점수 변경 이력 테이블과 근거 문서 링크를 영구 저장합니다.
5. 티커별 매크로 민감도 프로필을 DB에서 관리하도록 분리합니다.

## 면책

호재야호재는 투자 판단 보조용 정보 도구이며, 투자 자문이나 매수·매도 추천이 아닙니다. 외부 공개 데이터 호출 실패, 지연, 부정확성이 발생할 수 있습니다.
