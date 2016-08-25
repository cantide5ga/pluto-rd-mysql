#http://stackoverflow.com/questions/1720244/create-new-user-in-mysql-and-give-it-full-access-to-one-database
CREATE DATABASE IF NOT EXISTS pluto_rd;

USE pluto_rd;

CREATE TABLE IF NOT EXISTS entry (
    id INT PRIMARY KEY AUTO_INCREMENT
    ,title VARCHAR(255)
    ,post_date INT UNSIGNED
);

CREATE TABLE IF NOT EXISTS content (
    entry_id INT PRIMARY KEY REFERENCES entry(id)
        ON UPDATE CASCADE ON DELETE CASCADE
    ,body TEXT
);

CREATE TABLE IF NOT EXISTS keyword (
    id INT PRIMARY KEY AUTO_INCREMENT
    ,handle VARCHAR(255) NOT NULL UNIQUE
    ,count INT DEFAULT 0 
    ,last_tagged INT UNSIGNED 
    ,hits BIGINT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS entry_keyword (
    entry_id INT REFERENCES entry(id)
        ON UPDATE CASCADE ON DELETE CASCADE     
    ,keyword_id INT REFERENCES keyword(id)
        ON UPDATE CASCADE ON DELETE CASCADE
    ,PRIMARY KEY(entry_id, keyword_id)
);