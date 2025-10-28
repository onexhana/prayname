// API Base URL 설정
// 프로덕션에서는 상대 경로 사용, 개발 환경에서는 localhost 사용
const API_BASE_URL = process.env.REACT_APP_API_URL 
  ? process.env.REACT_APP_API_URL 
  : process.env.NODE_ENV === 'production'
  ? '' // 프로덕션에서는 같은 도메인 사용 (상대 경로)
  : 'http://localhost:5000'; // 개발 환경

export default API_BASE_URL;

