/**
 * Compile Typescript files
 */
import {src, dest} from 'gulp';
import GulpTypescript from 'gulp-typescript';
import SrcMap from 'gulp-sourcemaps';
import Merge from 'merge2';

const TsProject = GulpTypescript.createProject('tsconfig.json', {pretty: true, declaration: true});
// import babel from 'gulp-babel';

export function compile(globSrc: string, options: object){
	var tsResult= src(globSrc, options)
		.pipe(SrcMap.init())
		.pipe(TsProject());
	return Merge([
		tsResult.dts.pipe(dest('types/')),
		tsResult.js.pipe(SrcMap.write('.')).pipe(dest('build'))
	]);
}