import {
	Observable,
	of,
	MonoTypeOperatorFunction,
	ObservableInput,
	Subscription,
} from "rxjs";
import { switchMap, tap } from "rxjs/operators";
import { VueConstructor } from "../types";
import { FETCH_CONTEXT_PROVIDE } from "../constants";
import { PropOptions } from "vue/types/umd";
import { watch } from "../util";

export type FetcherMixinTypes<Context = any, Options = any, Result = any> = {
	Context: Context;
	Options: Options;
	Result: Result;
};

/**
 * Basic context
 */
export type FetcherMixinFetchContextBase<IFetcher> = {
	fetcher: IFetcher;
	loader<T>(): MonoTypeOperatorFunction<T>;
};

/**
 * Options for the factory
 */
export type FetcherMixinFactoryOptions<T extends FetcherMixinTypes> = {
	props?: Record<string, PropOptions>;
	createFetch(
		vm: Vue,
		options: FetcherMixinOptions<unknown, T["Result"], T>
	): (
		context: FetcherMixinFetchContextBase<unknown>
	) => Observable<T["Result"]>;
};

// Result when using fetch
export type FetchResult<T> = PromiseLike<T> | Observable<T>;

/**
 * Options for the mixins
 */
export type FetcherMixinOptions<
	IFetcher,
	ResultType,
	T extends FetcherMixinTypes
> = T["Options"] & {
	autoLoader?: boolean;
	stateKey?: string;
	skip?: false | (() => boolean);
	fetch(
		context: T["Context"] & FetcherMixinFetchContextBase<IFetcher>
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
				options: FetcherMixinOptions<IFetcher, T["Result"], T>
		  ) => FetcherMixinFactoryOptions<T>)
) {
	// Return the mixin factory
	return (options: FetcherMixinOptions<IFetcher, T["Result"], T>) => {
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
				const fetch = factoryOptions.createFetch(this, options);

				const result$ = of(null).pipe(
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
						if (skip) return of(null);
						const loader = <T>() =>
							tap<T>(() => {
								this[stateKey].loading = true;
							});
						if (options.autoLoader !== false) {
							this[stateKey].loading = true;
						}
						return fetch({
							loader: loader,
							fetcher: this.fetchContext.fetcher,
						});
					})
				);

				const subscription = result$.subscribe({
					next: (result: any) => {
						this.$set(this, stateKey, {
							loading: false,
							error: null,
							...result,
						});
					},
					error: (error) => {
						this.$set(this, stateKey, {
							loading: false,
							error,
						});
					},
				});

				this.$_vueFetcherSubscription =
					this.$_vueFetcherSubscription ?? new Subscription();
				this.$_vueFetcherSubscription.add(subscription);
			},
			beforeDestroy() {
				this.$_vueFetcherSubscription.unsubscribe();
			},
			methods: {},
		});

		return mixin;
	};
}
