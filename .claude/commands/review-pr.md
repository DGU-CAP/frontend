# review-pr

GitHub PR을 코드 리뷰합니다.

사용법: `/review-pr <PR번호>` 또는 현재 브랜치의 PR을 자동 감지합니다.

## 프로세스

1. PR 정보 수집:
   - `gh pr view <번호>` — 제목, 본문, 파일 목록
   - `gh pr diff <번호>` — 변경 diff

2. 아래 기준으로 코드를 검토합니다:

### 검토 기준 (Next.js / React 프론트엔드)

- **TypeScript 타입 안전성**
  - `any` 타입 사용 여부
  - 백엔드 API 응답 타입과 일치 여부 (`app/lib/types.ts` 기준)

- **API 호출 규칙**
  - API 함수가 `app/lib/api.ts` 외에서 직접 호출되는지 확인

- **상태 처리**
  - 로딩 상태 (Skeleton UI) 처리 여부
  - 에러 상태 처리 여부
  - TanStack Query `refetchInterval` 30초 설정 여부

- **다크모드**
  - Tailwind 다크모드 클래스 누락 여부
  - `dark:` prefix 올바른 사용 여부

- **SSE / 실시간**
  - EventSource 언마운트 시 정리(cleanup) 여부
  - 재연결 로직 존재 여부

- **보안**
  - 민감 정보 하드코딩 여부 (API 키, 토큰 등)
  - XSS 취약점 (dangerouslySetInnerHTML 등)

- **성능**
  - 불필요한 리렌더링 (useEffect 의존성 배열 누락 등)
  - 대용량 컴포넌트의 코드 스플리팅 고려 여부

- **컨벤션**
  - `'use client'` 지시어 필요한 곳에만 사용
  - Server Component / Client Component 구분 적절성

3. 리뷰 결과를 아래 형식으로 출력합니다:

```
## 코드 리뷰 결과

### 🚨 수정 필요 (Blocking)
- 

### 💡 개선 제안 (Non-blocking)
- 

### ✅ 잘 된 점
- 

### 최종 의견
APPROVE / REQUEST CHANGES / COMMENT
```

4. `mcp__github__create_pull_request_review` 툴로 GitHub에 리뷰를 등록합니다.
