import { getConnection, Query } from './db/MySqlConnection';

export abstract class Dao {
    protected qry(sql: string): Query {
        return getConnection().createQuery(sql);
    }
    
    protected prep(stmt: string): Query {
        return getConnection().prepare(stmt);
    }
} 