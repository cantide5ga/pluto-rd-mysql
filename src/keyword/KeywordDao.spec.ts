import * as TestUtil from '../db/test/TestUtil'; 
import * as Promise from 'bluebird';
import { KeywordDao } from './KeywordDao';
import * as Entity from '../common/Entity';

let dao: KeywordDao;
const util = Entity.Util;

const
    keywordA: Entity.Keyword = {
        handle: 'handleA',
        count: 5,
        lastTagged: new Date('December 17, 1995'),
        hits: 10    
    },
    keywordB: Entity.Keyword = {
        handle: 'handleB',
        count: 2,
        lastTagged: new Date('April 22, 1982'),
        hits: 6    
    },
    keywords: Entity.Keyword[] = [
        keywordA,
        keywordB
    ]
 
describe('KeywordDao', () => {
    beforeAll((done) => {
        TestUtil.primeMySql(() => {
            dao = new KeywordDao();
            done();
        });        
    }, 80000);
    
    beforeEach((done) => {
        TestUtil.truncate().then(done);    
    });
        
    it('creates new keywords', (done) => {                
        dao.createIfNotExists([ keywordA ])
        .catch(fail)
        .then((thing) => {
            dao.findAll()
            .then(keywords => {
                expect(keywords.length).toBe(1);
                
                const kw = keywords[0];
                expect(kw.handle).toBe(keywordA.handle);
                expect(kw.count).toBe(keywordA.count);
                expect(kw.lastTagged).toEqual(keywordA.lastTagged);
                expect(kw.hits).toBe(keywordA.hits);
                
                done();    
            });        
        });
    });
    
    it('does not create keyword if handle already exists', (done) => {        
        dao.createIfNotExists([ keywordA ])
        .then(() => {
            return dao.createIfNotExists([ keywordA ]);
        })
        .then(() => {
            return dao.findAll();
        })
        .catch(fail)
        .then(keywords => {
            expect(keywords.length).toBe(1);
            done();    
        });        
    });
    
    it('finds all keywords having specified handles', (done) => {   
        dao.createIfNotExists(keywords)
        .then(() => {
            return dao.findKeywordsByHandles([ 'handleA', 'handleB' ]);
        })
        .catch(fail)
        .then(kws => {
            expect(kws.length).toBe(2);
            
            //this might be fragile
            const kwA = kws[0];
            expect(kwA.id).toBe(1);
            expect(kwA.handle).toBe(keywordA.handle);
            expect(kwA.count).toBe(keywordA.count);
            expect(kwA.lastTagged).toEqual(keywordA.lastTagged);
            expect(kwA.hits).toBe(keywordA.hits);
            
            const kwB = kws[1];
            expect(kwB.id).toBe(2);
            expect(kwB.handle).toBe(keywordB.handle);
            expect(kwB.count).toBe(keywordB.count);
            expect(kwB.lastTagged).toEqual(keywordB.lastTagged);
            expect(kwB.hits).toBe(keywordB.hits);        
            
            done();    
        });                
    });
    
    it('returns an empty result on non-existent handle', (done) => {   
        dao.findKeywordsByHandles([ 'handleC' ])
        .catch(fail)
        .then(kws => {
            expect(kws.length).toBe(0);
                        
            done();    
        });                
    });
    
    it('updates the keyword counts', (done) => {        
        dao.createIfNotExists(keywords)
        .then(() => {
            return dao.findKeywordsByHandles([ 'handleA' ]);
        })
        .then(keywords => {
            dao.updateCounts(keywords)
        })
        .then(() => {
            return dao.findKeywordsByHandles([ 'handleA' ]);
        })
        .then(keywords => {
            expect(keywords[0].count).toBe(keywordA.count + 1);
            done();    
        });        
    });
});