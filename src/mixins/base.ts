import { VueConstructor, VueComponentOptions } from "../types";
import { FETCH_CONTEXT_PROVIDE } from "../constants";
import {} from "vue/types/umd";

export interface FetcherMixinBase<IFetcher> extends Vue {
	fetchContext: IFetcher;
}

export type FetcherMixinBaseConstructor<IFetcher> = VueConstructor<
	FetcherMixinBase<IFetcher>
>;

export type FetcherMixinBaseFactory<
	IFetcher
> = () => FetcherMixinBaseConstructor<IFetcher>;

export function createFetcherMixinBaseFactory<IFetcher>(
	vue: VueConstructor
): FetcherMixinBaseFactory<IFetcher> {
	const mixin: FetcherMixinBaseConstructor<IFetcher> = vue.extend({
		inject: {
			fetchContext: {
				from: FETCH_CONTEXT_PROVIDE,
			},
		},
	});
	return () => mixin;
}
