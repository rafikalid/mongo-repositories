import type Repository from './repository';
import type { Collection as MongoCollection } from 'mongodb';
import { mongoIndex } from '@types';
declare type Document = {
    [k: string]: any;
};
/**
 * Mongo Collection adapter
 */
export default class Collection {
    name: string;
    schema: undefined;
    private _indexes;
    private _db;
    private _indexPrefix;
    c: MongoCollection<any> | undefined;
    collection: MongoCollection<any> | undefined;
    /** Log to console */
    private log;
    constructor(repo: Repository, name: string, indexes: mongoIndex[], indexPrefix: string, schema: undefined);
    /** Define new Methods */
    define(methods: {
        [key: string]: Function;
    }): Collection;
    /** Drop collection */
    drop(options?: any): Promise<any>;
    /** Get all indexes */
    indexes(): Promise<any> | undefined;
    /**
     * Reload Indexes
     */
    reloadIndexes(): Promise<void>;
    /** Set collection */
    /*! Predefined Methods for collection */
    insertOne(doc: Document, options?: any): void;
    insertMany(docs: Document[], options?: any): void;
}
export {};
