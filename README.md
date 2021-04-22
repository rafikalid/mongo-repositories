# mongo-repositories
Tiny layer over mongoDB native driver to simplify queries, validation and indexing

# Install
```shell
npm i -S mongo-repositories
```

# Get started
```javascript
const RepositoryFactory= require('mongo-repositories');
// OR: import RepositoryFactory from 'mongo-repositories';

const Repository= new RepositoryFactory({
	prefix: 'g-', // prefixing index names to be distinguishable
	/**
	 * Log logic
	 * @optional
	 * @default console.log
	 * @Set to "undefined" or "null" to disable logs
	 */
	log:	undefined
});
```

## Connect to MongoDB
```javascript
/** @return Promise */
await Repository.connect('mongo://Connection_string');
```

## Disconnect from MongoDB
```javascript
/** @return Promise */
await Repository.close();
```

## Parse ObjectId from String
```javascript
/** @return Promise */
var id= Repository.parseObjectId('HexObjectId');
```

# Collection
## Create new Collection
```javascript
const Collection= Repository.from({
	name:	'collectionName',
	/** Set of used indexes */
	indexes: [
		{
			name: 'g-indexName', // must be prefixed with same choosed Repository.prefix
			/** @See additional attributes from Mongo documentation */
		}
	],
	define: function(collection){
		// Collection is the native mongo driver collection
		// @See mongo documentation for NodeJS native driver
		// at: http://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html
		return {
			myMethod(args){ /* Your logic */ }
			// Your method will be accessible via: data= await MyCollection.myMethod(args);
		}
	}
});

// Collection will be accessible via:
const sameCollection= Repositories.all.collectionName;
```

## Predefined methods
```javascript
var MyCollection= Repository.from({/* logic */});

/** Insert document */
await MyCollection.insertOne({doc});

/** Insert list of documents */
await MyCollection.insertMany([{doc}]);
```
