import Vue from "vue";
import { Chance } from "chance";
import { testCreateFetcherVm } from "../test/fetcher";
import { of, NEVER, throwError, from, Subscription, Subject } from "rxjs";
import { switchMap, map } from "rxjs/operators";
import { createFetcherMixinFactory, FetcherMixinOptions } from "./common";

type TestCommonOptions = {
	mixin: FetcherMixinOptions<any, any, any, any>;
	data?: () => Record<string, unknown>;
	fetcher?: any;
};

describe("mixins#common", () => {
	const chance = new Chance();
	const FetcherCommonMixin = createFetcherMixinFactory(Vue, {
		createFetch(vm, options) {
			return (context) =>
				from(options.fetch(context)).pipe(map((result) => ({ result })));
		},
	});

	let wrappers: any[] = [];
	const testCommonMixin = (options: TestCommonOptions) => {
		const Test = Vue.extend({
			mixins: [FetcherCommonMixin(options.mixin)],
			data: options.data,
			template: `<div></div>`,
		});
		const result = testCreateFetcherVm(Test, {
			fetcher: options.fetcher,
		});
		wrappers.push(result);
		return result;
	};

	afterEach(() => {
		const items = wrappers;
		for (const item of items) {
			item.destroy();
		}
		wrappers = [];
	});

	describe("basic", () => {
		it("should provide", () => {
			const randomProp = chance.word();
			// Test regular and stateKey
			const stateKeyMap = {
				state: null,
				[randomProp]: randomProp,
			};
			for (const [stateKey, value] of Object.entries(stateKeyMap)) {
				const fetcher = {
					string: chance.string(),
					number: chance.integer(),
				};
				const { vm, destroy } = testCommonMixin({
					fetcher,
					mixin: {
						stateKey: value,
						fetch: ({ fetcher }: any) => of(fetcher.string),
					},
				});
				expect(vm.fetcher).toBeDefined();
				expect(vm[stateKey]).toBeDefined();
				expect(vm[stateKey].loading).toBe(false);
				expect(vm[stateKey].error).toBe(null);
				expect(vm[stateKey].result).toBe(fetcher.string);
				expect(vm.$_vueFetcherSubscription).toBeInstanceOf(Subscription);

				destroy();
				expect(vm.$_vueFetcherSubscription).toHaveProperty("closed", true);
			}
		});

		it("should allow multiple mixins", () => {
			const dataA = { valueA: chance.string() };
			const dataB = { valueB: chance.string() };
			const Test = Vue.extend({
				mixins: [
					FetcherCommonMixin({
						stateKey: "stateA",
						fetch: () => of(dataA),
					}),
					FetcherCommonMixin({
						stateKey: "stateB",
						fetch: () => of(dataB),
					}),
				],
				template: `<div></div>`,
			});
			const { vm, destroy } = testCreateFetcherVm(Test);
			expect(vm.stateA.result).toEqual(dataA);
			expect(vm.stateB.result).toEqual(dataB);
			destroy();
		});
	});

	describe("loading", () => {
		it("should provide with loading", async () => {
			const { vm } = testCommonMixin({
				mixin: {
					fetch({ fetcher, loader }: any) {
						return NEVER;
					},
				},
			});
			expect(vm.state).toBeDefined();
			expect(vm.state.loading).toBe(true);
		});

		it("should start only on loader when autoLoader is false", async () => {
			const src$ = new Subject();
			const { vm } = testCommonMixin({
				mixin: {
					autoLoader: false,
					fetch({ loader }: any) {
						return src$.pipe(
							loader(),
							switchMap(() => NEVER)
						);
					},
				},
			});
			expect(vm.state).toBeDefined();
			expect(vm.state.loading).toBe(false);
			src$.next();
			expect(vm.state.loading).toBe(true);
		});
	});

	describe("watch", () => {
		it("should watch", async () => {
			const { vm } = testCommonMixin({
				data() {
					return { someProp: chance.string() };
				},
				mixin: {
					fetch({ watch }: any) {
						return watch("someProp");
					},
				},
			});
			expect(vm.state).toBeDefined();
			expect(vm.state.result).toBe(vm.someProp);
			vm.someProp = chance.string();
			await vm.$nextTick();
			expect(vm.state.result).toBe(vm.someProp);
		});
	});

	describe("fetch", () => {
		it("should error on fetch", async () => {
			const error = new Error();
			const { vm } = testCommonMixin({
				mixin: {
					fetch: () => throwError(error),
				},
			});
			expect(vm.state).toBeDefined();
			expect(vm.state.error).toBe(error);
		});
	});

	describe("reactivity", () => {
		it("should react", async () => {
			const fetch = jest.fn(() => of([]));
			const { vm, wrapperVm } = testCommonMixin({
				mixin: { fetch },
			});

			// Should trigger the reaction
			wrapperVm.fetcher = { new: true };
			await wrapperVm.$nextTick();

			// Should trigger the refetch
			wrapperVm.fetcher.new = false;
			await wrapperVm.$nextTick();

			expect(fetch).toHaveBeenCalledTimes(3);
		});
	});

	describe("skip", () => {
		it("should skip", async () => {
			const data = chance.string();
			const { vm } = testCommonMixin({
				mixin: {
					skip: () => true,
					fetch() {
						return of(data);
					},
				},
			});
			expect(vm.state.result).toBeUndefined();
		});

		it("should force no-skip", async () => {
			const data = chance.string();
			const { vm } = testCommonMixin({
				mixin: {
					skip: false,
					fetch() {
						return of(data);
					},
				},
			});
			expect(vm.state.result).toBe(data);
		});
	});

	/**
	 * Test the skip property
	 */
	describe("query", () => {
		it("should pass the query", async () => {
			const query = { query: chance.string() };
			const { vm } = testCommonMixin({
				mixin: {
					query: () => of(query),
					fetch({ query }: any) {
						return of(query);
					},
				},
			});
			expect(vm.state.result).toEqual(query);
		});

		it("should error on invalid query", async () => {
			const error = new Error();
			const { vm } = testCommonMixin({
				mixin: {
					query: () => throwError(error),
					fetch({ query }: any) {
						return of(query);
					},
				},
			});
			expect(vm.state.error).toBe(error);
		});
	});

	/**
	 * Test the skip property
	 */
	describe("refresh", () => {
		it("should refetch", async () => {
			const data = { text: chance.string() };
			const fetch = jest.fn(() => of(data));
			const { vm } = testCommonMixin({
				mixin: { fetch },
			});
			expect(vm.state.result).toEqual(data);
			vm.stateRefresh();
			expect(vm.state.result).toEqual(data);
			expect(fetch).toHaveBeenCalledTimes(2);
		});

		it("should refetch on fetch errors", async () => {
			let error: Error | null = new Error();
			const data = { text: chance.string() };
			const fetch = jest.fn(() => (error ? throwError(error) : of(data)));
			const { vm } = testCommonMixin({
				mixin: { fetch },
			});
			expect(vm.state.error).toBe(error);
			error = null;
			vm.stateRefresh();
			expect(vm.state.result).toEqual(data);
			expect(fetch).toHaveBeenCalledTimes(2);
		});

		it("should refetch on query errors", async () => {
			let error: Error | null = new Error();
			const data = { text: chance.string() };
			const query = jest.fn(() => (error ? throwError(error) : of(null)));
			const fetch = jest.fn(() => of(data));
			const { vm } = testCommonMixin({
				mixin: {
					query,
					fetch,
				},
			});
			expect(vm.state.error).toBe(error);
			error = null;
			vm.stateRefresh();
			expect(vm.state.result).toEqual(data);
			expect(fetch).toHaveBeenCalledTimes(1);
			expect(query).toHaveBeenCalledTimes(2);
		});
	});
});
