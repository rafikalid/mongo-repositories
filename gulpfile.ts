'use strict';
import {watch, series, parallel} from 'gulp';
// import babel from 'gulp-babel';

import compileTypescript from './gulp/typescript'

/** Watch modified files */
const doWatch= !process.argv.includes('--prod');
function watchCb(cb):void{
	if(doWatch){
		watch('src/**/*.ts', compileTypescript);
	}
	cb();
}

export default series([
	compileTypescript,
	watchCb
]);
