import type { IndexSpecification } from "mongodb";
import type Repository from "./repository";
// import type Collection from "./collection";

const COLLECTION_NAME_REGEX= /^\w[\w_-]{0,63}$/;

/**
 * Collection decorators
 */
export function Repo(name: string, repositories: Repository){
	// Checks
	if(name.startsWith('_')) throw new Error(`Collection name begins with underscore (not allowed) : ${name}`);
	if(!COLLECTION_NAME_REGEX.test(name)) throw new Error(`Collection name mast match ${COLLECTION_NAME_REGEX}: ${name}`);

	return function(target: Function){
		var proto= target.prototype;
		proto.name= name;
		proto.repositories= repositories;
		proto._indexPrefix= repositories._prefix // Index prefix
		proto.log= repositories.log;
	}
}

/**
 * Index decorators
 */
export function Indexes(indexes: IndexSpecification[]){
	return function(target: Function){
		target.prototype._indexes= indexes
	}
}