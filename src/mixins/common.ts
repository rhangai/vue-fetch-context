import {
	Observable,
	of,
	MonoTypeOperatorFunction,
	Subscription,
	combineLatest,
	from,
	BehaviorSubject,
} from "rxjs";
import { switchMap, tap } from "rxjs/operators";
import { Vue, VueConstructor, VueWatchOptions, VuePropOptions } from "../types";
import { FETCH_CONTEXT_PROVIDE } from "../constants";
import { watch } from "../util/watch";
import { createResultSubject } from "../util/result";

export type FetcherMixinTypes<Context = any, Options = any, Result = any> = {
	Context: Context;
	Options: Options;
	Result: Result;
};

/**
 * Basic context
 */
export type FetcherMixinFetchContextBase<IFetcher, ResultType> = {
	vm: Vue;
	fetcher: IFetcher;
	watch<T>(prop: string | (() => T), options?: VueWatchOptions): Observable<T>;
	loader<T>(): MonoTypeOperatorFunction<T>;
};

/**
 * Options for the factory
 */
export type FetcherMixinFactoryOptions<T extends FetcherMixinTypes> = {
	props?: Record<string, VuePropOptions>;
	map?: (item: any) => any;
	createFetch?(
		vm: Vue,
		options: FetcherMixinOptions<unknown, T["Result"], unknown, T>
	): (
		context: FetcherMixinFetchContextBase<unknown, T["Result"]> & {
			query: unknown;
		}
	) => FetchResult<T["Result"]>;
};

// Result when using fetch
export type FetchResult<T> = PromiseLike<T> | Observable<T>;

/**
 * Options for the mixins
 */
export type FetcherMixinOptions<
	IFetcher,
	ResultType,
	QueryType,
	T extends FetcherMixinTypes
> = T["Options"] & {
	autoLoader?: boolean;
	stateKey?: string;
	skip?: false | (() => boolean);

	/**
	 *
	 * @param context
	 */
	query?(
		context: T["Context"] & FetcherMixinFetchContextBase<IFetcher, ResultType>
	): FetchResult<QueryType>;

	/**
	 *
	 * @param context
	 */
	fetch(
		context: T["Context"] &
			FetcherMixinFetchContextBase<IFetcher, ResultType> & { query: QueryType }
	): FetchResult<ResultType>;
};

/**
 * Create a factory using common options
 * @param factoryOptions
 */
export function createFetcherMixinFactory<
	IFetcher,
	T extends FetcherMixinTypes
>(
	vue: VueConstructor,
	paramFactoryOptions:
		| FetcherMixinFactoryOptions<T>
		| ((
				options: FetcherMixinOptions<IFetcher, T["Result"], unknown, T>
		  ) => FetcherMixinFactoryOptions<T>)
) {
	// Return the mixin factory
	return (options: FetcherMixinOptions<IFetcher, T["Result"], unknown, T>) => {
		const stateKey = options.stateKey ?? "state";
		const factoryOptions =
			typeof paramFactoryOptions === "function"
				? paramFactoryOptions(options)
				: { ...paramFactoryOptions };

		const mixin = vue.extend({
			props: {
				...factoryOptions.props,
			},
			inject: {
				fetchContext: {
					from: FETCH_CONTEXT_PROVIDE,
				},
			},
			data() {
				return {
					[stateKey]: {
						loading: false,
						error: null,
					},
				};
			},
			created(this: any) {
				// Create the fetch function
				const vm: Vue = this;

				// Save the state subject so we can trigger a force refresh
				const stateSubject$ = new BehaviorSubject<null>(null);
				this[stateKey + "Subject"] = stateSubject$;

				// Create the fetch function
				const fetch = factoryOptions.createFetch
					? factoryOptions.createFetch(this, options)
					: options.fetch;

				// Observe the fetcher
				const fetcher$ = watch<any>(this, () => this.fetchContext.fetcher, {
					deep: true,
				});

				const result = createResultSubject({
					next: (result: any) => {
						const mapped = factoryOptions.map
							? factoryOptions.map(result)
							: result;
						this.$set(this, stateKey, {
							loading: false,
							error: null,
							...mapped,
						});
					},
					error: (error) => {
						this.$set(this, stateKey, {
							loading: false,
							error,
						});
					},
				});

				const state$: Observable<never> = of(null).pipe(
					// Observable for skip
					switchMap(() => {
						if (options.skip === false) return of(false);
						return watch<boolean>(
							this,
							options.skip ??
								(() => this.$attrs.disabled || this.$attrs.readonly)
						);
					}),
					// Observable for the fetcher
					switchMap((skip: boolean) => {
						if (skip) {
							return result.value(null);
						}

						// Create the partial context to pass to fetch/query functions
						const partialContext: Omit<
							FetcherMixinFetchContextBase<IFetcher, T["Result"]>,
							"fetcher"
						> = {
							vm,

							loader: <T>() =>
								tap<T>(() => {
									this[stateKey].loading = true;
								}),

							watch: <T>(prop: any, options: any) =>
								watch<T>(vm, prop, options),
						};

						// Observe query changes
						const query$ = options.query
							? from(options.query(partialContext))
							: of(null);

						// When the query
						return combineLatest([fetcher$, query$, stateSubject$]).pipe(
							// Triggers the loading
							tap(() => {
								if (options.autoLoader !== false) {
									this[stateKey].loading = true;
								}
							}),
							// Save the result
							result.operator(([fetcher, query]) => {
								return fetch({ fetcher, ...partialContext, query });
							})
						);
					})
				);

				// Subscribe to the result
				const subscription = state$.subscribe({
					error: (error) => {
						this.$set(this, stateKey, {
							loading: false,
							error,
						});
					},
					complete: () => {
						this.$set(this, stateKey, {
							loading: false,
							error: null,
						});
					},
				});

				// Add the subscription to unsubscribe on destroy
				this.$_vueFetcherSubscription =
					this.$_vueFetcherSubscription ?? new Subscription();
				this.$_vueFetcherSubscription.add(subscription);
			},
			/**
			 * Before destroying the mixin, unsubscribe from everything
			 */
			beforeDestroy() {
				if (this.$_vueFetcherSubscription) {
					this.$_vueFetcherSubscription.unsubscribe();
					this.$_vueFetcherSubscription = null;
				}
			},
			methods: {
				/**
				 * Triggers a refresh of the state.
				 */
				[`${stateKey}Refresh`]() {
					// Trigger a refresh
					this[`${stateKey}Refresh`]?.next(null);
				},
			},
		});

		return mixin;
	};
}
