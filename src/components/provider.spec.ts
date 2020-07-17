import Vue from "vue";
import { createFetcherProvider } from "./provider";
import { mount } from "@vue/test-utils";
import { FETCHER_PROVIDE } from "../constants";
import { Chance } from "chance";

describe("provider", () => {
	const FetcherProvider = createFetcherProvider(Vue);
	const chance = new Chance();

	it("should be a component", () => {
		const wrapper = mount(FetcherProvider);
		expect(wrapper.vm.fetcherValue).toBeDefined();
	});

	it("should provide", () => {
		const Test = Vue.extend({
			inject: {
				fetcherProvider: FETCHER_PROVIDE,
			},
			template: `<div></div>`,
		});

		const fetcher = {
			string: chance.string(),
			number: chance.integer(),
		};
		const wrapper = mount({
			components: {
				FetcherProvider,
				Test,
			},
			data: () => ({
				fetcher,
			}),
			template: `
				<fetcher-provider :fetcher="fetcher">
					<test ref="test" />
				</fetcher-provider>
			`,
		});

		const testVm: any = wrapper.vm.$refs.test;
		expect(testVm).toBeDefined();
		expect(testVm.fetcherProvider).toBeDefined();
		expect(testVm.fetcherProvider.fetcher).toEqual(fetcher);
	});

	it("should inherit providers", () => {
		const Test = Vue.extend({
			inject: {
				fetcherProvider: FETCHER_PROVIDE,
			},
			template: `<div></div>`,
		});

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
				FetcherProvider,
				Test,
			},
			data: () => ({
				parentFetcher,
				childFetcher,
			}),
			template: `
				<fetcher-provider :fetcher="parentFetcher">
					<test ref="testParent" />
					<fetcher-provider :fetcher="childFetcher">
						<test ref="testChild" />
					</fetcher-provider>
				</fetcher-provider>
			`,
		});

		const testParentVm: any = wrapper.vm.$refs.testParent;
		const testChildVm: any = wrapper.vm.$refs.testChild;

		expect(testParentVm?.fetcherProvider).toBeDefined();
		expect(testParentVm.fetcherProvider.fetcher).toEqual(parentFetcher);

		expect(testChildVm?.fetcherProvider).toBeDefined();
		expect(testChildVm.fetcherProvider.fetcher).toEqual({
			...parentFetcher,
			...childFetcher,
		});
	});
});
