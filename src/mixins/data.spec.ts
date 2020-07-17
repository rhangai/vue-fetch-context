import Vue from "vue";
import { Chance } from "chance";
import { testCreateFetcherVm } from "../test/fetcher";
import { createFetcherMixinDataFactory } from "./data";
import { of, NEVER, throwError } from "rxjs";
import { switchMap } from "rxjs/operators";

describe("mixins#data", () => {
	const chance = new Chance();
	const FetcherMixinData = createFetcherMixinDataFactory(Vue);
	it("should provide", () => {
		const Test = Vue.extend({
			mixins: [
				FetcherMixinData({
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
		const vm = testCreateFetcherVm(Test, fetcher);
		expect(vm.state).toBeDefined();
		expect(vm.state.loading).toBe(false);
		expect(vm.state.error).toBe(null);
		expect(vm.state.data).toBe(fetcher.string);

		vm.$destroy();
	});

	it("should provide with loading", async () => {
		const Test = Vue.extend({
			mixins: [
				FetcherMixinData({
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
		const vm = testCreateFetcherVm(Test);
		expect(vm.state).toBeDefined();
		expect(vm.state.loading).toBe(true);
		vm.$destroy();
	});

	it("should error", async () => {
		const error = new Error();
		const Test = Vue.extend({
			mixins: [
				FetcherMixinData({
					fetch() {
						return throwError(error);
					},
				}),
			],
			template: `<div></div>`,
		});
		const vm = testCreateFetcherVm(Test);
		expect(vm.state).toBeDefined();
		expect(vm.state.error).toBe(error);
		vm.$destroy();
	});

	describe("skip", () => {
		it("should skip", async () => {
			const data = chance.string();
			const Test = Vue.extend({
				mixins: [
					FetcherMixinData({
						skip: () => true,
						fetch() {
							return of(data);
						},
					}),
				],
				template: `<div></div>`,
			});
			const vm = testCreateFetcherVm(Test);
			expect(vm.state.data).toBeUndefined();
			vm.$destroy();
		});

		it("should force no-skip", async () => {
			const data = chance.string();
			const Test = Vue.extend({
				mixins: [
					FetcherMixinData({
						skip: false,
						fetch() {
							return of(data);
						},
					}),
				],
				template: `<div></div>`,
			});
			const vm = testCreateFetcherVm(Test);
			expect(vm.state.data).toBe(data);
			vm.$destroy();
		});
	});
});
