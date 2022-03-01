import type { MongoClientOptions } from 'mongodb';
import MongoDB from 'mongodb';
const { MongoClient } = MongoDB;

import Collection from './collection';

export interface RepositoryOptions {
	prefix: string;
	log?: Function | undefined | null;
}

export default class Repository {
	db: MongoDB.Db | undefined = undefined; // db
	client: MongoDB.MongoClient | undefined = undefined;
	name: string | undefined = undefined; //Database name
	mongoClient = MongoClient; // Mongo native client

	_prefix: string; // Index name prefix
	private _db: any = undefined; // DB connector
	private _collections: Collection<any>[] = []; // store all created collections
	private _collectionNames: Set<string> = new Set();

	/** Log function */
	log: Function | undefined | null;

	constructor(options: RepositoryOptions) {
		if (typeof options.prefix !== 'string')
			throw new Error('Missing options.prefix');
		this._prefix = options.prefix;

		// Log method
		this.log = options.hasOwnProperty('log')
			? options.log
			: console.log.bind(console); // log method: default to console.log
	}

	/** @private append new Collection wrapper */
	_addCollection(collection: Collection<any>) {
		this._collections.push(collection);
		if (this._db)
			setImmediate(() => collection.init()); // create session and adjust indexes
	}

	/**
	 * Connect to MongoDB
	 * @see http://mongodb.github.io/node-mongodb-native/3.1/api/MongoClient.html
	 */
	async connect(
		url: string,
		dbName: string,
		options: MongoClientOptions = {},
		mongoClient: typeof MongoDB.MongoClient = MongoClient
	) {
		if (this._db != null) throw new Error('Already connected');
		this.mongoClient = mongoClient;
		var dbConn = this.client = await MongoClient.connect(url, options);
		this._db = dbConn;
		this.name = dbName;
		var db = (this.db = dbConn.db(dbName));
		// List Database collections
		var dbCollections = (await db.collections()).map(
			(c: any) => c.collectionName
		) as string[];

		// init all collections
		const ref = this._collections;
		const colNameSet = this._collectionNames;
		for (var i = 0, len = ref.length; i < len; i++) {
			var collection = ref[i];
			// Check duplication
			if (colNameSet.has(collection.name))
				throw new Error(`Duplicate collection name: ${collection.name}`);
			colNameSet.add(collection.name);
			// Create new collection
			if (!dbCollections.includes(collection.name))
				await db.createCollection(collection.name);
			// init wrapper
			await ref[i].init();
		}
	}

	/** Close current connection */
	async close(force: Boolean) {
		if (this._db == null) return Promise.resolve(this);
		await this._db.close(force);
		this.db = this._db = undefined;
		// Remove native collections
		// var ref = this._collections;
		// for (var i = 0, len = ref.length; i < len; i++) {
		// 	var col = ref[i];
		// 	col.c = col.collection = undefined;
		// }
	}

	/** Check is connected */
	isConnected(options: any) {
		return this._db.isConnected(options);
	}
}
