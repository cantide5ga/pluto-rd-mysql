import { IEntryDao } from 'pluto-rd-express';
import * as Promise from 'bluebird';
import { getConnection, Query } from '../db/MySqlConnection';
import { EntryResult } from 'pluto-rd';
import * as Entity from '../common/Entity';
import { Dao } from '../common/Dao';

const util = Entity.Util;

abstract class Sql {
    public static get COUNT_ALL_ENTRIES()
        { return 'SELECT COUNT(*) AS count FROM entry;' };
    public static get COUNT_ENTRIES_WITH_KEYWORD()
        { return `SELECT COUNT(*) AS count 
                    FROM entry
	                    INNER JOIN keyword k ON k.handle = ?
                        INNER JOIN entry_keyword ek ON ek.keyword_id = k.id
						WHERE ek.entry_id = entry.id;` 
        };
    public static get FIND_ENTRIES_WITH_KEYWORD_LIMITED()
        { return `SELECT entry.title, entry.post_date, content.body AS content, GROUP_CONCAT(k1.handle) 
                    FROM entry
                        INNER JOIN keyword k0 ON k0.handle = ?
                        INNER JOIN entry_keyword ek0 ON ek0.keyword_id = k0.id AND ek0.entry_id = entry.id
                        INNER JOIN entry_keyword ek1 ON ek1.entry_id = ek0.entry_id
                        INNER JOIN keyword k1 ON k1.id = ek1.keyword_id
                        INNER JOIN content ON content.entry_id = entry.id
                    GROUP BY entry.title, entry.post_date, content
                    LIMIT ?,?;`
        };
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