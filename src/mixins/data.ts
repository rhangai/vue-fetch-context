import { VueConstructor } from "../types";
import { createFetcherMixinFactory, FetcherMixinOptions } from "./factory";
import { defer } from "rxjs";
import { map } from "rxjs/operators";

type FetchMixinDataFactoryInfo = {
	Context: {};
	Options: {};
	Result: unknown;
};

export type FetcherMixinDataResult<T> = T;

export type FetcherMixinDataFactory<IFetcher> = <T = unknown>(
	options: FetcherMixinOptions<
		IFetcher,
		FetcherMixinDataResult<T>,
		FetchMixinDataFactoryInfo
	>
) => VueConstructor;

export const createFetcherMixinDataFactory = createFetcherMixinFactory({
	createFetch(vm, options) {
		return (context) => {
			return defer(() => options.fetch({ ...context })).pipe(
				map((data) => ({ data }))
			);
		};
	},
});
