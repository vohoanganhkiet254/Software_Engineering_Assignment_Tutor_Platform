DROP DATABASE IF EXISTS tutor_db;
CREATE DATABASE tutor_db;
USE tutor_db;

CREATE TABLE user_profile (
	userID INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    current_role ENUM('Undergraduate', 'Lecturer', 'Graduated', 'Senior Undergraduated') NOT NULL,
    password VARCHAR(30) NOT NULL,
    email VARCHAR(50) UNIQUE NOT NULL,
    more_detail VARCHAR(500) DEFAULT ''
);
INSERT INTO user_profile (userID, name, current_role, password, email) VALUES
(1001001, 'Nguyễn Văn Demo', 'Lecturer', 'lecturerpass', 'lecturer.demo@hcmut.edu.vn'),
(2112345, 'Tốt Văn Nghiệp', 'Senior Undergraduated', 'seniorpass', 'senior.student@hcmut.edu.vn'),
(2345678, 'Lê Khác Một', 'Undergraduate', 'anotherstudentpass1', 'student.another@hcmut.edu.vn'),
(2245673, 'Lê Khác Hai', 'Undergraduate', 'anotherstudentpass2', 'student2.another@hcmut.edu.vn'),
(2312345, 'Nguyễn Chưa Tốt Nghiệp', 'Undergraduate', 'fejfewkjnqe', 'vinh.nguyencong@hcmut.edu.vn');


CREATE TABLE university_courses (
	courseID VARCHAR(10) PRIMARY KEY,
    course_name VARCHAR(50) NOT NULL
);

INSERT INTO university_courses (courseID, course_name) VALUES
('CO1001', 'Calculus 1'),
('CO1002', 'Calculus 2'),
('PH1003', 'Physics 1'),
('CO2001', 'Data Structures and Algorithms'),
('CO2002', 'Operating Systems'),
('CO2003', 'Digital Systems'),
('CO3001', 'Computer Networks'),
('CH1001', 'General Chemistry');

CREATE TABLE unicourse_taken (
	userID INT NOT NULL,
    courseID VARCHAR(10) NOT NULL,
    GPA FLOAT NOT NULL check (GPA <=4 & GPA >= 0),
    FOREIGN KEY (userID) REFERENCES user_profile(userID),
    FOREIGN KEY (courseID) REFERENCES university_courses(courseID),
    PRIMARY KEY (userID, courseID)
);

INSERT INTO unicourse_taken (userID, courseID, GPA) VALUES
(2312345, 'CO1001', 3.5),  -- User 'vinh.nguyencong'
(2312345, 'PH1003', 3.0),
(2312345, 'CO2001', 3.8),
(2112345, 'CO1001', 4.0),  -- User 'senior.student'
(2112345, 'CH1001', 2.5),
(2345678, 'CO1001', 2.8),  -- User 'student.another'
(2345678, 'CO2002', 3.2);

CREATE TABLE tutor_course (
	tutor_courseID INT AUTO_INCREMENT PRIMARY KEY,
    ownerID INT NOT NULL,
    FOREIGN KEY (ownerID) REFERENCES user_profile(userID),
    course_title VARCHAR(100) NOT NULL,
    description VARCHAR(2000) NOT NULL,
    open_state ENUM('Open', 'Permission', 'Private') DEFAULT 'OPEN'
);

INSERT INTO tutor_course (ownerID, course_title, description, open_state) VALUES
(1001001, 'Advanced Operating Systems', 'A deep dive into OS concepts, kernel design, concurrency, and memory management. Based on the "Operating System Concepts" book.', 'Open'),
(2112345, 'Calculus 1 Final Exam Review', 'Reviewing key concepts of Calculus 1 (Limits, Derivatives, Integration) to prepare for the final exam.', 'Permission');

CREATE TABLE tutor_course_enrollment (
    tutor_courseID INT,
    userID INT,
    PRIMARY KEY (tutor_courseID, userID)
);

INSERT INTO tutor_course_enrollment VALUES
(1, 2112345),
(1, 2345678),
(1, 2245673),

(2, 2345678),
(2, 2312345);

CREATE TABLE chapter (
	chapter_num INT NOT NULL,
    tutor_courseID INT NOT NULL,
    chapter_name VARCHAR(100) NOT NULL,
    FOREIGN KEY (tutor_courseID) REFERENCES tutor_course(tutor_courseID),
    PRIMARY KEY (tutor_courseID, chapter_num)
);

INSERT INTO chapter (tutor_courseID, chapter_num, chapter_name) VALUES
(1, 1, 'Introduction to Operating Systems'),
(1, 2, 'Process Management'),
(1, 3, 'Concurrency and Deadlocks');

INSERT INTO chapter (tutor_courseID, chapter_num, chapter_name) VALUES
(2, 1, 'Chapter 1: Limits and Continuity'),
(2, 2, 'Chapter 2: Derivatives');

CREATE TABLE material (
	chapter_num INT NOT NULL,
    tutor_courseID INT NOT NULL,
    material_title VARCHAR(50) NOT NULL,
    material_link VARCHAR(300),
    type ENUM('PDF', 'Video') DEFAULT 'PDF',
    PRIMARY KEY (tutor_courseID ,chapter_num, material_link),
    FOREIGN KEY (tutor_courseID, chapter_num) REFERENCES chapter(tutor_courseID, chapter_num)
);

INSERT INTO material (tutor_courseID, chapter_num, material_title, material_link, type) VALUES
(1, 1, 'Operating System Concepts - Chapter 1', 'https://os.ecci.ucr.ac.cr/slides/Abraham-Silberschatz-Operating-System-Concepts-10th-2018.pdf', 'PDF'),
(1, 2, 'Process Management Video Lecture', 'https://www.youtube.com/watch?v=OrM7nZcxXZU', 'Video'),
(1, 3, 'Concurrency and Deadlocks Notes', 'https://example.com/concurrency_notes.pdf', 'PDF');

CREATE TABLE library_material (
	material_name VARCHAR(200) NOT NULL,
    Lmaterial_link VARCHAR(300) NOT NULL
);

INSERT INTO library_material VALUES
('R. Elmasri, S. R. Navathe, Fundamentals of Database Systems- 7th Edition, Pearson, 2016', 'https://www.auhd.edu.ye/upfiles/elibrary/Azal2020-01-22-12-28-11-76901.pdf'),
('Computer Networking, 8th edition', 'https://networking.harshkapadia.me/files/books/computer-networking-a-top-down-approach-8th-edition.pdf'),
('Probability and Statistics: The Science of Uncertainty', 'https://utstat.utoronto.ca/mikevans/jeffrosenthal/book.pdf'),
('Operating System Concepts 10th Ed, 2018', 'https://os.ecci.ucr.ac.cr/slides/Abraham-Silberschatz-Operating-System-Concepts-10th-2018.pdf'),
('General Chemistry, 11th edition','https://9afi.com/storage/daftar/FW3jIoJ817DywVCjQ9QOVzOcB4OEyS2RYelmc3rO.pdf'),
('Data Structures and Algorithms','https://mta.ca/~rrosebru/oldcourse/263114/Dsa.pdf'),
('Computer Organization and Design', 'https://nsec.sjtu.edu.cn/data/MK.Computer.Organization.and.Design.4th.Edition.Oct.2011.pdf'),
('LOGIC IN COMPUTER SCIENCE: Modelling and Reasoning about Systems','https://www.cas.mcmaster.ca/~cs2sd3/course-files/LogicInComputerScience.pdf'),
('General Physics', 'https://funaab.edu.ng/funaab-ocw/opencourseware/PHS%20101.pdf'),
('Linear Algebra', 'https://funaab.edu.ng/funaab-ocw/opencourseware/PHS%20101.pdf'),
('First semester calculus', 'https://people.math.wisc.edu/~angenent/Free-Lecture-Notes/free221.pdf');

CREATE TABLE forum_thread (
	forumID INT AUTO_INCREMENT PRIMARY KEY,
    createDate DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
	tutor_courseID INT NOT NULL,
    userID INT not null,
    inner_body VARCHAR(2000),
    FOREIGN KEY (tutor_courseID) REFERENCES tutor_course(tutor_courseID),
    foreign key (userID) references user_profile(userID)
);

INSERT INTO forum_thread (tutor_courseID, userID, inner_body) VALUES
(1, 2345678 , 'Can someone explain the real difference? They seem the same to me. When do I use one over the other?');

INSERT INTO forum_thread (tutor_courseID, userID, inner_body) VALUES
(2, 2312345, 'When are we allowed to use it? Is it only for 0/0 or also for infinity/infinity?');

CREATE TABLE forum_answer (
	forumID INT NOT NULL,
	answerID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT not null,
    answer_body VARCHAR(2000),
    parent_answerID INT DEFAULT NULL,
    createDate DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (forumID) REFERENCES forum_thread(forumID),
    FOREIGN KEY (parent_answerID) REFERENCES forum_answer(answerID),
    foreign key (userID) references user_profile(userID)
);

INSERT INTO forum_answer (forumID, userID, answer_body) VALUES
(1, 2112345, 'A semaphore is a signaling mechanism, while a mutex is an exclusion mechanism. A mutex is typically used to protect a shared resource from concurrent access.'),
(1, 2112345, 'Think of it this way: a mutex is a key to a room (only one person can have it). A semaphore is a count of available permits (e.g., 5 permits for 5 empty chairs).');

INSERT INTO forum_answer (forumID, userID, answer_body) VALUES
(2, 2345678, 'It works for both 0/0 and infinity/infinity indeterminate forms!');
CREATE TABLE log (
    tutor_courseID INT NOT NULL,
    changed_content VARCHAR(200) NOT NULL,
    date DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (tutor_courseID) REFERENCES tutor_course(tutor_courseID)
);

-- This table to record the scheduling that a tutor make for their course
CREATE TABLE schedule (
    tutor_courseID INT NOT NULL,
    schedule_title VARCHAR(100),
    schedule_content VARCHAR(200),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    location VARCHAR(100),
    FOREIGN KEY (tutor_courseID) REFERENCES tutor_course(tutor_courseID),
    PRIMARY KEY (tutor_courseID, schedule_title)
);

INSERT INTO schedule (tutor_courseID, schedule_title, schedule_content, start_date, end_date, location) VALUES
-- Course 1: Advanced Operating Systems
(1, 'Week 1: Introduction & Overview', 'Lecture and discussion about OS fundamentals, architecture, and kernel overview.', '2025-11-15', '2025-11-15', 'Room C5-201'),
(1, 'Week 2: Process Management', 'Exploring processes, threads, and CPU scheduling basics.', '2025-11-22', '2025-11-22', 'Room A4-205'),
(1, 'Midterm Review Session', 'Review session covering chapters 1–3 and sample problems.', '2025-12-05', '2025-12-05', 'https://meet.google.com/yey-ewmk-tqd'),

-- Course 2: Calculus 1 Final Exam Review
(2, 'Session 1: Limits and Continuity', 'Revisiting core topics on limits, continuity, and key exam questions.', '2025-11-18', '2025-11-18', 'Room B4-301'),
(2, 'Session 2: Derivatives and Applications', 'Review of derivative rules, optimization problems, and practical applications.', '2025-11-25', '2025-11-25', 'Room A2-104');

-- This table is a queue for join request from a user to a course
CREATE TABLE waiting_queue (
	tutor_courseID INT NOT NULL,
    userID INT NOT NULL,
    status ENUM('Waiting', 'Approved', 'Denied') DEFAULT 'Waiting',
    FOREIGN KEY (userID) REFERENCES user_profile(userID),
    FOREIGN KEY (tutor_courseID) REFERENCES tutor_course(tutor_courseID),
    PRIMARY KEY (userID, tutor_courseID)
);

INSERT INTO waiting_queue VALUES
(1, 2312345, 'Waiting');

CREATE TABLE review_rating (
    tutor_courseID INT NOT NULL,
    userID INT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    review VARCHAR(1000),
    FOREIGN KEY (tutor_courseID) REFERENCES tutor_course(tutor_courseID),
    FOREIGN KEY (userID) REFERENCES user_profile(userID),
    PRIMARY KEY (tutor_courseID, userID)
);

INSERT INTO review_rating (tutor_courseID, userID, rating, review) VALUES
(1, 2112345, 5, 'This course provided an in-depth understanding of operating systems. The materials were comprehensive and the instructor was very knowledgeable.'),
(2, 2345678, 4, 'The review sessions were helpful in preparing for the final exam. Would recommend to others.');