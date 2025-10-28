# prayname

수험생 기도 명단 관리 웹 애플리케이션

## 기술 스택

- Frontend: React, React Router
- Backend: Express.js
- 데이터 저장: JSON 파일

## 로컬 개발

### 사전 요구사항

- Node.js (v14 이상)
- npm 또는 yarn

### 설치 및 실행

1. 의존성 설치
```bash
npm run install-all
```

2. 개발 서버 실행
```bash
npm run dev
```

- 클라이언트: http://localhost:3000
- 서버: http://localhost:5000

## Vercel 배포

### 1. GitHub에 코드 푸시

```bash
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

### 2. Vercel 대시보드에서 프로젝트 가져오기

1. [Vercel](https://vercel.com)에 가입/로그인
2. "New Project" 클릭
3. GitHub 저장소 선택
4. 프로젝트 설정:
   - Framework Preset: Other
   - Root Directory: ./
   - Build Command: `cd client && npm install && npm run build`
   - Output Directory: `client/build`
5. "Deploy" 클릭

### 3. 환경변수 설정 (선택사항)

Vercel 대시보드 > Settings > Environment Variables에서:
- `REACT_APP_API_URL`: 프로덕션 API URL (비워두면 상대 경로 사용)

### 4. 자동 배포

GitHub에 코드를 푸시하면 자동으로 재배포됩니다.

## 주요 기능

- 수험생 명단 관리
- 엑셀 파일 업로드로 일괄 추가
- 무한 스크롤 애니메이션
- 반응형 디자인 (모바일/데스크톱)
- 관리자 페이지 (로그인 필요)
- 설정 관리 (스크롤 속도, 글씨 크기, 한 줄당 학생 수)

## 주의사항

- 현재 데이터는 JSON 파일로 저장되며, Vercel 서버리스 환경에서는 **휘발적**입니다
- 프로덕션 사용 시 데이터베이스(MongoDB, PostgreSQL 등) 사용을 권장합니다
- 무료 플랜은 함수 실행 시간 제한이 있습니다 (10초)