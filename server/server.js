const express = require('express');
const cors = require('cors');
const multer = require('multer');
const xlsx = require('xlsx');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어 설정
const corsOptions = {
  origin: process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : process.env.NODE_ENV === 'production'
    ? true // 프로덕션에서는 모든 origin 허용 (Vercel 도메인)
    : true, // 개발 환경에서는 모든 origin 허용
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// multer 설정 (엑셀 파일 업로드용)
// Vercel 서버리스 환경에서는 메모리 스토리지 사용
const storage = process.env.VERCEL 
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (req, file, cb) => {
        // uploads 디렉토리가 없으면 생성
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
      }
    });

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('엑셀 파일만 업로드 가능합니다.'));
    }
  }
});

// 데이터 파일 경로
const dataPath = path.join(__dirname, 'data', 'students.json');
const settingsPath = path.join(__dirname, 'data', 'settings.json');

// 데이터 읽기 함수
function readData() {
  try {
    // 파일이 존재하는지 먼저 확인
    if (!fs.existsSync(dataPath)) {
      console.log('students.json 파일이 없습니다. 기본값을 반환합니다.');
      return { students: [], adminPassword: 'password' };
    }
    const data = fs.readFileSync(dataPath, 'utf8');
    const parsed = JSON.parse(data);
    // adminPassword가 없으면 기본값 설정
    if (!parsed.adminPassword) {
      parsed.adminPassword = 'password';
    }
    return parsed;
  } catch (error) {
    console.error('데이터 읽기 오류:', error);
    return { students: [], adminPassword: 'password' };
  }
}

// 데이터 쓰기 함수
function writeData(data) {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('데이터 쓰기 오류:', error);
    return false;
  }
}

// 설정 읽기 함수
function readSettings() {
  try {
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf8');
      return JSON.parse(data);
    } else {
      // 기본 설정
      const defaultSettings = {
        scrollSpeed: 600, // 초 단위
        fontSize: 2, // rem 단위
        studentsPerRow: 7, // 데스크톱용 한 줄당 학생 수
        mobileScrollSpeed: 900, // 모바일용 초 단위
        mobileFontSize: 1.5, // 모바일용 rem 단위
        mobileStudentsPerRow: 3 // 모바일용 한 줄당 학생 수
      };
      writeSettings(defaultSettings);
      return defaultSettings;
    }
  } catch (error) {
    console.error('설정 읽기 오류:', error);
    return { scrollSpeed: 600, fontSize: 2, studentsPerRow: 7, mobileScrollSpeed: 900, mobileFontSize: 1.5, mobileStudentsPerRow: 3 };
  }
}

// 설정 쓰기 함수
function writeSettings(settings) {
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    return true;
  } catch (error) {
    console.error('설정 쓰기 오류:', error);
    return false;
  }
}

// API 엔드포인트

// 1. 관리자 로그인
app.post('/api/login', async (req, res) => {
  try {
    console.log('로그인 요청 받음');
    const { password } = req.body;
    console.log('비밀번호 받음:', password ? '비밀번호 있음' : '비밀번호 없음');
    
    const data = readData();
    console.log('데이터 읽기 완료, adminPassword:', data.adminPassword ? '설정됨' : '없음');
    
    if (!password) {
      console.log('비밀번호가 없음');
      return res.status(400).json({ error: '비밀번호를 입력해주세요.' });
    }

    const isValid = password === data.adminPassword;
    console.log('비밀번호 검증 결과:', isValid);
    
    if (isValid) {
      console.log('로그인 성공');
      return res.json({ success: true, message: '로그인 성공' });
    } else {
      console.log('비밀번호 불일치');
      return res.status(401).json({ error: '비밀번호가 올바르지 않습니다.' });
    }
  } catch (error) {
    console.error('로그인 오류:', error);
    console.error('오류 스택:', error.stack);
    return res.status(500).json({ error: '서버 오류가 발생했습니다. ' + error.message });
  }
});

// 2. 전체 명단 조회
app.get('/api/students', (req, res) => {
  try {
    const data = readData();
    // 가나다 순으로 정렬
    const sortedStudents = data.students.sort((a, b) => a.localeCompare(b, 'ko'));
    res.json({ students: sortedStudents });
  } catch (error) {
    console.error('명단 조회 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 3. 학생 추가 (단일 또는 여러명)
app.post('/api/students', (req, res) => {
  try {
    const { name } = req.body;
    const data = readData();
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: '이름을 입력해주세요.' });
    }

    // 쉼표로 구분된 이름들을 분리하고 정리
    const names = name.split(',')
      .map(n => n.trim())
      .filter(n => n !== '');

    if (names.length === 0) {
      return res.status(400).json({ error: '유효한 이름을 입력해주세요.' });
    }

    // 중복 체크
    const existingStudents = data.students;
    const newStudents = names.filter(name => !existingStudents.includes(name));
    const duplicates = names.filter(name => existingStudents.includes(name));

    if (newStudents.length === 0) {
      return res.status(400).json({ 
        error: duplicates.length === 1 
          ? '이미 등록된 이름입니다.' 
          : '모든 이름이 이미 등록되어 있습니다.'
      });
    }

    // 새 학생들 추가
    data.students = [...data.students, ...newStudents];
    
    if (writeData(data)) {
      // 가나다 순으로 정렬된 목록 반환
      const sortedStudents = data.students.sort((a, b) => a.localeCompare(b, 'ko'));
      
      let message = `${newStudents.length}명이 추가되었습니다.`;
      if (duplicates.length > 0) {
        message += ` (중복 제외: ${duplicates.length}명)`;
      }
      
      res.json({ 
        success: true, 
        message: message,
        students: sortedStudents,
        added: newStudents,
        duplicates: duplicates
      });
    } else {
      res.status(500).json({ error: '데이터 저장에 실패했습니다.' });
    }
  } catch (error) {
    console.error('학생 추가 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 4. 엑셀 파일 업로드 및 일괄 추가
app.post('/api/students/upload', upload.single('file'), (req, res) => {
  let tempFilePath = null;
  
  try {
    if (!req.file) {
    return res.status(400).json({ error: '파일을 선택해주세요.' });
    }

    let workbook;
    // Vercel 서버리스 환경에서는 메모리에서 읽기
    if (req.file.buffer) {
      workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    } else {
      // 로컬 환경에서는 파일 경로에서 읽기
      tempFilePath = req.file.path;
      workbook = xlsx.readFile(tempFilePath);
    }
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    if (jsonData.length === 0) {
      // 업로드 파일 삭제 (로컬 환경에서만)
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      return res.status(400).json({ error: '엑셀 파일에 데이터가 없습니다.' });
    }

    // '이름' 열 찾기
    let nameColumn = null;
    const firstRow = jsonData[0];
    const possibleNameColumns = ['이름', 'name', 'Name', 'NAME', '성명', '학생명'];
    
    for (const column of possibleNameColumns) {
      if (firstRow.hasOwnProperty(column)) {
        nameColumn = column;
        break;
      }
    }

    if (!nameColumn) {
      // 업로드 파일 삭제 (로컬 환경에서만)
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      return res.status(400).json({ error: '엑셀 파일에서 "이름" 열을 찾을 수 없습니다.' });
    }

    // 이름 추출
    const names = jsonData
      .map(row => row[nameColumn])
      .filter(name => name && typeof name === 'string' && name.trim() !== '')
      .map(name => name.trim());

    if (names.length === 0) {
      // 업로드 파일 삭제 (로컬 환경에서만)
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      return res.status(400).json({ error: '유효한 이름이 없습니다.' });
    }

    // 기존 데이터와 비교하여 중복 제거
    const data = readData();
    const existingStudents = data.students;
    const newStudents = names.filter(name => !existingStudents.includes(name));
    const duplicates = names.filter(name => existingStudents.includes(name));

    // 새 학생들 추가
    data.students = [...data.students, ...newStudents];

    if (writeData(data)) {
      // 업로드 파일 삭제 (로컬 환경에서만)
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      
      // 가나다 순으로 정렬된 목록 반환
      const sortedStudents = data.students.sort((a, b) => a.localeCompare(b, 'ko'));
      
      res.json({
        success: true,
        message: `${newStudents.length}명이 추가되었습니다.`,
        added: newStudents,
        duplicates: duplicates,
        totalStudents: data.students.length,
        students: sortedStudents
      });
    } else {
      // 업로드 파일 삭제 (로컬 환경에서만)
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      res.status(500).json({ error: '데이터 저장에 실패했습니다.' });
    }
  } catch (error) {
    console.error('엑셀 업로드 오류:', error);
    // 업로드 파일 삭제 (로컬 환경에서만)
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
    res.status(500).json({ error: '파일 처리 중 오류가 발생했습니다.' });
  }
});

// 5. 학생 삭제
app.delete('/api/students/:name', (req, res) => {
  try {
    const { name } = req.params;
    const data = readData();
    
    const studentIndex = data.students.indexOf(name);
    if (studentIndex === -1) {
      return res.status(404).json({ error: '해당 학생을 찾을 수 없습니다.' });
    }

    // 학생 삭제
    data.students.splice(studentIndex, 1);
    
    if (writeData(data)) {
      // 가나다 순으로 정렬된 목록 반환
      const sortedStudents = data.students.sort((a, b) => a.localeCompare(b, 'ko'));
      res.json({ 
        success: true, 
        message: `${name}님이 명단에서 삭제되었습니다.`,
        students: sortedStudents
      });
    } else {
      res.status(500).json({ error: '데이터 저장에 실패했습니다.' });
    }
  } catch (error) {
    console.error('학생 삭제 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 6. 설정 조회
app.get('/api/settings', (req, res) => {
  try {
    const settings = readSettings();
    res.json(settings);
  } catch (error) {
    console.error('설정 조회 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 7. 설정 업데이트
app.put('/api/settings', (req, res) => {
  try {
    const { scrollSpeed, fontSize, studentsPerRow, mobileScrollSpeed, mobileFontSize, mobileStudentsPerRow } = req.body;
    
    if (scrollSpeed && (scrollSpeed < 30 || scrollSpeed > 1800)) {
      return res.status(400).json({ error: '데스크톱 스크롤 속도는 30초에서 1800초 사이여야 합니다.' });
    }
    
    if (fontSize && (fontSize < 0.5 || fontSize > 5)) {
      return res.status(400).json({ error: '데스크톱 글씨 크기는 0.5rem에서 5rem 사이여야 합니다.' });
    }

    if (studentsPerRow && (studentsPerRow < 1 || studentsPerRow > 10)) {
      return res.status(400).json({ error: '데스크톱 한 줄당 학생 수는 1명에서 10명 사이여야 합니다.' });
    }

    if (mobileScrollSpeed && (mobileScrollSpeed < 30 || mobileScrollSpeed > 1800)) {
      return res.status(400).json({ error: '모바일 스크롤 속도는 30초에서 1800초 사이여야 합니다.' });
    }
    
    if (mobileFontSize && (mobileFontSize < 0.5 || mobileFontSize > 5)) {
      return res.status(400).json({ error: '모바일 글씨 크기는 0.5rem에서 5rem 사이여야 합니다.' });
    }

    if (mobileStudentsPerRow && (mobileStudentsPerRow < 1 || mobileStudentsPerRow > 6)) {
      return res.status(400).json({ error: '모바일 한 줄당 학생 수는 1명에서 6명 사이여야 합니다.' });
    }

    const currentSettings = readSettings();
    const updatedSettings = {
      scrollSpeed: scrollSpeed !== undefined ? scrollSpeed : currentSettings.scrollSpeed,
      fontSize: fontSize !== undefined ? fontSize : currentSettings.fontSize,
      studentsPerRow: studentsPerRow !== undefined ? studentsPerRow : (currentSettings.studentsPerRow || 7),
      mobileScrollSpeed: mobileScrollSpeed !== undefined ? mobileScrollSpeed : currentSettings.mobileScrollSpeed,
      mobileFontSize: mobileFontSize !== undefined ? mobileFontSize : currentSettings.mobileFontSize,
      mobileStudentsPerRow: mobileStudentsPerRow !== undefined ? mobileStudentsPerRow : currentSettings.mobileStudentsPerRow
    };
    
    if (writeSettings(updatedSettings)) {
      res.json({ 
        success: true, 
        message: '설정이 업데이트되었습니다.',
        settings: updatedSettings
      });
    } else {
      res.status(500).json({ error: '설정 저장에 실패했습니다.' });
    }
  } catch (error) {
    console.error('설정 업데이트 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 8. 전체 학생 삭제
app.delete('/api/students', (req, res) => {
  try {
    const data = readData();
    const totalCount = data.students.length;
    
    if (totalCount === 0) {
      return res.status(400).json({ error: '삭제할 학생이 없습니다.' });
    }

    // 모든 학생 삭제
    data.students = [];
    
    if (writeData(data)) {
      res.json({ 
        success: true, 
        message: `전체 ${totalCount}명의 학생이 삭제되었습니다.`,
        students: []
      });
    } else {
      res.status(500).json({ error: '데이터 저장에 실패했습니다.' });
    }
  } catch (error) {
    console.error('전체 학생 삭제 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 프로덕션 환경에서 React 빌드 파일 서빙 (로컬 개발용)
if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// Vercel 서버리스 함수로 export 또는 로컬 서버 시작
// Vercel 환경에서는 항상 export
if (process.env.VERCEL || process.env.VERCEL_ENV) {
  console.log('Vercel 환경으로 서버리스 함수로 export합니다.');
  module.exports = app;
} else {
  // 로컬 개발 서버 시작
  app.listen(PORT, () => {
    console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
  });
}
