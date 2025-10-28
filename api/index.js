// Vercel 서버리스 함수 진입점
// 환경변수 설정 (server.js에서 감지)
process.env.VERCEL = '1';
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const path = require('path');
const fs = require('fs');

// Vercel 환경에서는 /tmp 디렉토리 사용
const tmpDataDir = '/tmp/data';
const sourceDataDir = path.join(__dirname, '../server/data');

// /tmp/data 디렉토리 생성
if (!fs.existsSync(tmpDataDir)) {
  fs.mkdirSync(tmpDataDir, { recursive: true });
  console.log('Created /tmp/data directory');
}

// 소스 데이터 파일을 /tmp로 복사 (없는 경우만)
try {
  const studentsSource = path.join(sourceDataDir, 'students.json');
  const settingsSource = path.join(sourceDataDir, 'settings.json');
  const studentsDest = path.join(tmpDataDir, 'students.json');
  const settingsDest = path.join(tmpDataDir, 'settings.json');

  // students.json 복사
  if (fs.existsSync(studentsSource) && !fs.existsSync(studentsDest)) {
    fs.copyFileSync(studentsSource, studentsDest);
    console.log('Copied students.json to /tmp/data');
  } else if (!fs.existsSync(studentsDest)) {
    // 기본 파일 생성
    const defaultStudents = { students: [], adminPassword: 'password' };
    fs.writeFileSync(studentsDest, JSON.stringify(defaultStudents, null, 2));
    console.log('Created default students.json in /tmp/data');
  }

  // settings.json 복사
  if (fs.existsSync(settingsSource) && !fs.existsSync(settingsDest)) {
    fs.copyFileSync(settingsSource, settingsDest);
    console.log('Copied settings.json to /tmp/data');
  } else if (!fs.existsSync(settingsDest)) {
    // 기본 파일 생성
    const defaultSettings = {
      scrollSpeed: 600,
      fontSize: 2,
      studentsPerRow: 7,
      mobileScrollSpeed: 1800,
      mobileFontSize: 1.5,
      mobileStudentsPerRow: 3
    };
    fs.writeFileSync(settingsDest, JSON.stringify(defaultSettings, null, 2));
    console.log('Created default settings.json in /tmp/data');
  }
} catch (error) {
  console.error('Data initialization error:', error);
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
