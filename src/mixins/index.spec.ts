import Vue from "vue";
import { createFetcherMixins } from "./index";

describe("mixins", () => {
	const mixins: any = createFetcherMixins(Vue);

	it("should create mixins", () => {
		expect(typeof mixins.Base).toBe("function");
		expect(typeof mixins.Data).toBe("function");
		expect(typeof mixins.List).toBe("function");
	});
});
