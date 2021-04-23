import { fromOptions, RepositoryOptions } from '@types';
import {MongoClient, ObjectID} from 'mongodb';

import Collection from './collection';


export default class Repository{
	private _prefix: string // Index name prefix
	private _db: any // DB connector

	all: {[key:string]: Collection}		// contains all collections
	db: any // db
	name: undefined | string //Database name
	mongoClient= MongoClient // Mongo native client

	/** Log function */
	log: Function | undefined | null

	constructor(options: RepositoryOptions){
		if(typeof options.prefix !== 'string') throw new Error('Exprected options.prefix');
		this._prefix= options.prefix;
		this.all= {};
		this.name= this.db= this._db= undefined;

		// Log method
		this.log= options.hasOwnProperty('log')? options.log: console.log.bind(console); // log method: default to console.log
	}

	/**
	 * Connect to MongoDB
	 * @see http://mongodb.github.io/node-mongodb-native/3.1/api/MongoClient.html
	 */
	async connect(url: string, options?: any): Promise<Repository>{
		if(this._db) throw new Error('Already connected');
		var dbConn= await MongoClient.connect(url, {useNewUrlParser: true});
		this._db= dbConn;
		this.name= dbConn.db.name;
		console.log('Database name: ', dbConn.db.name);
		var db= this.db= dbConn.db(this.name);
		// List Database collections
		var dbCollections= (await db.collections()).map((c: any)=> c.collectionName) as string[];
		var collections= [] as string[];
		var allCol= this.all;
		var key:string;
		for(key in allCol)
			if(allCol.hasOwnProperty(key)){
				collections.push(key);
				// Check if create collection
				if(dbCollections.includes(key)){
					// TODO add schema Validation
					await db.createCollection(key);
				}
			}
		// Create/update indexes
		for(var i=0, len= collections.length; i<len; i++){
			// Set native collection
			key= collections[i];
			var col= allCol[key];
			// Set collection
			col.collection= col.c= db.collection(key);
			// Reload indexes
			await col.reloadIndexes();
		}
		return this
	}

	/** Close current connection */
	async close(force:Boolean){
		if(this._db == null) return Promise.resolve(this);
		await this._db.close(force);
		this.db= this._db= undefined;
		// Remove native collections
		var allCol= this.all, col;
		for(var k in allCol){
			col= allCol[k];
			col.c= col.collection= undefined;
		}
	}

	/** Check is connected */
	isConnected(options: any){ return this._db.isConnected(options)}

	/** Create new Schema */
	from(options: fromOptions): Collection{
		if(typeof options.name !== 'string')
			throw new Error('Expected options.name as string');
		if(typeof options.define !== 'function')
			throw new Error('Expected options.define as function');
		var name= options.name //.toLowerCase(); // collection name is case insensitive
		var allCol= this.all
		// Check collection not already created
		if(allCol.hasOwnProperty(name))
			throw new Error(`Collection already created: ${name}`)
		// Create repo
		//TODO add schema for validation
		var schema= undefined;
		var coll= new Collection(this, name, options.indexes || [], this._prefix, schema);
		allCol[name]= coll;
		// Add methods
		coll.define(options.define(coll, schema));
		return coll // Enables chaining
	}

	/** Parse ObjectId */
	parseObjectId(value: string){return ObjectID.createFromHexString(value); }
}