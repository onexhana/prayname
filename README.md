# 수험생 명단 관리 사이트

2026 수능 수험생을 위한 기도 명단 관리 사이트입니다. 영화 크레딧 스타일의 아름다운 스크롤 애니메이션과 함께 수험생들의 이름을 표시합니다.

## 🎯 주요 기능

- **영화 크레딧 스타일 명단 표시**: 아름다운 무한 스크롤 애니메이션
- **관리자 페이지**: 수험생 추가/삭제, 엑셀 파일 일괄 업로드
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 최적화
- **실시간 업데이트**: 명단 변경사항 즉시 반영

## 🛠 기술 스택

### 프론트엔드
- React 18
- React Router DOM v6
- Axios
- CSS3 (애니메이션)

### 백엔드
- Node.js
- Express
- Multer (파일 업로드)
- xlsx (엑셀 파싱)
- bcryptjs (비밀번호 해싱)
- CORS

### 배포
- Railway (풀스택 호스팅)
- GitHub (버전 관리)

## 🚀 로컬 실행 방법

### 1. 프로젝트 클론 및 의존성 설치

```bash
# 프로젝트 디렉토리로 이동
cd prayname

# 루트 의존성 설치
npm install

# 모든 의존성 설치 (서버 + 클라이언트)
npm run install-all
```

### 2. 개발 서버 실행

```bash
# 서버와 클라이언트 동시 실행
npm run dev
```

또는 개별 실행:

```bash
# 터미널 1: 서버 실행
cd server
npm run dev

# 터미널 2: 클라이언트 실행
cd client
npm start
```

### 3. 접속 확인

- **메인 페이지**: http://localhost:3000
- **관리자 페이지**: http://localhost:3000/admin
- **API 서버**: http://localhost:5000

## 📋 기본 설정

### 관리자 비밀번호
기본 비밀번호: `password`

비밀번호 변경 방법:
1. `server/data/students.json` 파일에서 `adminPassword` 값 수정
2. 새 비밀번호를 bcrypt로 해싱하여 저장

```javascript
const bcrypt = require('bcryptjs');
const hashedPassword = bcrypt.hashSync('새비밀번호', 10);
console.log(hashedPassword);
```

### 엑셀 파일 형식
- **지원 형식**: .xlsx, .xls
- **필수 열**: '이름' (또는 'name', 'Name', 'NAME', '성명', '학생명')
- **예시**:

| 이름 |
|------|
| 홍길동 |
| 김철수 |
| 이영희 |

## 🎨 주요 페이지

### 메인 페이지
- 영화 크레딧 스타일의 무한 스크롤 애니메이션
- 부드러운 그라데이션 배경
- 반응형 디자인
- 총 수험생 수 표시

### 관리자 페이지
- **로그인 보호**: 비밀번호 인증
- **수동 추가**: 개별 학생 이름 입력
- **엑셀 업로드**: 일괄 학생 추가
- **명단 관리**: 학생 삭제, 전체 명단 확인

## 🚀 Railway 배포 방법

### 1. GitHub 저장소 생성
```bash
# Git 초기화
git init
git add .
git commit -m "Initial commit"

# GitHub 저장소 생성 후 연결
git remote add origin https://github.com/username/prayname.git
git push -u origin main
```

### 2. Railway 배포
1. [Railway](https://railway.app) 접속
2. GitHub 계정 연동
3. "New Project" → "Deploy from GitHub repo" 선택
4. 저장소 선택
5. 환경 변수 설정:
   - `NODE_ENV=production`
   - `ADMIN_PASSWORD=원하는비밀번호`
6. 빌드 명령: `npm run install-all && npm run build`
7. 시작 명령: `npm start`
8. 배포 완료 후 도메인 확인

## 📁 프로젝트 구조

```
prayname/
├── client/                    # React 프론트엔드
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json
│   ├── src/
│   │   ├── components/
│   │   │   ├── MainPage.jsx       # 영화 크레딧 스크롤 페이지
│   │   │   ├── AdminPage.jsx      # 관리자 페이지
│   │   │   └── Login.jsx          # 로그인 컴포넌트
│   │   ├── App.jsx                # 라우팅 설정
│   │   ├── App.css                # 전역 스타일
│   │   └── index.jsx              # 엔트리 포인트
│   └── package.json
├── server/                    # Express 백엔드
│   ├── data/
│   │   └── students.json          # 수험생 명단 저장
│   ├── uploads/                   # 엑셀 파일 임시 저장
│   ├── server.js                  # 메인 서버 파일
│   └── package.json
├── package.json               # 루트 package.json (Railway 배포용)
├── .gitignore
└── README.md
```

## 🔧 API 엔드포인트

- `POST /api/login` - 관리자 로그인
- `GET /api/students` - 전체 명단 조회
- `POST /api/students` - 단일 학생 추가
- `POST /api/students/upload` - 엑셀 파일 업로드
- `DELETE /api/students/:name` - 학생 삭제

## 🎯 사용 시나리오

1. **관리자 로그인**: `/admin` 페이지에서 비밀번호 입력
2. **학생 추가**: 
   - 수동: 이름 직접 입력
   - 일괄: 엑셀 파일 업로드
3. **명단 확인**: 메인 페이지에서 영화 크레딧 스타일로 확인
4. **학생 삭제**: 관리자 페이지에서 개별 삭제

## 🐛 문제 해결

### 로컬 실행 오류
```bash
# 의존성 재설치
rm -rf node_modules
rm -rf server/node_modules
rm -rf client/node_modules
npm run install-all
```

### 포트 충돌
- 서버: 5000번 포트
- 클라이언트: 3000번 포트
- 다른 포트 사용 시 환경 변수 설정

### 엑셀 업로드 오류
- 파일 형식 확인 (.xlsx, .xls)
- '이름' 열 존재 확인
- 빈 행 제거

## 📞 지원

문제가 발생하면 GitHub Issues를 통해 문의해주세요.

---

**모든 수험생의 합격을 기원합니다! 🙏**
