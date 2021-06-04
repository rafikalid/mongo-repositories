/**
 * Compile Typescript files
 */
import {src, dest, lastRun} from 'gulp';
import GulpTypescript from 'gulp-typescript';
import SrcMap from 'gulp-sourcemaps';
import CreateImportTransformer from './typescript-transformer';
import {parse} from 'json5';
import {readFileSync} from 'fs';
import Rename from 'gulp-rename';


//Load config
const tsConfig= parse(readFileSync('tsconfig.json', 'utf-8'));
const importTransformer= CreateImportTransformer(tsConfig.compilerOptions);

const isProd= process.argv.includes('--prod');

const TsProject = GulpTypescript.createProject('tsconfig.json', {
	removeComments: isProd,
	pretty: !isProd,
	getCustomTransformers: ()=>({
		after: [
			importTransformer
		]
	})
});
// import babel from 'gulp-babel';

export default function typescriptCompile(){
	return src('src/**/*.ts', {nodir: true, since: lastRun(typescriptCompile)})
		.pipe(SrcMap.init())
		.pipe(TsProject())
		.pipe(Rename({extname: '.mjs'}))
		.pipe(SrcMap.write('.'))
		.pipe(dest('build'));
}