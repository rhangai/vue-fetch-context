import { createLocalVue } from "@vue/test-utils";
import { VueFetchContext } from "./plugin";

describe("plugin", () => {
	it("should install the plugin", async () => {
		const vue = createLocalVue();
		vue.use(VueFetchContext);

		const component = vue.component("fetch-context");
		expect(component).toBeDefined();
	});
});
