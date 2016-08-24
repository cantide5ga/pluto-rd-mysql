import * as Promise from 'bluebird';
import * as Driver from './Driver';

let connect: Promise<any>;

class MySqlConnection {
    constructor() {
        connect = Driver.connect();
    }
    
    public createQuery(sql: string) {
        return new Query(sql);
    }
    
    public prepare(sql: string) {
        return new Query(sql, true);
    }
}

let connection: MySqlConnection;
export const getConnection = () => {
    if(!connection)
        connection = new MySqlConnection();
    return connection;
}

export class Query {
    private stmt: string;
    private isPreparedStatement: boolean;
    private fn: (stmt: string, args?: Value) => Promise<any>;
    
    constructor(stmt: string, isPreparedStatement?: boolean) {
        this.stmt = stmt;
        this.isPreparedStatement = isPreparedStatement;
    }
    
    //https://github.com/petkaantonov/bluebird/issues/443
    //http://stackoverflow.com/a/35766561/3481365
    private doQry <T>(args?: Value): Promise<Array<{ count: T } | any>> {
        if(!this.fn) {
            return connect
            .then(mysql => {
                this.fn = (stmt, args) => { 
                    
                    if(this.isPreparedStatement) {
                        return new Promise((resolve, reject) => {
                            mysql.execute(stmt, args, (err, rows) => {
                                if(err) reject(err);
                                resolve(rows);
                            })
                        });
                    }
                    
                    return new Promise((resolve, reject) => {
                        mysql.query(stmt, args, (err, rows) => {
                            if(err) reject(err);
                            resolve(rows);
                        })
                    });
                    
                };
                return this.fn(this.stmt, args);    
            });
        } else {
            return this.fn(this.stmt, args);
        }
    }
    
    public getSingleResult <T>(args?: Value): Promise<T> {
        return this.doQry<T>(args)
        .then(rows => {
            if(rows.length > 1)
                throw new Error('multiple results found');
            
            if(rows[0])
                return rows[0].count;
            else    
                return rows;
        })
    }
    
    public getResults <T>(args?: Value): Promise<T[]> {
        return this.doQry<T>(args);
    }
    
    public create(args?: Value): Promise<number> {
        console.log(JSON.stringify(args, null, 2))
        return this.cud(args);
    }
    
    public update(args?: Value): Promise<number> {
        return this.cud(args);
    }
    
    public delete(args?: Value): Promise<number> {
        return this.cud(args);
    }
    
    private cud(args?: Value): Promise<number> {
        return this.doQry<number>(args)
        .then(rows => {
            const id = rows['insertId'];
            if(id != undefined)
                return id;
            else
                throw new Error('failed to get record id');     
        })
    }
}

type Value = (Array<string | number>) | (Array<Array<Array<string | number>>>) ;
