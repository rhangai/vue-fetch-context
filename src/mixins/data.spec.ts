import Vue from "vue";
import { Chance } from "chance";
import { testCreateFetcherVm } from "../test/fetcher";
import { createFetcherMixinDataFactory, FetcherMixinDataFactory } from "./data";
import { of, NEVER, throwError } from "rxjs";
import { switchMap } from "rxjs/operators";

describe("mixins#data", () => {
	const chance = new Chance();
	const FetcherMixinData = createFetcherMixinDataFactory(Vue);
	it("should provide data", () => {
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
		const vm = testCreateFetcherVm(Test, { fetcher });
		expect(vm.state).toBeDefined();
		expect(vm.state.loading).toBe(false);
		expect(vm.state.error).toBe(null);
		expect(vm.state.data).toBe(fetcher.string);

		vm.$destroy();
	});
});
