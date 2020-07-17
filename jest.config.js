// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
	// Typescript preset
	preset: "ts-jest",

	// An array of glob patterns indicating a set of files for which coverage information should be collected
	collectCoverageFrom: ["**/*.ts"],

	// The directory where Jest should output its coverage files
	coverageDirectory: "../coverage",

	// The root directory that Jest should scan for tests and modules within
	rootDir: "src",
};
