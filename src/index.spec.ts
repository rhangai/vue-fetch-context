import * as VueFetchContextExport from "./index";

describe("index", () => {
	it("should export", () => {
		expect(VueFetchContextExport).toHaveProperty("VueFetchContext");
		expect(VueFetchContextExport).toHaveProperty("createFetchContextMixins");
		expect(VueFetchContextExport).toHaveProperty("createFetchContextComponent");
		expect(VueFetchContextExport).toHaveProperty("VueFetchContextUtil");

		const VueFetchContextUtil = VueFetchContextExport.VueFetchContextUtil;
		expect(VueFetchContextUtil).toHaveProperty("watch");
	});
});
