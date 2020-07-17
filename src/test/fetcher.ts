import Vue from "vue";
import { mount } from "@vue/test-utils";
import { createFetchContext } from "../components/context";
import { VueConstructor } from "vue/types/umd";

const FetchContext = createFetchContext(Vue);

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
			FetchContext,
			Test: component,
		},
		data: () => ({
			fetcher,
			props: options.props ?? {},
		}),
		template: `
				<fetch-context :fetcher="fetcher">
					<test ref="test" v-bind="props" />
				</fetch-context>
			`,
	});

	const testVm: any = wrapper.vm.$refs.test;
	expect(testVm).toBeDefined();
	expect(testVm.fetchContext).toBeDefined();
	expect(testVm.fetchContext.fetcher).toEqual(fetcher);
	return testVm;
}
