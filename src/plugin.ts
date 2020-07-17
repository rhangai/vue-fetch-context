import { Vue, VuePlugin } from "./types";
import { createFetcherProvider } from "./components/provider";

export const VueFetcher: VuePlugin<Vue> = {
	install(vue) {
		vue.component("fetcher-provider", createFetcherProvider(vue));
	},
};
