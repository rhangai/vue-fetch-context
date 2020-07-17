import Vue from "vue";
import { createFetchContextMixins } from "./index";

describe("mixins", () => {
	const mixins: any = createFetchContextMixins(Vue);

	it("should create mixins", () => {
		expect(typeof mixins.Base).toBe("function");
		expect(typeof mixins.Data).toBe("function");
		expect(typeof mixins.List).toBe("function");
	});
});
