CREATE database chatapp;
use chatapp;
create table messages (

id INT AUTO_INCREMENT PRIMARY KEY,
character_id VARCHAR(255)
sender VARCHAR(255),
text LONGTEXT,
image LONGTEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 

