CREATE TABLE IF NOT EXISTS teachers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS exams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    teacher_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id)
);

CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exam_id INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_answer CHAR(1) NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(id)
);

CREATE TABLE IF NOT EXISTS student_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exam_id INTEGER NOT NULL,
    student_name TEXT NOT NULL,
    answers TEXT NOT NULL, -- JSON string storing student answers
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(id)
);

-- Insert sample data
INSERT INTO teachers (name) VALUES 
    ('田中先生'),
    ('佐藤先生');

INSERT INTO exams (teacher_id, title, description) VALUES 
    (1, '数学基礎テスト', '基本的な数学の問題'),
    (2, '英語単語テスト', '基本英単語の確認');

INSERT INTO questions (exam_id, question_text, option_a, option_b, option_c, option_d, correct_answer) VALUES 
    (1, '2 + 2 = ?', '3', '4', '5', '6', 'B'),
    (1, '5 × 3 = ?', '15', '12', '18', '20', 'A'),
    (1, '10 ÷ 2 = ?', '3', '4', '5', '6', 'C'),
    (2, '"apple"の意味は？', 'りんご', 'みかん', 'ばなな', 'ぶどう', 'A'),
    (2, '"book"の意味は？', '机', '本', '椅子', 'ペン', 'B');