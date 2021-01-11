const path = require( "path" );
const { promisify } = require( "util" );
const exec = promisify( require( "child_process" ).exec );

describe( "when generating tags", () => {
	beforeAll( async () => {
		await exec( "mv ./test/_git ./test/.git" );
	} );

	afterAll( async () => {
		await exec( "mv ./test/.git ./test/_git" );
	} );

	describe( "with a node project in a branch", () => {
		let results;
		beforeEach( async () => {
			try {
				const { stdout } = await exec( `node ${ path.resolve( "./dist/index" ) }`, {
					env: {
						...process.env,
						GITHUB_REF: "refs/branches/some-branch",
						GITHUB_WORKSPACE: path.resolve( "./test/node" ),
						GITHUB_REPOSITORY: "BanditSoftware/web-test-bot"
					},
					cwd: path.resolve( "./test/node" )
				} );
				results = stdout.trim().split( /\n/g );
			} catch ( error ) {
				throw error;
			}
		} );

		it( "should ouput the correct tags", () => {
			expect( results.slice( 0, 2 ) ).toEqual( [
				"::set-output name=plainTags::1.4.5-1601415912.feature-test-branch-0-1-4.ed0d199",
				"::set-output name=tags::leankit/web-test-bot:1.4.5-1601415912.feature-test-branch-0-1-4.ed0d199"
			] );
		} );
	} );

	describe( "with a node project in a tag", () => {
		let results;
		beforeEach( async () => {
			try {
				const { stdout } = await exec( `node ${ path.resolve( "./dist/index" ) }`, {
					env: {
						...process.env,
						GITHUB_REF: "refs/tags/some-tag",
						GITHUB_WORKSPACE: path.resolve( "./test/node" ),
						GITHUB_REPOSITORY: "BanditSoftware/web-test-bot"
					},
					cwd: path.resolve( "./test/node" )
				} );
				results = stdout.trim().split( /\n/g );
			} catch ( error ) {
				throw error;
			}
		} );

		it( "should ouput the correct tags", () => {
			expect( results.slice( 0, 2 ) ).toEqual( [
				"::set-output name=plainTags::1.4.5,latest",
				"::set-output name=tags::leankit/web-test-bot:1.4.5,leankit/web-test-bot:latest"
			] );
		} );
	} );

	describe( "with a Dockerfile", () => {
		let results;
		beforeEach( async () => {
			try {
				const { stdout } = await exec( `node ${ path.resolve( "./index" ) }`, {
					env: {
						...process.env,
						GITHUB_REF: "refs/branches/some-branch",
						GITHUB_WORKSPACE: path.resolve( "./test/docker" ),
						GITHUB_REPOSITORY: "BanditSoftware/web-test-bot"
					},
					cwd: path.resolve( "./test/docker" )
				} );
				results = stdout.trim().split( /\n/g );
			} catch ( error ) {
				throw error;
			}
		} );

		it( "should ouput the correct tags", () => {
			expect( results.slice( 0, 2 ) ).toEqual( [
				"::set-output name=plainTags::5.0.0-1601415912.feature-test-branch-0-1-4.ed0d199",
				"::set-output name=tags::leankit/web-test-bot:5.0.0-1601415912.feature-test-branch-0-1-4.ed0d199"
			] );
		} );
	} );
} );
