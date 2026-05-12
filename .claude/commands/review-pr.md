GitHub PR의 코드를 리뷰합니다.
사용법: `/review-pr <PR번호>` 또는 현재 브랜치의 PR을 자동으로 감지합니다.

## 진행 순서

1. **PR 정보 가져오기**
   - 인자로 PR 번호가 주어진 경우: `gh pr view <PR번호> --json title,body,files,commits`
   - 인자가 없는 경우: `gh pr view --json title,body,files,commits` (현재 브랜치 기준)
   - PR을 찾을 수 없으면 사용자에게 번호를 물어보세요

2. **변경 diff 가져오기**
   `gh pr diff <PR번호>`

3. **아래 관점으로 코드를 리뷰하세요:**

### 프론트엔드 코드 리뷰 기준 (Next.js / React)
- **정확성**: 화면 동작이 요구사항과 일치하는가
- **보안**: 민감 정보 하드코딩 여부, XSS 가능성
- **타입 안전성**: `any` 타입 사용 여부, 인터페이스 누락 여부
- **React 규칙**: useEffect 의존성 배열, 파생 상태를 useState로 관리하는 안티패턴
- **TanStack Query**: queryKey가 queryFn 파라미터와 일치하는가, mutation 후 invalidation 포함 여부
- **API 호출**: app/lib/api.ts 외부에서 직접 axios 호출 여부
- **에러/로딩 처리**: 모든 useQuery에 isLoading, isError 처리 포함 여부
- **스타일**: 다크 모드 팔레트(gray-900/800/700) 준수 여부, 하드코딩된 색상 없는지

### 일반 리뷰 기준
- PR 범위가 이슈와 일치하는가 (과도한 변경 포함 여부)
- 의도하지 않은 파일 포함 여부 (`.env`, `.env.local` 등)

4. **리뷰 결과 출력 형식:**

```
## PR 리뷰 결과: <PR 제목>

### 요약
(전반적인 평가 한 줄)

### 필수 수정 (Blocking)
- ...

### 개선 제안 (Non-blocking)
- ...

### 잘된 점
- ...

### 결론
APPROVE / REQUEST CHANGES / COMMENT
```

5. **GitHub에 리뷰 남기기** (사용자 동의 후)
   - `APPROVE` 또는 `REQUEST CHANGES` 중 선택하여 `gh pr review` 로 리뷰를 제출하세요
   - 구체적인 코멘트는 `gh pr review <번호> --comment -b "<내용>"` 으로 추가
