import * as VueFetcherExport from "./index";

describe("index", () => {
	it("should export", () => {
		expect(VueFetcherExport).toHaveProperty("VueFetcher");
		expect(VueFetcherExport).toHaveProperty("createFetcherMixins");
	});
});
