import Vue from "vue";
import { mount } from "@vue/test-utils";
import { createFetchContextComponent } from "../components/context";
import { VueConstructor } from "vue/types/umd";

const FetchContext = createFetchContextComponent(Vue);

type TestCreateFetcherVmOptions = {
	fetcher?: any;
	props?: Record<string, unknown>;
};

export function testCreateFetcherVm(
	component: VueConstructor,
	options: TestCreateFetcherVmOptions = {}
): { vm: any; wrapperVm: any; destroy(): void } {
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
	return {
		vm: testVm,
		wrapperVm: wrapper.vm,
		destroy: () => wrapper.destroy(),
	};
}
