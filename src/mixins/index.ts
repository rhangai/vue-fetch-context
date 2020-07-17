import { FetcherMixinBaseFactory, createFetcherMixinBaseFactory } from "./base";
import { VueConstructor } from "vue/types/umd";

export type VueFetcherMixins<IFetcher> = {
	readonly Base: FetcherMixinBaseFactory<IFetcher>;
};

export function createFetcherMixins<IFetcher>(
	vue: VueConstructor
): VueFetcherMixins<IFetcher> {
	return {
		Base: createFetcherMixinBaseFactory(vue),
	};
}
