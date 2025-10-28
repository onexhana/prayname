// Vercel 서버리스 함수 - Express 앱 래핑
// Vercel은 Express 앱을 자동으로 서버리스 함수로 변환합니다

// 환경 설정
process.env.VERCEL = '1';

// Express 앱 require (server.js가 VERCEL 환경을 감지하여 app을 export)
module.exports = require('../server/server');
