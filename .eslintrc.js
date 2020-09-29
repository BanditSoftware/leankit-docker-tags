module.exports = {
	extends: [
		"leankit",
		"leankit/es6"
	],
	globals: {
		DEBUG: false
	},
	overrides: [
		{
			files: [ "**/*.test.{js,ts}", "**/{__mocks__,spec}/**.{js,ts}" ],
			extends: [ "leankit/test" ],
			env: {
				jest: true
			}
		}
	],
	reportUnusedDisableDirectives: true
};
