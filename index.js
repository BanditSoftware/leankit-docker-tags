const fs = require( "fs" );
const { promisify } = require( "util" );
const path = require( "path" );
const { context } = require( "@actions/github" );
const { setOutput, setFailed, info } = require( "@actions/core" );

const childProcessExec = promisify( require( "child_process" ).exec );

async function exec( ...args ) {
	const { stdout } = await childProcessExec( ...args );
	return stdout.trim();
}


async function main() { // eslint-disable-line max-statements
	const workspace = process.env.GITHUB_WORKSPACE || process.cwd();
	const { ref } = context;
	const { repo } = context.repo;
	const isTag = ref.includes( "refs/tag" );

	const packagePath = path.join( workspace, "package.json" );
	const dockerfilePath = path.join( workspace, "Dockerfile" );

	let version;
	try {
		if ( fs.existsSync( packagePath ) ) {
			version = require( packagePath ).version;
		} else if ( fs.existsSync( dockerfilePath ) ) {
			const match = fs.readFileSync( dockerfilePath, "utf-8" ).match( /APPLICATION_VERSION (.+)$/m );
			version = match[ 1 ].trim();
		}
	} catch ( error ) {
		setFailed( "Could not determine a version number from package.json or Dockerfile" );
	}

	const commitDate = await exec( "git --no-pager log -1 --format='%ct'" );
	const commitBranch = ( await exec( "git branch --show-current" ) ).replace( /[^a-zA-Z0-9-]/g, "-" );
	const sha = await exec( "git --no-pager log -1 --format='%h'" );

	const tags = [];

	if ( isTag ) {
		tags.push( version, "latest" );
	} else {
		tags.push( `${ version }-${ commitDate }.${ commitBranch }.${ sha }` );
	}

	const mappedTags = tags.map( tag => `leankit/${ repo }:${ tag }` );
	const ghcrTags = tags.map( tag => `ghcr.io/banditsoftware/${ repo }:${ tag }` );

	setOutput( "plainTags", tags.join( "," ) );
	setOutput( "tags", mappedTags.join( "," ) );
	setOutput( "ghcrTags", ghcrTags.join( "," ) );

	info( `Generated tags: ${ mappedTags.join( "," ) }` );
}

main().catch( err => {
	setFailed( `An error occurred while generating the tag ${ err }` );
} );
