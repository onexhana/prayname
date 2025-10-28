// Vercel 서버리스 함수로 Express 앱 래핑
// Vercel은 Express 앱을 자동으로 래핑하므로 단순히 export만 하면 됨

const path = require('path');
const fs = require('fs');

// 환경변수 설정
process.env.VERCEL = '1';

// data 디렉토리 초기화
const dataDir = path.join(__dirname, '../server/data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

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

// Express 앱 로드 및 export
module.exports = require('../server/server');
