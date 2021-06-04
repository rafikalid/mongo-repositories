import type {MongoClientOptions} from 'mongodb';
import MongoDB from 'mongodb'
const {MongoClient}= MongoDB;

import Collection from './collection';

interface RepositoryOptions{
	prefix: string,
	log?:	Function | undefined | null
}


export default class Repository{
	db: any= undefined // db
	name: string|undefined = undefined //Database name
	mongoClient= MongoClient // Mongo native client
	
	_prefix: string // Index name prefix
	private _db: any= undefined // DB connector
	private _collections: Collection[]= [] // store all created collections

	/** Log function */
	log: Function | undefined | null

	constructor(options: RepositoryOptions){
		if(typeof options.prefix !== 'string') throw new Error('Exprected options.prefix');
		this._prefix= options.prefix;

		// Log method
		this.log= options.hasOwnProperty('log')? options.log: console.log.bind(console); // log method: default to console.log
	}

	/** @private append new Collection wrapper */
	_addCollection(collection: Collection){
		this._collections.push(collection);
		if(this._db) collection.init(); // create session and adjust indexes
	}

	/**
	 * Connect to MongoDB
	 * @see http://mongodb.github.io/node-mongodb-native/3.1/api/MongoClient.html
	 */
	async connect(url: string, options?: MongoClientOptions){
		if(this._db) throw new Error('Already connected');
		if(options==null) options= {useNewUrlParser: true, useUnifiedTopology: true};
		var dbConn= await MongoClient.connect(url, options);
		this._db= dbConn;
		this.name= dbConn.db.name;
		var db= this.db= dbConn.db(this.name);
		// List Database collections
		var dbCollections= (await db.collections()).map((c: any)=> c.collectionName) as string[];

		// init all collections
		var ref= this._collections;
		for(var i=0, len=ref.length; i<len; i++){
			var collection= ref[i];
			// Create new collection
			if(!dbCollections.includes(collection.name))
				await db.createCollection(collection.name);
			// init wrapper
			await ref[i].init();
		}
	}

	/** Close current connection */
	async close(force:Boolean){
		if(this._db == null) return Promise.resolve(this);
		await this._db.close(force);
		this.db= this._db= undefined;
		// Remove native collections
		var ref= this._collections;
		for(var i=0, len=ref.length; i<len; i++){
			var col= ref[i];
			col.c= col.collection= undefined;
		}
	}

	/** Check is connected */
	isConnected(options: any){ return this._db.isConnected(options)}
}