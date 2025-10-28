import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';

const MainPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false); // 로딩을 false로 시작
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState({ 
    scrollSpeed: 600, 
    fontSize: 2, 
    studentsPerRow: 7,
    mobileScrollSpeed: 900, 
    mobileFontSize: 1.5, 
    mobileStudentsPerRow: 3 
  });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    fetchStudents();
    fetchSettings();
    checkMobile();
    
    // 모바일 감지 이벤트 리스너
    const handleResize = () => {
      checkMobile();
    };
    
    // 페이지 포커스 시 설정 다시 가져오기 (설정 변경 반영)
    const handleFocus = () => {
      fetchSettings();
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const checkMobile = () => {
    const isMobileDevice = window.innerWidth <= 768;
    setIsMobile(isMobileDevice);
    console.log('Mobile detected:', isMobileDevice, 'Width:', window.innerWidth);
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/students`);
      setStudents(response.data.students);
    } catch (error) {
      console.error('명단 조회 오류:', error);
      setError('명단을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/settings`);
      setSettings(response.data);
    } catch (error) {
      console.error('설정 조회 오류:', error);
      // 설정 조회 실패 시 기본값 유지
    }
  };

  // 명단을 그룹화하여 한 줄에 표시 (모바일/데스크톱 구분)
  const groupStudents = (students, groupSize) => {
    const groups = [];
    for (let i = 0; i < students.length; i += groupSize) {
      groups.push(students.slice(i, i + groupSize));
    }
    return groups;
  };

  // 명단을 10번 복제하여 진짜 무한 스크롤 구현
  const infiniteStudents = [];
  for (let i = 0; i < 10; i++) {
    infiniteStudents.push(...students);
  }
  
  // 모바일/데스크톱에 따라 다른 그룹 크기 사용
  const groupSize = isMobile ? settings.mobileStudentsPerRow : (settings.studentsPerRow || 7);
  const studentGroups = groupStudents(infiniteStudents, groupSize);
  
  // 현재 사용할 설정값 (모바일/데스크톱 구분)
  const currentScrollSpeed = isMobile ? settings.mobileScrollSpeed : settings.scrollSpeed;
  const currentFontSize = isMobile ? settings.mobileFontSize : settings.fontSize;


  // 로딩 중일 때도 기본 화면을 보여주고, 명단만 로딩 표시
  if (loading && students.length === 0) {
    return (
      <div className="main-container">
        <div className="main-header">
          <h1 className="main-title">2026 수능 수험생 기도 명단</h1>
          <p className="main-subtitle">모두의 합격을 기원합니다 🙏</p>
          <div className="loading"></div>
          <p style={{ marginTop: '1rem', color: '#7f8c8d' }}>명단을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-container">
        <div className="main-header">
          <h1 className="main-title">2026 수능 수험생 기도 명단</h1>
          <p className="main-subtitle">모두의 합격을 기원합니다 🙏</p>
          <div className="message message-error">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-container">
      <div className="main-header">
        <h1 className="main-title">2026 수능 수험생 기도 명단</h1>
        <p className="main-subtitle">모두의 합격을 기원합니다 🙏</p>
        <div className="student-count">
          총 {students.length}명의 수험생이 등록되어 있습니다
          {loading && <span style={{ marginLeft: '1rem', color: '#7f8c8d' }}>업데이트 중...</span>}
        </div>
      </div>

      {students.length > 0 ? (
        <div className="credits-container">
          <div 
            className="credits-content immediate"
            style={{
              animation: `scrollUpInfinite ${currentScrollSpeed}s linear infinite`,
              animationDelay: '0s'
            }}
          >
            {studentGroups.map((group, groupIndex) => (
              <div key={`group-${groupIndex}`} className="student-row">
                {group.map((student, studentIndex) => (
                  <div 
                    key={`${student}-${groupIndex}-${studentIndex}`} 
                    className="student-name"
                    style={{
                      fontSize: `${currentFontSize}rem`
                    }}
                  >
                    {student}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <div className="empty-state-text">
            아직 등록된 수험생이 없습니다.<br />
            관리자 페이지에서 명단을 추가해주세요.
          </div>
        </div>
      )}
    </div>
  );
};

export default MainPage;
