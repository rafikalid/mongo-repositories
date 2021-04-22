/**
 * Compile Typescript files
 */
import {src, dest} from 'gulp';
import * as GulpTypescript from 'gulp-typescript';

const TsProject = GulpTypescript.createProject('tsconfig.json');
// import babel from 'gulp-babel';

export function compile(globSrc: string, options: object){
	return src(globSrc, options)
		.pipe(TsProject())
		.pipe(dest('build'));
}