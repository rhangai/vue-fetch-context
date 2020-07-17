import Vue from "vue";
import { createFetchContextComponent } from "./context";
import { mount } from "@vue/test-utils";
import { FETCH_CONTEXT_PROVIDE } from "../constants";
import { Chance } from "chance";

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

	it("should provide", () => {
		const fetcher = {
			string: chance.string(),
			number: chance.integer(),
		};
		const wrapper = mount({
			components: {
				FetchContext,
				Test,
			},
			data: () => ({
				fetcher,
			}),
			template: `
				<fetch-context :fetcher="fetcher">
					<test ref="test" />
				</fetch-context>
			`,
		});

		const testVm: any = wrapper.vm.$refs.test;
		expect(testVm).toBeDefined();
		expect(testVm.fetchContext).toBeDefined();
		expect(testVm.fetchContext.fetcher).toEqual(fetcher);
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

	it("should be reactive", async () => {
		const fetcher = {
			string: chance.string(),
			number: chance.integer(),
		};
		const wrapper = mount({
			components: {
				FetchContext,
				Test,
			},
			data: () => ({
				fetcher,
			}),
			template: `
				<fetch-context :fetcher="fetcher">
					<test ref="test" />
				</fetch-context>
			`,
		});

		const testVm: any = wrapper.vm.$refs.test;
		expect(testVm).toBeDefined();
		expect(testVm.fetchContext).toBeDefined();
		expect(testVm.fetchContext.fetcher).toEqual(fetcher);

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
