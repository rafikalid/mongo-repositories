import type Repository from './repository';
import {Collection as MongoCollection, Db, ObjectID, IndexSpecification} from 'mongodb'

type Document= Record<string, any>;

// export interface CollectionOptions{
// 	name: string,
// 	db: Repository,
// 	indexes: IndexSpecification[]
// }

/**
 * Mongo Collection adapter
 */
export default abstract class Collection {
	abstract name:	string
	schema: undefined //TODO add schema validation
	protected db: Repository
	protected abstract indexes: IndexSpecification[]
	protected _indexPrefix!: string // prefixing index names to be distinguishable
	

	c: MongoCollection<any> | undefined= undefined
	collection: MongoCollection<any> | undefined= undefined

	/** Log to console */
	private log: Function | undefined | null

	constructor(db: Repository){
		this.db= db
		this._indexPrefix= db._prefix;
		// Init
		db._addCollection(this);
	}

	/** @Private Init connection */
	async init(){
		this.c= this.collection= this.db.db.collection(this.name);
		// Reload indexes
		await this.reloadIndexes();
	}

	/** Drop collection */
	drop(options?:any){
		return this.c!.drop(options);
	}

	/** Get all indexes from DB */
	// getIndexes(){
	// 	return this.c!.indexes();
	// }

	/**
	 * Reload Indexes
	 */
	async reloadIndexes(){
		var collection= this.c;
		if(collection == null) throw new Error('Not connected');
		var schemaIndexes= this.indexes;
		var prefix= this._indexPrefix;
		var newIndexNameSet= new Set();
		// Check indexes
		for(var i= 0, len= schemaIndexes.length; i<len; i++){
			var index= schemaIndexes[i];
			if(!index.name!.startsWith(prefix))
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

	/*! Predefined Methods for collection */
	get(id: ObjectID){ return this.c!.findOne({_id: id}) }
	insertOne(doc:Document, options?:any){ return this.c!.insertOne(doc, options); }
	insertMany(docs: Document[], options?:any){ return this.c!.insertMany(docs, options); }

	set(id: ObjectID, updates: Document){ return this.c!.updateOne({_id: id}, {$set: updates}); }
}