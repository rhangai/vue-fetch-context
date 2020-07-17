import { VueConstructor } from "../types";
import { createFetcherMixin, FetcherMixinOptions } from "./common";
import { of } from "rxjs";
import { switchMap } from "rxjs/operators";
import { watch } from "../util";

export type FetcherMixinListResult<T = unknown> = { items: T[] };

type FetchMixinListTypes = {
	Context: {};
	Options: {};
	Result: FetcherMixinListResult;
};

export type FetcherMixinListFactory<IFetcher> = <T = unknown>(
	options: FetcherMixinOptions<
		IFetcher,
		FetcherMixinListResult<T>,
		FetchMixinListTypes
	>
) => VueConstructor;

export function createFetcherMixinListFactory<IFetcher>(
	vue: VueConstructor
): FetcherMixinListFactory<IFetcher> {
	return createFetcherMixin<IFetcher, FetchMixinListTypes>(vue, {
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
}
