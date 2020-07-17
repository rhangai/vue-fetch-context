import { createLocalVue } from "@vue/test-utils";
import { VueFetcher } from "./plugin";

describe("plugin", () => {
	it("should install the plugin", async () => {
		const vue = createLocalVue();
		vue.use(VueFetcher);

		const component = vue.component("fetch-context");
		expect(component).toBeDefined();
	});
});
