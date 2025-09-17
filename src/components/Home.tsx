import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Teacher {
  id: number;
  name: string;
}

interface Exam {
  id: number;
  title: string;
  description: string;
  teacher_name: string;
}

const Home: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [exams, setExams] = useState<{ [key: number]: Exam[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await fetch('/api/teachers');
      if (!response.ok) throw new Error('Failed to fetch teachers');
      const teachersData = await response.json();
      setTeachers(teachersData);

      // Fetch exams for each teacher
      const examsData: { [key: number]: Exam[] } = {};
      for (const teacher of teachersData) {
        const examResponse = await fetch(`/api/teachers/${teacher.id}/exams`);
        if (examResponse.ok) {
          examsData[teacher.id] = await examResponse.json();
        }
      }
      setExams(examsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="home-container">
      <h2>Available Exams</h2>
      <p>Click on any exam to start taking the test!</p>
      
      <div className="teachers-list">
        {teachers.map(teacher => (
          <div key={teacher.id} className="teacher-card">
            <h3>{teacher.name}</h3>
            {exams[teacher.id] && exams[teacher.id].length > 0 ? (
              <ul className="exams-list">
                {exams[teacher.id].map(exam => (
                  <li key={exam.id}>
                    <Link 
                      to={`/exam/${encodeURIComponent(teacher.name)}/${exam.id}`}
                      className="exam-link"
                    >
                      {exam.title}
                      {exam.description && <div style={{fontSize: '0.9em', opacity: 0.8}}>{exam.description}</div>}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No exams available</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;