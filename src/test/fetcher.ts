import Vue from "vue";
import { mount } from "@vue/test-utils";
import { createFetcherProvider } from "../components/provider";
import { VueConstructor } from "vue/types/umd";

const FetcherProvider = createFetcherProvider(Vue);

type TestCreateFetcherVmOptions = {
	fetcher?: any;
	props?: Record<string, unknown>;
};

export function testCreateFetcherVm(
	component: VueConstructor,
	options: TestCreateFetcherVmOptions = {}
): any {
	const fetcher = options.fetcher ?? {};
	const wrapper = mount({
		components: {
			FetcherProvider,
			Test: component,
		},
		data: () => ({
			fetcher,
			props: options.props ?? {},
		}),
		template: `
				<fetcher-provider :fetcher="fetcher">
					<test ref="test" v-bind="props" />
				</fetcher-provider>
			`,
	});

	const testVm: any = wrapper.vm.$refs.test;
	expect(testVm).toBeDefined();
	expect(testVm.fetcherProvider).toBeDefined();
	expect(testVm.fetcherProvider.fetcher).toEqual(fetcher);
	return testVm;
}
