import { VueConstructor } from "../types";
import { FetcherMixinBaseFactory, createFetcherMixinBaseFactory } from "./base";
import { FetcherMixinDataFactory, createFetcherMixinDataFactory } from "./data";
import { FetcherMixinListFactory, createFetcherMixinListFactory } from "./list";
import { Observable, of } from "rxjs";

export type VueFetcherMixins<IFetcher> = {
	readonly Base: FetcherMixinBaseFactory<IFetcher>;
	readonly Data: FetcherMixinDataFactory<IFetcher>;
	readonly List: FetcherMixinListFactory<IFetcher>;
};

export function createFetcherMixins<IFetcher>(
	vue: VueConstructor
): VueFetcherMixins<IFetcher> {
	return {
		Base: createFetcherMixinBaseFactory(vue),
		Data: createFetcherMixinDataFactory(vue),
		List: createFetcherMixinListFactory(vue),
	};
}
