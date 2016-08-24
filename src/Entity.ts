import * as PlutoRd from 'pluto-rd';

export type Keyword = PlutoRd.Keyword & { id?: number; }
export type Entry = PlutoRd.Entry & { id?: number; }

export namespace Util {
    export const toKeywordRecord = (keyword: Keyword) => {
        return {
            handle: keyword.handle,
            count: keyword.count,
            last_tagged: toUnixTime(keyword.lastTagged),
            hits: keyword.hits
        }
    }
    
    export const toKeyword = (record: KeywordRecord): Keyword => {
        return {
            id: record.id,
            handle: record.handle,
            count: record.count,
            lastTagged: toDate(record.last_tagged),
            hits: record.hits
        }
    }
    
    export const toUnixTime = (date: Date): number => {
        return date.getTime() / 1000;
    }
    
    export const toDate = (unix: number): Date => {
        return new Date(unix * 1000);
    }
}

interface KeywordRecord {
    id?: number,
    handle: string,
    count: number,
    last_tagged: number,
    hits: number
}

interface EntryRecord {
    id?: number,
    title: string
    post_date: number
    content: string
    keywords: string[]
}