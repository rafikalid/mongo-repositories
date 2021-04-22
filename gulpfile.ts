'use strict';
import {src, dest, watch, series, parallel} from 'gulp';
// import babel from 'gulp-babel';

import {compile as compileTypescript} from './gulp/typescript'

/** Watch modified files */
function watchCb():void{
	watch('src/**/*.ts', (obj:any)=> compileTypescript(obj.path, {"base": "src/"}));
}

export default series([
	parallel([
		(()=> compileTypescript('src/**/*.ts', {nodir: true}))
	]),
	watchCb
]);
