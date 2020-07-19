import Vue from "vue";
import {
	createFetchContextComponent,
	IFetchContextComponent,
	IFetchContext,
} from "./context";
import { Wrapper, mount } from "@vue/test-utils";
import { FETCH_CONTEXT_PROVIDE } from "../constants";
import { Chance } from "chance";

interface TestComponent extends Vue {
	fetchContext: IFetchContext<any>;
}

describe("components#FetchContext", () => {
	const FetchContext = createFetchContextComponent(Vue);
	const chance = new Chance();
	const Test = Vue.extend({
		inject: {
			fetchContext: FETCH_CONTEXT_PROVIDE,
		},
		template: `<div></div>`,
	});

	it("should be a component", () => {
		const wrapper = mount(FetchContext);
		expect(wrapper.vm.fetcherValue).toBeDefined();
	});

	describe("component", () => {
		const fetcher = {
			string: chance.string(),
			number: chance.integer(),
		};

		let wrapper: Wrapper<Vue>;
		let fetchContextVm: IFetchContextComponent<any>;
		let testVm: TestComponent;
		beforeEach(() => {
			wrapper = mount({
				components: {
					FetchContext,
					Test,
				},
				data: () => ({
					fetcher: { ...fetcher },
				}),
				template: `
				<fetch-context :fetcher="fetcher" ref="fetchContext">
					<test ref="test" />
				</fetch-context>
			`,
			});

			fetchContextVm = wrapper.vm.$refs.fetchContext as any;
			testVm = wrapper.vm.$refs.test as any;
		});

		afterEach(() => {
			fetchContextVm = null as any;
			testVm = null as any;
			wrapper.destroy();
		});

		it("should provide the fetcher", function () {
			expect(testVm).toBeDefined();
			expect(testVm.fetchContext).toBeDefined();
			expect(testVm.fetchContext.fetcher).toEqual(fetcher);
		});

		it("should refresh", function () {
			const handler = jest.fn();
			const subscription = testVm.fetchContext.fetcher$.subscribe(handler);
			fetchContextVm.refresh();
			subscription.unsubscribe();
			expect(handler).toHaveBeenCalledTimes(2);
		});

		it("should be reactive", async () => {
			const newFetcher = {
				string: chance.string(),
				number: chance.integer(),
			};
			// @ts-ignore
			wrapper.vm.fetcher = newFetcher;
			await wrapper.vm.$nextTick();
			expect(testVm.fetchContext.fetcher).toEqual(newFetcher);
		});
	});

	it("should inherit providers", () => {
		const parentFetcher = {
			common: chance.integer(),
			string: chance.string(),
			number: chance.integer(),
		};
		const childFetcher = {
			common: chance.integer(),
			childString: chance.string(),
			childNumber: chance.integer(),
		};
		const wrapper = mount({
			components: {
				FetchContext,
				Test,
			},
			data: () => ({
				parentFetcher,
				childFetcher,
			}),
			template: `
				<fetch-context :fetcher="parentFetcher">
					<test ref="testParent" />
					<fetch-context :fetcher="childFetcher">
						<test ref="testChild" />
					</fetch-context>
				</fetch-context>
			`,
		});

		const testParentVm: any = wrapper.vm.$refs.testParent;
		const testChildVm: any = wrapper.vm.$refs.testChild;

		expect(testParentVm?.fetchContext).toBeDefined();
		expect(testParentVm.fetchContext.fetcher).toEqual(parentFetcher);

		expect(testChildVm?.fetchContext).toBeDefined();
		expect(testChildVm.fetchContext.fetcher).toEqual({
			...parentFetcher,
			...childFetcher,
		});
	});
});
