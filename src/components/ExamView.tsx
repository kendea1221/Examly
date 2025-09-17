import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Question {
  id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
}

interface ExamData {
  exam: {
    id: number;
    title: string;
    description: string;
  };
  teacher: {
    name: string;
  };
  questions: Question[];
}

interface Result {
  score: number;
  totalQuestions: number;
  percentage: number;
}

const ExamView: React.FC = () => {
  const { teacher, examId } = useParams<{ teacher: string; examId: string }>();
  const navigate = useNavigate();
  
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [studentName, setStudentName] = useState('');
  const [answers, setAnswers] = useState<{ [questionId: number]: string }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    if (teacher && examId) {
      fetchExamData();
    }
  }, [teacher, examId]);

  const fetchExamData = async () => {
    try {
      const response = await fetch(`/api/exam/${encodeURIComponent(teacher!)}/${examId}`);
      if (!response.ok) throw new Error('Failed to fetch exam data');
      const data = await response.json();
      setExamData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = async () => {
    if (!studentName.trim()) {
      alert('Please enter your name');
      return;
    }

    if (!examData || Object.keys(answers).length !== examData.questions.length) {
      alert('Please answer all questions');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/exam/${encodeURIComponent(teacher!)}/${examId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentName,
          answers
        }),
      });

      if (!response.ok) throw new Error('Failed to submit exam');
      const result = await response.json();
      setResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit exam');
    } finally {
      setSubmitting(false);
    }
  };

  const goHome = () => {
    navigate('/');
  };

  if (loading) return <div className="loading">Loading exam...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!examData) return <div className="error">Exam not found</div>;

  if (result) {
    return (
      <div className="result-container">
        <h2>Exam Completed!</h2>
        <div className="score-display">{result.percentage}%</div>
        <div className="score-details">
          You scored {result.score} out of {result.totalQuestions} questions correctly
        </div>
        <button onClick={goHome} className="back-button">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="exam-container">
      <div className="exam-header">
        <h2>{examData.exam.title}</h2>
        <p>Teacher: {examData.teacher.name}</p>
        {examData.exam.description && <p>{examData.exam.description}</p>}
      </div>

      <div className="student-info">
        <label htmlFor="studentName">Student Name:</label>
        <input
          id="studentName"
          type="text"
          placeholder="Enter your name"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          disabled={submitting}
        />
      </div>

      {examData.questions.map((question, index) => (
        <div key={question.id} className="question-card">
          <div className="question-text">
            {index + 1}. {question.question_text}
          </div>
          <div className="options">
            {['A', 'B', 'C', 'D'].map(option => {
              const optionText = question[`option_${option.toLowerCase()}` as keyof Question] as string;
              const isSelected = answers[question.id] === option;
              return (
                <div 
                  key={option}
                  className={`option ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleAnswerChange(question.id, option)}
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={option}
                    checked={isSelected}
                    onChange={() => handleAnswerChange(question.id, option)}
                    disabled={submitting}
                  />
                  <label>
                    {option}. {optionText}
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <button 
        onClick={handleSubmit}
        disabled={submitting || !studentName.trim() || Object.keys(answers).length !== examData.questions.length}
        className="submit-button"
      >
        {submitting ? 'Submitting...' : 'Submit Exam'}
      </button>
    </div>
  );
};

export default ExamView;