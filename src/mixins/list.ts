import { VueConstructor } from "../types";
import { createFetcherMixinFactory, FetcherMixinOptions } from "./factory";
import { defer, of, Observable } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { watch } from "../util";

export type FetcherMixinListResult<T> = {
	items: T[];
};

type FetchMixinListFactoryInfo = {
	Context: {};
	Options: {};
	Result: FetcherMixinListResult<unknown>;
};

export type FetcherMixinListFactory<IFetcher> = <T = unknown>(
	options: FetcherMixinOptions<
		IFetcher,
		FetcherMixinListResult<T>,
		FetchMixinListFactoryInfo
	>
) => VueConstructor;

export const createFetcherMixinListFactory = createFetcherMixinFactory<
	FetchMixinListFactoryInfo
>({
	createFetch(vm, options) {
		const items$ = watch<unknown[] | null>(vm, "items");
		return (context) => {
			return items$.pipe(
				switchMap((items) => {
					if (items != null) return of({ items });
					return options.fetch({ ...context });
				})
			);
		};
	},
});
