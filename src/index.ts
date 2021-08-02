import Repository from './repository'
export default Repository;

import {ObjectId} from 'mongodb';
import Collection from './collection';
import {Repo, Indexes} from './collection-deco';

/** ObjectId */
export function parseObjectId(value: string){
	return ObjectId.createFromHexString(value);
}

/** Export */
export {Collection, Repo, Indexes, ObjectId}
