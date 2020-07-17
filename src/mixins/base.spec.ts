import Vue from "vue";
import { Chance } from "chance";
import { testCreateFetcherVm } from "../test/fetcher";
import { createFetcherMixinBaseFactory } from "./base";
import { skip } from "rxjs/operators";

describe("mixins#base", () => {
	const chance = new Chance();
	const FetcherMixin = createFetcherMixinBaseFactory(Vue);
	it("should provide", () => {
		const Test = Vue.extend({
			mixins: [FetcherMixin()],
			template: `<div></div>`,
		});
		const fetcher = {
			string: chance.string(),
			number: chance.integer(),
		};
		testCreateFetcherVm(Test, { fetcher });
	});
});
