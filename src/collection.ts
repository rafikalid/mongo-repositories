import type Repository from './repository';
import type {Collection as MongoCollection} from 'mongodb'
import { mongoIndex } from '@types';

const COLLECTION_NAME_REGEX= /^\w[\w_-]{0,63}$/;

type Document= {[k:string]: any};
/**
 * Mongo Collection adapter
 */
export default class Collection {
	name: string
	schema: undefined //TODO add schema validation
	private _indexes: mongoIndex[]
	private _db: Repository
	private _indexPrefix: string // prefixing index names to be distinguishable
	

	c: MongoCollection<any> | undefined
	collection: MongoCollection<any> | undefined

	/** Log to console */
	private log: Function | undefined | null

	constructor(repo: Repository, name: string, indexes: mongoIndex[], indexPrefix: string, schema: undefined){
		// Check collection's name
		if(name.startsWith('_')) throw new Error(`Collection name begins with underscore (not allowed) : ${name}`);
		if(!COLLECTION_NAME_REGEX.test(name)) throw new Error(`Collection name mast match ${COLLECTION_NAME_REGEX}: ${name}`);
		this.name= name;
		this.schema= schema;
		this._indexes= indexes;
		this._db= repo;
		this._indexPrefix= indexPrefix;
		this.log= repo.log;
		this.c= this.collection= undefined;
	}

	/** Define new Methods */
	define(methods: {[key:string]:Function}): Collection{
		for(var k in methods){
			if(this.hasOwnProperty(k)) throw new Error(`Method already defined: ${k} on collection ${this.name}`);
			// @ts-ignore
			this[k]= methods[k];
		}
		return this;
	}

	/** Drop collection */
	drop(options?:any){
		// @ts-expect-error
		return this.c.drop(options);
	}

	/** Get all indexes */
	indexes():Promise<any>|undefined{
		// @ts-expect-error
		return this.c.indexes();
	}

	/**
	 * Reload Indexes
	 */
	async reloadIndexes(){
		var collection= this.c;
		if(collection == null) throw new Error('Not connected');
		var indexes= [];
		var schemaIndexes= this._indexes;
		var prefix= this._indexPrefix;
		var newIndexNameSet= new Set();
		// Check indexes
		for(var i= 0, len= schemaIndexes.length; i<len; i++){
			var index= schemaIndexes[i];
			if(index.name.startsWith(prefix))
				throw new Error(`All indexes expected to be prefixed with: ${prefix}. Got ${index.name} on colllection ${this.name}`);
			if(newIndexNameSet.has(index.name)) throw new Error(`Duplicated index: ${index.name} on collection ${this.name}`);
			newIndexNameSet.add(index.name);
		}
		// Load existing indexes
		var existingIndexes= await collection.indexes();
		var unmodified= new Set();
		// var removedIdx= [];
		if(existingIndexes && (len= existingIndexes.length))
			for(i=0; i<len; i++){
				var indexName= existingIndexes[i].name;
				if(indexName.startsWith(prefix)){
					if(newIndexNameSet.has(indexName)) unmodified.add(indexName);
					else
						this.log?.(`${this.name}: Drop index>> ${indexName}`);
						await collection.dropIndex(indexName); // remove unused index
						// removedIdx.push(indexName);
				}
			}
		// Insert new Indexes
		var newIndexes= schemaIndexes.filter((idx)=> !unmodified.has(idx.name));
		if(newIndexes.length){
			this.log?.(`${this.name}: Create indexes>> \n-> ${newIndexes.join("-> \n")}`);
			await collection.createIndexes(newIndexes);
		}
	}

	/** Set collection */


	/*! Predefined Methods for collection */
	insertOne(doc:Document, options?:any){
		// @ts-expect-error
		return this.c.insertOne(doc, options);
	}
	insertMany(docs: Document[], options?:any){
		// @ts-expect-error
		return this.c.insertMany(docs, options);
	}
}