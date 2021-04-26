'use strict';
import {watch, series, parallel} from 'gulp';
// import babel from 'gulp-babel';

import compileTypescript from './gulp/typescript'

/** Watch modified files */
function watchCb():void{
	watch('src/**/*.ts', compileTypescript);
}

export default series([
	compileTypescript,
	watchCb
]);
