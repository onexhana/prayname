// Vercel 서버리스 함수 진입점
// 환경변수 설정 (server.js에서 감지)
process.env.VERCEL = '1';
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const path = require('path');
const fs = require('fs');

// data 디렉토리 초기화
const dataDir = path.join(__dirname, '../server/data');
try {
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

  const studentsFile = path.join(dataDir, 'students.json');
  const settingsFile = path.join(dataDir, 'settings.json');

  if (!fs.existsSync(studentsFile)) {
    fs.writeFileSync(studentsFile, JSON.stringify(defaultStudents, null, 2));
  }
  if (!fs.existsSync(settingsFile)) {
    fs.writeFileSync(settingsFile, JSON.stringify(defaultSettings, null, 2));
  }
} catch (error) {
  console.error('Data directory initialization error:', error);
}

// Express 앱 로드
try {
  const app = require('../server/server');
  module.exports = app;
} catch (error) {
  console.error('Failed to load server:', error);
  // 에러가 발생해도 기본 핸들러 제공
  const express = require('express');
  const errorApp = express();
  errorApp.use((req, res) => {
    res.status(500).json({ 
      error: 'Server initialization failed',
      message: error.message 
    });
  });
  module.exports = errorApp;
}
