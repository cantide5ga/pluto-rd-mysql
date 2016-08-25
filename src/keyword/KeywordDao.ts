import { IKeywordDao } from 'pluto-rd-express';
import * as Promise from 'bluebird';
import * as Entity from '../common/Entity';
import { Dao } from '../common/Dao';

const util = Entity.Util;

abstract class Sql {
    public static get FIND_ALL_KEYWORDS() 
        { return 'SELECT * FROM keyword;' };
    public static get FIND_KEYWORDS_BY_HANDLES() 
        { return 'SELECT * FROM keyword WHERE handle IN ?;' };
    public static get CREATE_IF_NOT_EXISTS()
        { return 'INSERT INTO keyword (handle, count, last_tagged, hits) VALUES ? ON DUPLICATE KEY UPDATE id=id;' };
    public static get UPDATE_KEYWORDS_COUNT()
        { return "UPDATE keyword SET count=count + 1 WHERE id IN ?" }      
}

export class KeywordDao extends Dao implements IKeywordDao<Entity.Keyword> {

    public createIfNotExists(keywords: Entity.Keyword[]): Promise<number> {
        const values = keywords.map(kw => {
            const record = util.toKeywordRecord(kw);
            return Object.keys(record).map(key => record[key])
        });

        return this.qry(Sql.CREATE_IF_NOT_EXISTS)
            .create([values]);
    }
    
    public findAll(): Promise<Entity.Keyword[]> {
        return this.prep(Sql.FIND_ALL_KEYWORDS)
            .getResults<any>()
            .then(records => {
                return records.map(record => {
                    return util.toKeyword(record);
                });    
            });
    }
    
    public findKeywordsByHandles(handles: string[]): Promise<Entity.Keyword[]> {        
        return this.qry(Sql.FIND_KEYWORDS_BY_HANDLES)
            .getResults<any>([[handles]])
            .then(records => {
                return records.map(record => {
                    return util.toKeyword(record);    
                });    
            });
    }
    
    public updateCounts(keywords: Entity.Keyword[]): Promise<number[]> {
        const ids = [ keywords.map(dto => {
            return dto.id;    
        }) ];
        
        return this.qry(Sql.UPDATE_KEYWORDS_COUNT)
            .getResults<number>([ ids ]);    
    }
}