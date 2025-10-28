import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Login from './Login';
import API_BASE_URL from '../config';

const AdminPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  
  // 수동 추가 상태
  const [newStudentName, setNewStudentName] = useState('');
  
  // 엑셀 업로드 상태
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  // 설정 상태
  const [settings, setSettings] = useState({ 
    scrollSpeed: 600, 
    fontSize: 2, 
    studentsPerRow: 7,
    mobileScrollSpeed: 900, 
    mobileFontSize: 1.5, 
    mobileStudentsPerRow: 3 
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  
  // 검색 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchStudents();
      fetchSettings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/students`);
      setStudents(response.data.students);
      setFilteredStudents(response.data.students);
    } catch (error) {
      console.error('명단 조회 오류:', error);
      showMessage('명단을 불러오는데 실패했습니다.', 'error');
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/settings`);
      setSettings(response.data);
    } catch (error) {
      console.error('설정 조회 오류:', error);
      showMessage('설정을 불러오는데 실패했습니다.', 'error');
    }
  };

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!newStudentName.trim()) {
      showMessage('이름을 입력해주세요.', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/students`, { 
        name: newStudentName.trim() 
      });
      
      if (response.data.success) {
        setStudents(response.data.students);
        setFilteredStudents(response.data.students);
        setNewStudentName('');
        showMessage(response.data.message, 'success');
      }
    } catch (error) {
      if (error.response && error.response.data.error) {
        showMessage(error.response.data.error, 'error');
      } else {
        showMessage('학생 추가 중 오류가 발생했습니다.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      showMessage('파일을 선택해주세요.', 'error');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', uploadFile);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/students/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setStudents(response.data.students);
        setFilteredStudents(response.data.students);
        setUploadFile(null);
        document.getElementById('fileInput').value = '';
        
        let message = response.data.message;
        if (response.data.duplicates.length > 0) {
          message += ` (중복 제외: ${response.data.duplicates.length}명)`;
        }
        showMessage(message, 'success');
      }
    } catch (error) {
      if (error.response && error.response.data.error) {
        showMessage(error.response.data.error, 'error');
      } else {
        showMessage('파일 업로드 중 오류가 발생했습니다.', 'error');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteStudent = async (studentName) => {
    if (!window.confirm(`${studentName}님을 명단에서 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const response = await axios.delete(`${API_BASE_URL}/api/students/${encodeURIComponent(studentName)}`);
      
      if (response.data.success) {
        setStudents(response.data.students);
        setFilteredStudents(response.data.students);
        showMessage(response.data.message, 'success');
      }
    } catch (error) {
      if (error.response && error.response.data.error) {
        showMessage(error.response.data.error, 'error');
      } else {
        showMessage('학생 삭제 중 오류가 발생했습니다.', 'error');
      }
    }
  };

  const handleSettingsUpdate = async (e) => {
    e.preventDefault();
    setSettingsLoading(true);
    
    try {
      const response = await axios.put(`${API_BASE_URL}/api/settings`, settings);
      
      if (response.data.success) {
        setSettings(response.data.settings);
        showMessage(response.data.message, 'success');
      }
    } catch (error) {
      if (error.response && error.response.data.error) {
        showMessage(error.response.data.error, 'error');
      } else {
        showMessage('설정 업데이트 중 오류가 발생했습니다.', 'error');
      }
    } finally {
      setSettingsLoading(false);
    }
  };

  // 검색 기능
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.trim() === '') {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(student => 
        student.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  };

  // 검색 초기화
  const clearSearch = () => {
    setSearchTerm('');
    setFilteredStudents(students);
  };

  // 전체 삭제 기능
  const handleDeleteAll = async () => {
    if (students.length === 0) {
      showMessage('삭제할 학생이 없습니다.', 'error');
      return;
    }

    const confirmMessage = `정말로 전체 ${students.length}명의 학생을 모두 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await axios.delete(`${API_BASE_URL}/api/students`);
      
      if (response.data.success) {
        setStudents(response.data.students);
        setFilteredStudents(response.data.students);
        setSearchTerm('');
        showMessage(response.data.message, 'success');
      }
    } catch (error) {
      if (error.response && error.response.data.error) {
        showMessage(error.response.data.error, 'error');
      } else {
        showMessage('전체 삭제 중 오류가 발생했습니다.', 'error');
      }
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1 className="admin-title">관리자 페이지</h1>
        <p className="admin-subtitle">수험생 명단 관리</p>
        <Link to="/" className="btn btn-secondary">
          메인 페이지로 돌아가기
        </Link>
      </div>

      {message && (
        <div className={`message message-${messageType}`}>
          {message}
        </div>
      )}

      <div className="admin-content">
        {/* 수동 추가 섹션 */}
        <div className="admin-card">
          <h2 className="card-title">
            <span className="card-icon">✏️</span>
            수동 추가
          </h2>
          <form onSubmit={handleAddStudent}>
            <div className="form-group">
              <label className="form-label" htmlFor="studentName">
                학생 이름 (여러명 추가 가능)
              </label>
              <input
                type="text"
                id="studentName"
                className="form-input"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                placeholder="예: 이요셉, 박예수, 강잠언 (쉼표로 구분)"
                disabled={loading}
              />
              <small style={{ color: '#7f8c8d', marginTop: '0.5rem', display: 'block' }}>
                여러 학생을 한 번에 추가하려면 쉼표(,)로 구분하여 입력하세요.
              </small>
            </div>
            <button 
              type="submit" 
              className="btn btn-success"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="loading"></div>
                  추가 중...
                </>
              ) : (
                <>
                  ➕ 학생 추가
                </>
              )}
            </button>
          </form>
        </div>

        {/* 엑셀 업로드 섹션 */}
        <div className="admin-card">
          <h2 className="card-title">
            <span className="card-icon">📊</span>
            엑셀 파일 업로드
          </h2>
          <form onSubmit={handleFileUpload}>
            <div className="form-group">
              <label className="form-label" htmlFor="fileInput">
                엑셀 파일 선택
              </label>
              <input
                type="file"
                id="fileInput"
                className="form-input"
                accept=".xlsx,.xls"
                onChange={(e) => setUploadFile(e.target.files[0])}
                disabled={uploading}
              />
              <small style={{ color: '#7f8c8d', marginTop: '0.5rem', display: 'block' }}>
                엑셀 파일의 '이름' 열을 자동으로 인식합니다.
              </small>
            </div>
            <button 
              type="submit" 
              className="btn btn-success"
              disabled={uploading || !uploadFile}
            >
              {uploading ? (
                <>
                  <div className="loading"></div>
                  업로드 중...
                </>
              ) : (
                <>
                  📤 파일 업로드
                </>
              )}
            </button>
          </form>
        </div>

        {/* 데스크톱 설정 섹션 */}
        <div className="admin-card">
          <h2 className="card-title">
            <span className="card-icon">🖥️</span>
            데스크톱 설정
          </h2>
          <form onSubmit={handleSettingsUpdate}>
            <div className="form-group">
              <label className="form-label" htmlFor="scrollSpeed">
                스크롤 속도 (초)
              </label>
              <input
                type="number"
                id="scrollSpeed"
                className="form-input"
                value={settings.scrollSpeed}
                onChange={(e) => setSettings({...settings, scrollSpeed: parseInt(e.target.value) || 600})}
                min="30"
                max="1800"
                disabled={settingsLoading}
              />
              <small style={{ color: '#7f8c8d', marginTop: '0.5rem', display: 'block' }}>
                30초 ~ 1800초 (현재: {settings.scrollSpeed}초)
              </small>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="fontSize">
                글씨 크기 (rem)
              </label>
              <input
                type="number"
                id="fontSize"
                className="form-input"
                value={settings.fontSize}
                onChange={(e) => setSettings({...settings, fontSize: parseFloat(e.target.value) || 2})}
                min="0.5"
                max="5"
                step="0.1"
                disabled={settingsLoading}
              />
              <small style={{ color: '#7f8c8d', marginTop: '0.5rem', display: 'block' }}>
                0.5rem ~ 5rem (현재: {settings.fontSize}rem)
              </small>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="studentsPerRow">
                한 줄당 학생 수
              </label>
              <input
                type="number"
                id="studentsPerRow"
                className="form-input"
                value={settings.studentsPerRow}
                onChange={(e) => setSettings({...settings, studentsPerRow: parseInt(e.target.value) || 7})}
                min="1"
                max="10"
                disabled={settingsLoading}
              />
              <small style={{ color: '#7f8c8d', marginTop: '0.5rem', display: 'block' }}>
                1명 ~ 10명 (현재: {settings.studentsPerRow}명)
              </small>
            </div>
            <button 
              type="submit" 
              className="btn btn-success"
              disabled={settingsLoading}
            >
              {settingsLoading ? (
                <>
                  <div className="loading"></div>
                  저장 중...
                </>
              ) : (
                <>
                  💾 설정 저장
                </>
              )}
            </button>
          </form>
        </div>

        {/* 모바일 설정 섹션 */}
        <div className="admin-card">
          <h2 className="card-title">
            <span className="card-icon">📱</span>
            모바일 설정
          </h2>
          <form onSubmit={handleSettingsUpdate}>
            <div className="form-group">
              <label className="form-label" htmlFor="mobileScrollSpeed">
                스크롤 속도 (초)
              </label>
              <input
                type="number"
                id="mobileScrollSpeed"
                className="form-input"
                value={settings.mobileScrollSpeed}
                onChange={(e) => setSettings({...settings, mobileScrollSpeed: parseInt(e.target.value) || 900})}
                min="30"
                max="1800"
                disabled={settingsLoading}
              />
              <small style={{ color: '#7f8c8d', marginTop: '0.5rem', display: 'block' }}>
                30초 ~ 1800초 (현재: {settings.mobileScrollSpeed}초)
              </small>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="mobileFontSize">
                글씨 크기 (rem)
              </label>
              <input
                type="number"
                id="mobileFontSize"
                className="form-input"
                value={settings.mobileFontSize}
                onChange={(e) => setSettings({...settings, mobileFontSize: parseFloat(e.target.value) || 1.5})}
                min="0.5"
                max="5"
                step="0.1"
                disabled={settingsLoading}
              />
              <small style={{ color: '#7f8c8d', marginTop: '0.5rem', display: 'block' }}>
                0.5rem ~ 5rem (현재: {settings.mobileFontSize}rem)
              </small>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="mobileStudentsPerRow">
                한 줄당 학생 수
              </label>
              <input
                type="number"
                id="mobileStudentsPerRow"
                className="form-input"
                value={settings.mobileStudentsPerRow}
                onChange={(e) => setSettings({...settings, mobileStudentsPerRow: parseInt(e.target.value) || 3})}
                min="1"
                max="6"
                disabled={settingsLoading}
              />
              <small style={{ color: '#7f8c8d', marginTop: '0.5rem', display: 'block' }}>
                1명 ~ 6명 (현재: {settings.mobileStudentsPerRow}명)
              </small>
            </div>
            <button 
              type="submit" 
              className="btn btn-success"
              disabled={settingsLoading}
            >
              {settingsLoading ? (
                <>
                  <div className="loading"></div>
                  저장 중...
                </>
              ) : (
                <>
                  💾 설정 저장
                </>
              )}
            </button>
          </form>
        </div>

        {/* 명단 관리 섹션 */}
        <div className="admin-card" style={{ gridColumn: '1 / -1' }}>
          <h2 className="card-title">
            <span className="card-icon">👥</span>
            명단 관리 (총 {students.length}명)
            {searchTerm && (
              <span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: '#7f8c8d' }}>
                {' '}- 검색 결과: {filteredStudents.length}명
              </span>
            )}
          </h2>
          
          {/* 검색 기능 */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" htmlFor="searchInput">
              🔍 학생 이름 검색
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="text"
                id="searchInput"
                className="form-input"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="학생 이름을 입력하세요..."
                style={{ flex: 1 }}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={clearSearch}
                  style={{ padding: '0.8rem 1rem' }}
                >
                  ✕ 초기화
                </button>
              )}
            </div>
            {searchTerm && (
              <small style={{ color: '#7f8c8d', marginTop: '0.5rem', display: 'block' }}>
                "{searchTerm}" 검색 결과: {filteredStudents.length}명
              </small>
            )}
          </div>

          {/* 전체 삭제 버튼 */}
          {students.length > 0 && (
            <div style={{ marginBottom: '1.5rem', textAlign: 'right' }}>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDeleteAll}
                style={{ 
                  padding: '0.8rem 1.5rem',
                  fontSize: '0.9rem'
                }}
              >
                🗑️ 전체 삭제 ({students.length}명)
              </button>
              <small style={{ color: '#e74c3c', marginTop: '0.5rem', display: 'block' }}>
                ⚠️ 이 작업은 되돌릴 수 없습니다!
              </small>
            </div>
          )}

          {filteredStudents.length > 0 ? (
            <div className="students-list">
              {filteredStudents.map((student, index) => (
                <div key={index} className="student-item">
                  <span className="student-name-admin">{student}</span>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteStudent(student)}
                    disabled={loading}
                  >
                    🗑️ 삭제
                  </button>
                </div>
              ))}
            </div>
          ) : searchTerm ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <div className="empty-state-text">
                "{searchTerm}"에 해당하는 학생을 찾을 수 없습니다.<br />
                다른 검색어를 시도해보세요.
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <div className="empty-state-text">
                등록된 학생이 없습니다.<br />
                위의 방법으로 학생을 추가해주세요.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
