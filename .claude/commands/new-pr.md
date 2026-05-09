# new-pr

현재 브랜치 기준으로 GitHub PR을 생성합니다. PR은 반드시 이슈와 연결되어야 합니다.

## 프로세스

1. 현재 상태 확인:
   - `git status` 및 `git log dev..HEAD --oneline`으로 변경 내역 파악
   - 브랜치명에서 이슈 번호 추출 (예: `feat/#3-pods-page` → `#3`)

2. 이슈 번호 확인:
   - 브랜치명에서 찾을 수 없으면 사용자에게 묻습니다.
   - 이슈가 없으면 중단하고 `/new-issue` 먼저 실행하도록 안내합니다.

3. PR 제목 형식:
   ```
   <type>: <요약> (closes #<이슈번호>)
   ```
   예시: `feat: Pod 목록 페이지 구현 (closes #3)`

4. PR 본문 작성:

```
## 관련 이슈
Closes #<번호>

## 변경 내용
- 

## 구현 상세
- 

## 체크리스트
- [ ] TypeScript 에러 없음 (`npx tsc --noEmit`)
- [ ] 로딩/에러 상태 처리
- [ ] 다크모드 확인
- [ ] API 함수는 lib/api.ts에서만 호출
- [ ] any 타입 미사용
- [ ] 민감 정보 미포함 (.env.local 등)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

5. `mcp__github__create_pull_request` 툴로 PR을 생성합니다.
   - base: `dev` (항상 dev로 PR, main 직접 금지)
   - head: 현재 브랜치명

6. PR URL을 사용자에게 공유합니다. 직접 머지하지 않습니다.
   - 팀 리뷰 요청 또는 `/review-pr <번호>` 명령어로 AI 리뷰를 받을 수 있다고 안내합니다.
