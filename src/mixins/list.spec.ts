import Vue from "vue";
import { Chance } from "chance";
import { testCreateFetcherVm } from "../test/fetcher";
import { createFetcherMixinListFactory } from "./list";
import { of, throwError } from "rxjs";

type FetcherTest = {
	items: string[];
};

describe("mixins#list", () => {
	const chance = new Chance();
	const FetcherMixinList = createFetcherMixinListFactory<FetcherTest>(Vue);

	it("should provide List", () => {
		const Test = Vue.extend({
			mixins: [
				FetcherMixinList({
					fetch({ fetcher }) {
						return of({ items: fetcher.items });
					},
				}),
			],
			template: `<div></div>`,
		});
		const fetcher: FetcherTest = {
			items: chance.n(chance.string, 5),
		};
		const { vm } = testCreateFetcherVm(Test, { fetcher });
		expect(vm.state).toBeDefined();
		expect(vm.state.loading).toBe(false);
		expect(vm.state.error).toBe(null);
		expect(vm.state.items).toBe(fetcher.items);

		vm.$destroy();
	});

	it("should skip fetcher when items prop are passed", () => {
		const randomPropItems = chance.word();
		const propItems = {
			items: null,
			[randomPropItems]: randomPropItems,
		};

		const items = chance.n(chance.string, 5);
		for (const [key, value] of Object.entries(propItems)) {
			const Test = Vue.extend({
				mixins: [
					FetcherMixinList({
						propItems: value,
						fetch() {
							return throwError(new Error());
						},
					}),
				],
				template: `<div></div>`,
			});
			const fetcher: FetcherTest = {
				items: chance.n(chance.string, 5),
			};
			const { vm } = testCreateFetcherVm(Test, {
				fetcher,
				props: { [key]: items },
			});
			expect(vm.state).toBeDefined();
			expect(vm.state.loading).toBe(false);
			expect(vm.state.error).toBe(null);
			expect(vm.state.items).toBe(items);
			vm.$destroy();
		}
	});
});
