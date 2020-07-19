import Vue from "vue";
import { Chance } from "chance";
import { testCreateFetcherVm } from "../test/fetcher";
import { of, NEVER, throwError, from, Subscription } from "rxjs";
import { switchMap, map } from "rxjs/operators";
import { createFetcherMixinFactory, FetcherMixinOptions } from "./common";

type TestCommonOptions = {
	mixin: FetcherMixinOptions<any, any, any, any>;
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
			template: `<div></div>`,
		});
		const result = testCreateFetcherVm(Test, { fetcher: options.fetcher });
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

	it("should provide", () => {
		const fetcher = {
			string: chance.string(),
			number: chance.integer(),
		};
		const { vm, destroy } = testCommonMixin({
			fetcher,
			mixin: {
				fetch: ({ fetcher }: any) => of(fetcher.string),
			},
		});
		expect(vm.fetcher).toBeDefined();
		expect(vm.state).toBeDefined();
		expect(vm.state.loading).toBe(false);
		expect(vm.state.error).toBe(null);
		expect(vm.state.result).toBe(fetcher.string);
		expect(vm.$_vueFetcherSubscription).toBeInstanceOf(Subscription);

		destroy();
		expect(vm.$_vueFetcherSubscription).toHaveProperty("closed", true);
	});

	it("should provide with loading", async () => {
		const { vm } = testCommonMixin({
			mixin: {
				fetch({ fetcher, loader }: any) {
					return of(null).pipe(
						loader(),
						switchMap(() => NEVER)
					);
				},
			},
		});
		expect(vm.state).toBeDefined();
		expect(vm.state.loading).toBe(true);
	});

	it("should error", async () => {
		const error = new Error();
		const { vm } = testCommonMixin({
			mixin: {
				fetch: () => throwError(error),
			},
		});
		expect(vm.state).toBeDefined();
		expect(vm.state.error).toBe(error);
	});

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

	/**
	 * Test the skip property
	 */
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
});
