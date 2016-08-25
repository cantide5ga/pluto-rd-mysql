import * as TestUtil from '../db/test/TestUtil'; 
import * as Promise from 'bluebird';
import { EntryDao } from './EntryDao';
import { KeywordDao } from '../keyword/KeywordDao';
import * as Entity from '../common/Entity';

let dao: EntryDao;
const util = Entity.Util;

const
    keywordA: Entity.Keyword = {
        id: 1,
        handle: 'handleA',
        count: 5,
        lastTagged: new Date('December 17, 1995'),
        hits: 10    
    },
    keywordB: Entity.Keyword = {
        id: 2,
        handle: 'handleB',
        count: 2,
        lastTagged: new Date('April 22, 1982'),
        hits: 6    
    },
    keywordC: Entity.Keyword = {
        id: 3,
        handle: 'handleC',
        count: 2,
        lastTagged: new Date('July 4, 2016'),
        hits: 6    
    },
    keywords: Entity.Keyword[] = [
        keywordA,
        keywordB,
        keywordC
    ],
    mockEntry0: Entity.Entry = {
        title: 'Title A', 
        date: new Date('December 17, 1995'),
        content: 
            `<ul>
                <li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</li>
                <li>Aliquam tincidunt mauris eu risus.</li>
                <li>Vestibulum auctor dapibus neque.</li>
            </ul>`,
        keywords: [keywordA.handle, keywordB.handle]            
    },
    mockEntry1: Entity.Entry = {
        title: 'Title X', 
        date: new Date('April 22, 1982'),
        content:
            `<p>
                Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo.
            </p>`,
        keywords: [keywordA.handle]            
    },
    mockEntry2: Entity.Entry = {
        title: 'Title AAA', 
        date: new Date('July 4, 2016'),
        content: 
            `<ol>
                <li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</li>
                <li>Aliquam tincidunt mauris eu risus.</li>
                <li>Vestibulum auctor dapibus neque.</li>
            </ol>`,
        keywords: [keywordB.handle, keywordC.handle]            
    }
 
describe('EntryDao', () => {
    beforeAll((done) => {
        TestUtil.primeMySql(() => {
            dao = new EntryDao();
            done();
        });        
    }, 80000);
    
    beforeEach((done) => {
        TestUtil.truncate().then(done);    
    });
        
    it('creates new entries', (done) => {
       new KeywordDao().createIfNotExists(keywords); 
                        
       dao.createWithKeywords(mockEntry0, [keywordA, keywordB])
       .then(id => {
           expect(id).toBeDefined();
           expect(id).toBe(1);
           return dao.createWithKeywords(mockEntry1, [keywordA])
       })
       .then(id => {
           return dao.createWithKeywords(mockEntry2, [keywordB, keywordC])
       })
       .then(id => {
           expect(id).toBe(3);
           return dao.count();
       })
       .then(count => {
            expect(count).toBe(3);
            done();    
       })
       .catch(fail);
    });
    
    it('finds entries w/ handle and given limit', (done) => {
       new KeywordDao().createIfNotExists(keywords); 
                        
       dao.createWithKeywords(mockEntry0, [keywordA, keywordB])
       .then(() => {
           return dao.createWithKeywords(mockEntry1, [keywordA])
       })
       .then(() => {
           return dao.createWithKeywords(mockEntry2, [keywordB, keywordC])
       })
       .then(() => {
           return dao.findWithKeywordLimited(keywordA.handle, 0, 1);
       })
       .then(result => {
           const entries = result.pagedEntries;
           const total = result.totalCount;
           
           expect(entries.length).toBe(1);
           expect(total).toBe(2);
           
           done();
       })
       .catch(fail);
    });
});