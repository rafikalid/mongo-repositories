import { fromOptions, RepositoryOptions } from '@types';
import { MongoClient, ObjectID } from 'mongodb';
import Collection from './collection';
export default class Repository {
    private _prefix;
    private _db;
    all: {
        [key: string]: Collection;
    };
    db: any;
    name: undefined | string;
    mongoClient: typeof MongoClient;
    /** Log function */
    log: Function | undefined | null;
    constructor(options: RepositoryOptions);
    /**
     * Connect to MongoDB
     * @see http://mongodb.github.io/node-mongodb-native/3.1/api/MongoClient.html
     */
    connect(url: string, options?: any): Promise<Repository>;
    /** Close current connection */
    close(force: Boolean): Promise<this | undefined>;
    /** Check is connected */
    isConnected(options: any): any;
    /** Create new Schema */
    from(options: fromOptions): Collection;
    /** Parse ObjectId */
    parseObjectId(value: string): ObjectID;
}
