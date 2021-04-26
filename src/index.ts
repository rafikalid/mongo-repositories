import Repository from './repository'
export default Repository;

import {ObjectID} from 'mongodb'
import Collection from './collection'
import {Repo, Indexes} from './collection-deco'

/** ObjectId */
export function parseObjectId(value: string){
	return ObjectID.createFromHexString(value);
}

/** Export */
export {Collection, Repo, Indexes, ObjectID}
