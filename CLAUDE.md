@AGENTS.md

# DGU-CAP Frontend

## 프로젝트 개요
AI 기반 Kubernetes 모니터링 플랫폼 프론트엔드.
K8s 메트릭/로그/이벤트 수집 → 룰 기반 이상탐지 → AI 분석 → 티켓 자동생성 + 실시간 알람.
스케줄러가 30초마다 Pod 이상 감지 → FastAPI AI 분석 → 티켓 생성 → SSE로 프론트에 실시간 전송.

## 기술 스택
- **프레임워크**: Next.js 16 App Router + TypeScript
- **스타일**: Tailwind CSS v4 + shadcn/ui (다크 모드 기본)
- **차트**: Recharts
- **상태관리**: TanStack Query v5 + Zustand v5
- **HTTP**: Axios
- **백엔드 API Base URL**: `http://localhost:8080/api`
- **SSE URL**: `http://localhost:8080/api/stream`

## 핵심 규칙
- `html`에 `dark` 클래스 기본 적용 (다크모드 기본)
- 모든 API 함수는 `app/lib/api.ts`에서만 관리
- 에러/로딩 상태 항상 처리
- `any` 타입 사용 금지
- 브랜치: `feat/#이슈번호-설명` → dev PR (base branch: dev, never main directly)
- 커밋 형식: `<type>: <내용>`

## Git 워크플로
```
main (보호) ← dev ← feat/#N-description
```
- feature 브랜치는 dev에서 분기
- PR은 dev로 머지
- 직접 main push 금지

## 디렉토리 구조
```
app/
  layout.tsx          # QueryClientProvider + SseProvider + 다크모드
  page.tsx            # 대시보드
  pods/page.tsx       # Pod 목록
  tickets/page.tsx    # 티켓 목록
  tickets/[id]/page.tsx  # 티켓 상세
  lib/
    types.ts          # 백엔드 기반 TypeScript 타입 전체
    api.ts            # Axios 인스턴스 + API 함수 전체
  store/
    useAlertStore.ts  # Zustand 알람 스토어
  components/
    Sidebar.tsx       # 사이드바 네비게이션
    SseProvider.tsx   # SSE 실시간 연결
    MetricChart.tsx   # Recharts 메트릭 차트
    AlertBanner.tsx   # 알람 배너
components/ui/        # shadcn/ui 컴포넌트
```

## API 엔드포인트
| Method | Path | 설명 |
|--------|------|------|
| GET | `/pods?namespace=default` | Pod 목록 |
| GET | `/pods/{podName}/events?namespace=default` | Pod 이벤트 |
| GET | `/topology?namespace=default` | 서비스 토폴로지 |
| GET | `/metrics/current?pod=` | 현재 메트릭 |
| GET | `/metrics/range?pod=&metric=cpu\|memory\|error-rate&range=30m\|1h\|6h\|24h` | 시계열 메트릭 |
| GET | `/logs?pod=` | 로그 |
| GET | `/tickets?status=&severity=` | 티켓 목록 |
| GET | `/tickets/{id}` | 티켓 상세 |
| PATCH | `/tickets/{id}/status` | 티켓 상태 변경 |
| GET | `/tickets/{id}/logs` | 티켓 조치 이력 |
| GET | `/stream` | SSE 연결 |

## 타입 정보
```typescript
type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
type Status = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
type AnomalyType = 'CPU_HIGH' | 'MEMORY_HIGH' | 'POD_RESTART' | 'ERROR_RATE_HIGH' | 'OOM_KILLED' | 'CRASH_LOOP'
```

### SSE 이벤트
- `NEW_ALERT`: `{ podName: string, anomalyType: AnomalyType }`
- `TICKET_UPDATED`: `{ ticketId: number, status: Status }`
- `POD_STATUS`: `{ podName: string, phase: string }`

## 이상탐지 임계치 (표시용)
- CPU > 90%
- 메모리 > 85%
- 재시작 >= 3회
- 에러율 > 10%
- OOMKilled, CrashLoopBackOff 이벤트

## UI 색상 규칙
### severity 뱃지
- `CRITICAL` → 빨강 (`bg-red-500`)
- `HIGH` → 주황 (`bg-orange-500`)
- `MEDIUM` → 노랑 (`bg-yellow-500`)
- `LOW` → 파랑 (`bg-blue-500`)

### status 뱃지
- `OPEN` → 빨강
- `IN_PROGRESS` → 주황
- `RESOLVED` → 초록
- `CLOSED` → 회색

### 메트릭 차트 선 색상
- cpu: `#60a5fa`
- memory: `#34d399`
- error-rate: `#f87171`

## 환경변수 (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_SSE_URL=http://localhost:8080/api/stream
```

## 주요 명령어
```bash
npm run dev          # 개발 서버 (http://localhost:3000)
npm run build        # 프로덕션 빌드
npx tsc --noEmit     # TypeScript 타입 검사
npm run lint         # ESLint
```
