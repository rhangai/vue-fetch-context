import Vue from "vue";
import { mount } from "@vue/test-utils";
import { createFetcherProvider } from "../components/provider";

const FetcherProvider = createFetcherProvider(Vue);

export function testCreateFetcherVm(component: any, fetcher: any = {}): any {
	const wrapper = mount({
		components: {
			FetcherProvider,
			Test: component,
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
	return testVm;
}
