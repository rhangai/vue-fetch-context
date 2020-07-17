import { Vue, VuePlugin } from "./types";
import { createFetchContextComponent } from "./components/context";

export const VueFetchContext: VuePlugin<Vue> = {
	install(vue) {
		vue.component("fetch-context", createFetchContextComponent(vue));
	},
};
