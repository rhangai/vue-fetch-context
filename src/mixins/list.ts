import { VueConstructor } from "../types";
import { createFetcherMixinFactory, FetcherMixinOptions } from "./common";
import { of } from "rxjs";
import { switchMap } from "rxjs/operators";
import { watch } from "../util/watch";

export type FetcherMixinListResult<T = unknown> = { items: T[] };

type FetchMixinListTypes = {
	Context: {};
	Options: {
		propItems?: string | null;
	};
	Result: FetcherMixinListResult;
};

export type FetcherMixinListFactory<IFetcher> = <
	T = unknown,
	QueryType = unknown
>(
	options: FetcherMixinOptions<
		IFetcher,
		FetcherMixinListResult<T>,
		QueryType,
		FetchMixinListTypes
	>
) => VueConstructor;

export function createFetcherMixinListFactory<IFetcher>(
	vue: VueConstructor
): FetcherMixinListFactory<IFetcher> {
	return createFetcherMixinFactory<IFetcher, FetchMixinListTypes>(
		vue,
		(options) => {
			const propItems = options.propItems ?? "items";
			return {
				props: {
					[propItems]: {
						type: Array,
						default: null,
					},
				},
				createFetch(vm, { fetch }) {
					const items$ = watch<unknown[] | null>(vm, propItems);
					return (context) => {
						return items$.pipe(
							switchMap((items) => {
								if (items != null) return of({ items });
								return fetch({ ...context });
							})
						);
					};
				},
			};
		}
	);
}
