import * as config from 'config';
const Spinner = require('cli-spinner').Spinner;
import { getConnection } from '../MySqlConnection';
import * as Promise from 'bluebird'; 

const client = require('telnet-client');
const telnet = new client();

export const primeMySql = (onConnect: Function) => {
    const host = config.get<string>('db.host');
    const port = config.get<number>('db.port')  
    
    const spinner = new Spinner(`%s Waiting for MySQL to initialize on host ${host} and port ${port}...`);
    spinner.setSpinnerString(25);
    spinner.start();
    
    const params = {
        port: port,
        host: host
    }
    
    telnet.on('connect', () => {
        spinner.stop(true);
        onConnect();
    });
        
    telnet.on('error', () => {
        setTimeout(() => { telnet.connect(params) }, 5000);
    });

    telnet.connect(params);
};

export const truncate = (): Promise<{}> => {
    return getConnection()
        .prepare('TRUNCATE TABLE keyword;')
        .getSingleResult()
    .then(() => { 
        return getConnection()
            .prepare('TRUNCATE TABLE entry;')
            .getSingleResult();
    })
    .then(() => { 
        return getConnection()
            .prepare('TRUNCATE TABLE entry_keyword;')
            .getSingleResult();
    })
    .then(() => { 
        return getConnection()
            .prepare('TRUNCATE TABLE content;')
            .getSingleResult();
    });
}