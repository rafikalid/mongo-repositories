/** From options */
export interface mongoIndex{
	name: string,
	key: any
}

export interface fromOptions{
	name: string,
	indexes?: mongoIndex[],
	define: (collection: Collection, schema:any)=> any
}

/**
 * Main Mongo Repository class
 */
export interface RepositoryOptions{
	/** Prefix for index names */
	prefix: string,
	log?:	Function|undefined|null
}
