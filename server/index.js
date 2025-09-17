const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../build')));

// Database setup
const dbPath = path.join(__dirname, '../database/examly.db');
const db = new sqlite3.Database(dbPath);

// Initialize database
const schemaPath = path.join(__dirname, '../database/schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');
db.exec(schema, (err) => {
  if (err) {
    console.error('Error initializing database:', err);
  } else {
    console.log('Database initialized successfully');
  }
});

// API Routes

// Get all teachers
app.get('/api/teachers', (req, res) => {
  db.all('SELECT * FROM teachers ORDER BY name', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get exams by teacher
app.get('/api/teachers/:teacherId/exams', (req, res) => {
  const teacherId = req.params.teacherId;
  db.all(
    'SELECT e.*, t.name as teacher_name FROM exams e JOIN teachers t ON e.teacher_id = t.id WHERE e.teacher_id = ?',
    [teacherId],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// Get specific exam with questions
app.get('/api/exam/:teacher/:examId', (req, res) => {
  const { teacher, examId } = req.params;
  
  // First get teacher info
  db.get('SELECT * FROM teachers WHERE name = ?', [teacher], (err, teacherRow) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!teacherRow) {
      res.status(404).json({ error: 'Teacher not found' });
      return;
    }

    // Get exam info
    db.get(
      'SELECT * FROM exams WHERE id = ? AND teacher_id = ?',
      [examId, teacherRow.id],
      (err, examRow) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        if (!examRow) {
          res.status(404).json({ error: 'Exam not found' });
          return;
        }

        // Get questions
        db.all(
          'SELECT id, question_text, option_a, option_b, option_c, option_d FROM questions WHERE exam_id = ? ORDER BY id',
          [examId],
          (err, questions) => {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }

            res.json({
              exam: examRow,
              teacher: teacherRow,
              questions
            });
          }
        );
      }
    );
  });
});

// Submit exam answers
app.post('/api/exam/:teacher/:examId/submit', (req, res) => {
  const { teacher, examId } = req.params;
  const { studentName, answers } = req.body;

  // Get teacher and exam info
  db.get('SELECT * FROM teachers WHERE name = ?', [teacher], (err, teacherRow) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!teacherRow) {
      res.status(404).json({ error: 'Teacher not found' });
      return;
    }

    // Get questions with correct answers
    db.all(
      'SELECT id, correct_answer FROM questions WHERE exam_id = ?',
      [examId],
      (err, questions) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }

        // Calculate score
        let score = 0;
        const totalQuestions = questions.length;

        questions.forEach(question => {
          if (answers[question.id] === question.correct_answer) {
            score++;
          }
        });

        // Save result
        db.run(
          'INSERT INTO student_results (exam_id, student_name, answers, score, total_questions) VALUES (?, ?, ?, ?, ?)',
          [examId, studentName, JSON.stringify(answers), score, totalQuestions],
          function(err) {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }

            res.json({
              score,
              totalQuestions,
              percentage: Math.round((score / totalQuestions) * 100)
            });
          }
        );
      }
    );
  });
});

// Get exam results
app.get('/api/exam/:teacher/:examId/results', (req, res) => {
  const { teacher, examId } = req.params;
  
  db.get('SELECT * FROM teachers WHERE name = ?', [teacher], (err, teacherRow) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!teacherRow) {
      res.status(404).json({ error: 'Teacher not found' });
      return;
    }

    db.all(
      'SELECT * FROM student_results WHERE exam_id = ? ORDER BY completed_at DESC',
      [examId],
      (err, results) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json(results);
      }
    );
  });
});

// Serve React app for all other routes
app.use((req, res) => {
  // Only serve index.html for non-API routes
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../build/index.html'));
  } else {
    res.status(404).json({ error: 'API endpoint not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;