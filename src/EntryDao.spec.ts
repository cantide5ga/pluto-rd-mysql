import * as TestUtil from './db/test/TestUtil'; 
import * as Promise from 'bluebird';
import { EntryDao } from './EntryDao';
import * as Entity from './Entity';

let dao: EntryDao;
const util = Entity.Util;

const
    mockEntry: Entity.Entry = {
        title: 'Title A', 
        date: new Date('December 17, 1995'),
        content: 
        `<ul>
            <li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</li>
            <li>Aliquam tincidunt mauris eu risus.</li>
            <li>Vestibulum auctor dapibus neque.</li>
        </ul>`,
        keywords: ['handleA', 'handleB']            
    },
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
    keywords: Entity.Keyword[] = [
        keywordA,
        keywordB
    ]
 
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
       dao.createWithKeywords(mockEntry, keywords)
       .then(id => {
           expect(id).toBeDefined();
           expect(id).toBe(1);
           return dao.createWithKeywords(mockEntry, keywords)
       })
       .then(id => {
           expect(id).toBe(2);
           return dao.count();
       })
       .then(count => {
            expect(count).toBe(2);
            done();    
       })
       .catch(fail);
    });
    
    it('finds entries w/ handle and given limit', (done) => {                
       dao.createWithKeywords(mockEntry, keywords)
       .then(() => {
           return dao.createWithKeywords(mockEntry, keywords)
       })
       .then(() => {
           return dao.createWithKeywords(mockEntry, keywords)
       })
       .then(() => {
           return dao.createWithKeywords(mockEntry, keywords)
       })
       .then(() => {
           return dao.findWithKeywordLimited(keywordA.handle, 0, 2);
       })
       .then(result => {
           const entries = result.pagedEntries;
           const total = result.totalCount;
           
           expect(entries.length).toBe(2);
           expect(total).toBe(3);
           
           done();
       })
       .catch(fail);
    });
});