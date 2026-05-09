프로젝트 개요: DGU-CAP 프론트엔드. K8s 모니터링 플랫폼 대시보드.

스택
- Next.js 14 App Router, TypeScript
- Tailwind CSS + shadcn/ui (다크 모드 기본)
- Recharts, TanStack Query, Zustand, Axios

API Base URL: http://localhost:8080/api

API 목록
- GET  /pods?namespace=default
- GET  /pods/{podName}/events
- GET  /metrics/current?pod=
- GET  /metrics/range?pod=&metric=cpu|memory|error-rate&range=30m|1h|6h|24h
- GET  /logs?pod=
- GET  /tickets?status=&severity=
- GET  /tickets/{id}
- PATCH /tickets/{id}/status  body: { status, action, memo, performedBy }
- GET  /tickets/{id}/logs
- GET  /stream (SSE)

SSE 이벤트
- NEW_ALERT: { podName, anomalyType }
- TICKET_UPDATED: { ticketId, status }
- POD_STATUS: { podName, phase }

타입
- severity: CRITICAL | HIGH | MEDIUM | LOW
- status: OPEN | IN_PROGRESS | RESOLVED | CLOSED
- anomalyType: CPU_HIGH | MEMORY_HIGH | POD_RESTART | ERROR_RATE_HIGH | OOM_KILLED | CRASH_LOOP

디렉토리 구조
app/
  layout.tsx
  page.tsx (대시보드)
  pods/page.tsx
  tickets/page.tsx
  tickets/[id]/page.tsx
  lib/api.ts
  lib/types.ts
  store/useAlertStore.ts
  components/SseProvider.tsx
  components/Sidebar.tsx
  components/PodTable.tsx
  components/MetricChart.tsx
  components/TicketTable.tsx
  components/AlertBanner.tsx

규칙
- 다크 모드 기본 (html에 dark 클래스)
- API 함수는 lib/api.ts에서만 관리
- 에러/로딩 상태 항상 처리
- 브랜치: feat/#이슈번호-설명 → dev PR
