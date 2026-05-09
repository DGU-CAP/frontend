# DGU-CAP Frontend

AI 기반 Kubernetes 모니터링 플랫폼의 프론트엔드 대시보드.  
K8s 메트릭/로그/이벤트를 실시간으로 시각화하고, 이상탐지 티켓을 관리합니다.

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 App Router + TypeScript |
| 스타일 | Tailwind CSS v4 + shadcn/ui (다크모드 기본) |
| 차트 | Recharts |
| 상태관리 | TanStack Query v5 + Zustand v5 |
| HTTP | Axios |
| 실시간 | SSE (Server-Sent Events) |

## 사전 준비

- Node.js 18+
- 백엔드 서버 실행 중 (`http://localhost:8080`)

## 로컬 실행

```bash
# 패키지 설치
npm install

# 환경변수 파일 생성 (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_SSE_URL=http://localhost:8080/api/stream

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## 주요 명령어

```bash
npm run dev          # 개발 서버
npm run build        # 프로덕션 빌드
npm run lint         # ESLint
npx tsc --noEmit     # TypeScript 타입 검사
```

## 디렉토리 구조

```
app/
├── page.tsx                  # 대시보드
├── pods/page.tsx             # Pod 목록
├── tickets/page.tsx          # 티켓 목록
├── tickets/[id]/page.tsx     # 티켓 상세
├── lib/
│   ├── types.ts              # TypeScript 타입 전체
│   └── api.ts                # API 함수 전체 (Axios)
├── store/
│   └── useAlertStore.ts      # Zustand 알람 스토어
└── components/
    ├── Sidebar.tsx           # 사이드바
    ├── SseProvider.tsx       # SSE 실시간 연결
    ├── MetricChart.tsx       # Recharts 메트릭 차트
    └── AlertBanner.tsx       # 알람 배너
components/ui/                # shadcn/ui 컴포넌트
```

## 화면 구성

| 화면 | 경로 | 설명 |
|------|------|------|
| 대시보드 | `/` | Pod 수, 티켓 요약 카드 + 최근 티켓 테이블 |
| Pod 목록 | `/pods` | Pod 상태 테이블 + 메트릭 차트 모달 |
| 티켓 목록 | `/tickets` | 필터/탭 + SSE 알람 배너 |
| 티켓 상세 | `/tickets/[id]` | AI 분석 + 상태 변경 + 조치 이력 |

## 이상탐지 임계치

| 항목 | 기준 |
|------|------|
| CPU | > 90% |
| 메모리 | > 85% |
| 재시작 횟수 | ≥ 3회 |
| 에러율 | > 10% |
| K8s 이벤트 | OOMKilled, CrashLoopBackOff |

## Git 워크플로

```
main ← dev ← feat/#이슈번호-설명
```

- feature 브랜치는 **dev**에서 분기
- PR base는 항상 **dev** (main 직접 push 금지)
- 커밋 형식: `<type>: <내용>` (feat / fix / chore / docs / refactor)

## 관련 레포

- [백엔드](https://github.com/DGU-CAP/backend) — Spring Boot, FastAPI AI 서버, K8s 연동
