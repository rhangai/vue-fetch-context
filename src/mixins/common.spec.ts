import Vue from "vue";
import { Chance } from "chance";
import { testCreateFetcherVm } from "../test/fetcher";
import { of, NEVER, throwError, from } from "rxjs";
import { switchMap, map } from "rxjs/operators";
import { createFetcherMixinFactory } from "./common";

describe("mixins#common", () => {
	const chance = new Chance();
	const FetcherCommonMixin = createFetcherMixinFactory(Vue, {
		createFetch(vm, options) {
			return (context) =>
				from(options.fetch(context)).pipe(map((result) => ({ result })));
		},
	});
	it("should provide", () => {
		const Test = Vue.extend({
			mixins: [
				FetcherCommonMixin({
					fetch({ fetcher }: any) {
						return of(fetcher.string);
					},
				}),
			],
			template: `<div></div>`,
		});
		const fetcher = {
			string: chance.string(),
			number: chance.integer(),
		};
		const { vm } = testCreateFetcherVm(Test, { fetcher });
		expect(vm.state).toBeDefined();
		expect(vm.state.loading).toBe(false);
		expect(vm.state.error).toBe(null);
		expect(vm.state.result).toBe(fetcher.string);

		vm.$destroy();
	});

	it("should provide with loading", async () => {
		const Test = Vue.extend({
			mixins: [
				FetcherCommonMixin({
					fetch({ fetcher, loader }: any) {
						return of(null).pipe(
							loader(),
							switchMap(() => NEVER)
						);
					},
				}),
			],
			template: `<div></div>`,
		});
		const { vm } = testCreateFetcherVm(Test);
		expect(vm.state).toBeDefined();
		expect(vm.state.loading).toBe(true);
		vm.$destroy();
	});

	it("should error", async () => {
		const error = new Error();
		const Test = Vue.extend({
			mixins: [
				FetcherCommonMixin({
					fetch() {
						return throwError(error);
					},
				}),
			],
			template: `<div></div>`,
		});
		const { vm } = testCreateFetcherVm(Test);

		expect(vm.state).toBeDefined();
		expect(vm.state.error).toBe(error);
		vm.$destroy();
	});

	it("should react", async () => {
		let counter = 0;
		const Test = Vue.extend({
			mixins: [
				FetcherCommonMixin({
					fetch({ fetcher }: any) {
						counter += 1;
						return of([]);
					},
				}),
			],
			template: `<div></div>`,
		});
		const { vm, wrapperVm } = testCreateFetcherVm(Test);
		wrapperVm.fetcher = { new: true };
		await wrapperVm.$nextTick();
		wrapperVm.fetcher.new = false;
		await wrapperVm.$nextTick();
		vm.$destroy();
		expect(counter).toBe(3);
	});

	describe("skip", () => {
		it("should skip", async () => {
			const data = chance.string();
			const Test = Vue.extend({
				mixins: [
					FetcherCommonMixin({
						skip: () => true,
						fetch() {
							return of(data);
						},
					}),
				],
				template: `<div></div>`,
			});
			const { vm } = testCreateFetcherVm(Test);
			expect(vm.state.data).toBeUndefined();
			vm.$destroy();
		});

		it("should force no-skip", async () => {
			const data = chance.string();
			const Test = Vue.extend({
				mixins: [
					FetcherCommonMixin({
						skip: false,
						fetch() {
							return of(data);
						},
					}),
				],
				template: `<div></div>`,
			});
			const { vm } = testCreateFetcherVm(Test);
			expect(vm.state.result).toBe(data);
			vm.$destroy();
		});
	});
});
