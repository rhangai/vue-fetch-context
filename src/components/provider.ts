import { VueCreateElement, VueComponentOptions } from "../types";
import { FETCHER_PROVIDE } from "../constants";
import { VueConstructor } from "vue/types/umd";

/**
 * The fetcher provider. This is what is provided by the <fetcher-provider> component
 */
interface IFetcherProvider<IFetcher> {
	readonly fetcher: IFetcher;
}

/**
 * The provider component
 */
interface FetcherProviderComponent<IFetcher> extends Vue {
	/**
	 * Parent fetcher, if any
	 */
	parentFetcherProvider?: IFetcherProvider<IFetcher>;
	/**
	 * The current fetcher.
	 */
	fetcher: IFetcher;
}

/**
 * Create the provider
 */
export function createFetcherProvider<IFetcher>(vue: VueConstructor) {
	return vue.extend({
		name: "FetcherProvider",
		inject: {
			parentFetcherProvider: {
				from: FETCHER_PROVIDE,
				default: null,
			},
		},
		provide() {
			const self: any = this;
			const fetcherProvider: IFetcherProvider<IFetcher> = {
				get fetcher() {
					return self.fetcherValue;
				},
			};
			return { [FETCHER_PROVIDE]: fetcherProvider };
		},
		props: {
			fetcher: {
				type: Object,
				default: null,
			},
		},
		computed: {
			fetcherValue(this: FetcherProviderComponent<IFetcher>) {
				const parentFetcher = this.parentFetcherProvider?.fetcher;
				return {
					...parentFetcher,
					...this.fetcher,
				};
			},
		},
		render(
			this: FetcherProviderComponent<IFetcher>,
			createElement: VueCreateElement
		) {
			return createElement("div", {}, this.$slots.default);
		},
	});
}
