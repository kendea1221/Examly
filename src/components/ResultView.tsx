import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

interface StudentResult {
  id: number;
  student_name: string;
  score: number;
  total_questions: number;
  completed_at: string;
}

const ResultView: React.FC = () => {
  const { teacher, examId } = useParams<{ teacher: string; examId: string }>();
  const [results, setResults] = useState<StudentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (teacher && examId) {
      fetchResults();
    }
  }, [teacher, examId]);

  const fetchResults = async () => {
    try {
      const response = await fetch(`/api/exam/${encodeURIComponent(teacher!)}/${examId}/results`);
      if (!response.ok) throw new Error('Failed to fetch results');
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculatePercentage = (score: number, total: number) => {
    return Math.round((score / total) * 100);
  };

  if (loading) return <div className="loading">Loading results...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="result-container">
      <h2>Exam Results</h2>
      <p>Teacher: {decodeURIComponent(teacher || '')}</p>
      
      {results.length === 0 ? (
        <p>No results available yet.</p>
      ) : (
        <div>
          <h3>Student Results ({results.length} submissions)</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>Student Name</th>
                <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #dee2e6' }}>Score</th>
                <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #dee2e6' }}>Percentage</th>
                <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #dee2e6' }}>Completed At</th>
              </tr>
            </thead>
            <tbody>
              {results.map(result => (
                <tr key={result.id}>
                  <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{result.student_name}</td>
                  <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #dee2e6' }}>
                    {result.score}/{result.total_questions}
                  </td>
                  <td style={{ 
                    padding: '12px', 
                    textAlign: 'center', 
                    border: '1px solid #dee2e6',
                    color: calculatePercentage(result.score, result.total_questions) >= 60 ? '#28a745' : '#dc3545',
                    fontWeight: 'bold'
                  }}>
                    {calculatePercentage(result.score, result.total_questions)}%
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #dee2e6' }}>
                    {formatDate(result.completed_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div style={{ marginTop: '30px', textAlign: 'center' }}>
            <h4>Statistics</h4>
            <p>Average Score: {(results.reduce((sum, r) => sum + calculatePercentage(r.score, r.total_questions), 0) / results.length).toFixed(1)}%</p>
            <p>Pass Rate (≥60%): {Math.round((results.filter(r => calculatePercentage(r.score, r.total_questions) >= 60).length / results.length) * 100)}%</p>
          </div>
        </div>
      )}
      
      <div style={{ marginTop: '30px' }}>
        <Link to={`/exam/${teacher}/${examId}`} className="back-button" style={{ marginRight: '10px' }}>
          Take Exam
        </Link>
        <Link to="/" className="back-button">
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default ResultView;