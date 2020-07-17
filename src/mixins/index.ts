import { VueConstructor } from "../types";
export { FetchResult } from "./common";
import { FetcherMixinBaseFactory, createFetcherMixinBaseFactory } from "./base";
import { FetcherMixinDataFactory, createFetcherMixinDataFactory } from "./data";
import { FetcherMixinListFactory, createFetcherMixinListFactory } from "./list";

export type VueFetchContextMixins<IFetcher> = {
	readonly Base: FetcherMixinBaseFactory<IFetcher>;
	readonly Data: FetcherMixinDataFactory<IFetcher>;
	readonly List: FetcherMixinListFactory<IFetcher>;
};

export function createFetchContextMixins<IFetcher>(
	vue: VueConstructor
): VueFetchContextMixins<IFetcher> {
	return {
		Base: createFetcherMixinBaseFactory(vue),
		Data: createFetcherMixinDataFactory(vue),
		List: createFetcherMixinListFactory(vue),
	};
}
