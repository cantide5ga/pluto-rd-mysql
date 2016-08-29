import * as fs from 'fs';
import * as Promise from 'bluebird';
import * as config from 'config';
//https://www.npmjs.com/package/mysql
const mysql = require('mysql2');

const sqlFile = 'src/db/sql/pluto_rd.sql';
const readFile = Promise.promisify<string, string, string>(fs.readFile);

export const connect = () => {
  
    const connection = mysql.createConnection({
        host     : config.get<string>('middleware.db.host'),
        user     : config.get<string>('middleware.db.user'),
        password : config.get<string>('middleware.db.password'),
        multipleStatements: true
    });
          
    return readFile(sqlFile, 'utf8')
    .then(sql => {
        connection.query(sql);
        return connection;
    });    
}