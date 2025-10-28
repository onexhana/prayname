// Vercel 서버리스 함수로 Express 앱 래핑
const path = require('path');
const fs = require('fs');

// VERCEL 환경변수 설정 (server.js에서 감지할 수 있도록)
if (!process.env.VERCEL) {
  process.env.VERCEL = '1';
}
if (!process.env.VERCEL_ENV) {
  process.env.VERCEL_ENV = process.env.VERCEL_ENV || 'production';
}

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

// Express 앱을 동적으로 로드하지 않고 직접 require
// server.js에서 이미 VERCEL 환경을 확인하여 app을 export하도록 수정됨
let app;

try {
  // server.js를 require하기 전에 경로 확인
  const serverPath = path.join(__dirname, '../server/server');
  console.log('Server path:', serverPath);
  
  app = require(serverPath);
  console.log('Express app loaded successfully');
} catch (error) {
  console.error('Failed to load server:', error);
  // 에러 핸들러 함수 반환
  const express = require('express');
  const errorApp = express();
  errorApp.use((req, res) => {
    res.status(500).json({ 
      error: '서버 초기화 오류', 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  });
  app = errorApp;
}

module.exports = app;

