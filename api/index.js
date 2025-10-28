// Vercel 서버리스 함수로 Express 앱 래핑
// Vercel 환경에서는 절대 경로를 사용해야 함
const path = require('path');
const fs = require('fs');

// Vercel 환경에서도 data 디렉토리가 존재하도록 확인
const dataDir = path.join(__dirname, '../server/data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  
  // 기본 파일 생성 (없는 경우)
  const defaultStudents = { students: [], adminPassword: '' };
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

const app = require('../server/server');
module.exports = app;

