import { IEntryDao } from '../IEntryDao';
import * as Promise from 'bluebird';
import { getConnection, Query } from './db/MySqlConnection';
import { EntryResult } from 'pluto-rd';
import * as Entity from './Entity';
import { Dao } from './Dao';

const util = Entity.Util;

//prepated statements
abstract class Sql {
    public static get COUNT_ALL_ENTRIES()
        { return 'SELECT COUNT(*) AS count FROM entry;' };
    public static get COUNT_ENTRIES_WITH_KEYWORD() //TODO join table and GROUP_CONCAT
        { return 'SELECT COUNT(*) AS count FROM entry WHERE handle = ?;' };
    public static get FIND_ENTRIES_WITH_KEYWORD_LIMITED() 
        { return 'SELECT entry.title, entry.post_date, content.body FROM entry INNER JOIN content = ? LIMIT ?,?;' };
    public static get CREATE_ENTRY() 
        { return 'INSERT INTO entry (title, post_date) VALUES (?, ?);' };
    public static get JOIN_ENTRY_KEYWORD() 
        { return 'INSERT INTO entry_keyword (entry_id, keyword_id) VALUES ?;' };
    public static get CREATE_ENTRY_CONTENT()
        { return 'INSERT INTO content (body, entry_id) VALUES (?, ?);' };
}

export class EntryDao extends Dao implements IEntryDao<Entity.Entry, Entity.Keyword> {    
    public findWithKeywordLimited(keyword: string, offset: number, count: number): Promise<EntryResult> {        
        return Promise.join(
            this.prep(Sql.FIND_ENTRIES_WITH_KEYWORD_LIMITED)
                .getResults<any>([keyword, offset, count]),
            this.prep(Sql.COUNT_ENTRIES_WITH_KEYWORD)
                .getSingleResult<number>([keyword]),
            (paged, unlimited) => {
                    const entries = paged.map(record => {
                                
                    });
                
                    return {
                        pagedEntries: paged,
                        totalCount: unlimited
                    }
            }
        )
    }
    
    public count(): Promise<number> {
        return this.prep(Sql.COUNT_ALL_ENTRIES)
            .getSingleResult<number>();    
    }
    
    public createWithKeywords(entry: Entity.Entry, persisted: Entity.Keyword[]): Promise<number> {
        const unixTime = util.toUnixTime(entry.date);
        
        return this.prep(Sql.CREATE_ENTRY)
            .create([ entry.title, unixTime ])
        .then(id => {
             //join
            const values = persisted.map(kw => {
                return [id, kw.id];
            });
            
            return Promise.join(
                this.qry(Sql.JOIN_ENTRY_KEYWORD)
                    .create([values]),
                this.prep(Sql.CREATE_ENTRY_CONTENT)
                    .create([entry.content, id]),
                () => {
                    return id;    
                }
            )   
        });          
    }
}