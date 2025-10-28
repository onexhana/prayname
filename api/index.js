// Vercel 서버리스 함수로 Express 앱 래핑
const path = require('path');
const fs = require('fs');

// VERCEL 환경변수 설정 (server.js에서 감지할 수 있도록)
process.env.VERCEL = '1';
process.env.VERCEL_ENV = process.env.VERCEL_ENV || 'production';

// Vercel 환경에서도 data 디렉토리가 존재하도록 확인
const dataDir = path.join(__dirname, '../server/data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  
  // 기본 파일 생성 (없는 경우)
  const defaultStudents = { students: [], adminPassword: 'password' };
  const defaultSettings = {
    scrollSpeed: 600,
    fontSize: 2,
    studentsPerRow: 7,
    mobileScrollSpeed: 900,
    mobileFontSize: 1.5,
    mobileStudentsPerRow: 3
  };
  
  if (!fs.existsSync(path.join(dataDir, 'students.json'))) {
    fs.writeFileSync(path.join(dataDir, 'students.json'), JSON.stringify(defaultStudents, null, 2));
  }
  if (!fs.existsSync(path.join(dataDir, 'settings.json'))) {
    fs.writeFileSync(path.join(dataDir, 'settings.json'), JSON.stringify(defaultSettings, null, 2));
  }
}

// Express 앱 로드
const app = require('../server/server');

// Vercel 서버리스 함수는 app을 직접 export
// server.js에서 VERCEL 환경일 때 app을 export하도록 되어 있음
module.exports = app;

