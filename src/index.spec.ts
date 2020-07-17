import * as VueFetchContextExport from "./index";

describe("index", () => {
	it("should export", () => {
		expect(VueFetchContextExport).toHaveProperty("VueFetchContext");
		expect(VueFetchContextExport).toHaveProperty("createFetchContextMixins");
	});
});
