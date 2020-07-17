import { Vue, VuePlugin } from "./types";
import { createFetchContext } from "./components/context";

export const VueFetcher: VuePlugin<Vue> = {
	install(vue) {
		vue.component("fetch-context", createFetchContext(vue));
	},
};
