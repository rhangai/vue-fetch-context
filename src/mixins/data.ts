import { VueConstructor } from "../types";
import { createFetcherMixinFactory, FetcherMixinOptions } from "./common";
import { from } from "rxjs";
import { map } from "rxjs/operators";

type FetchMixinDataTypes = {
	Context: {};
	Options: {};
	Result: unknown;
};

export type FetcherMixinDataResult<T> = T;

export type FetcherMixinDataFactory<IFetcher> = <T = unknown>(
	options: FetcherMixinOptions<
		IFetcher,
		FetcherMixinDataResult<T>,
		FetchMixinDataTypes
	>
) => VueConstructor;

export function createFetcherMixinDataFactory<IFetcher>(
	vue: VueConstructor
): FetcherMixinDataFactory<IFetcher> {
	return createFetcherMixinFactory<IFetcher, FetchMixinDataTypes>(vue, {
		map: (data) => ({ data }),
	});
}
