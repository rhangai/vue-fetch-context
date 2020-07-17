import { VueCreateElement, VueComponentOptions } from "../types";
import { FETCH_CONTEXT_PROVIDE } from "../constants";
import { VueConstructor } from "vue/types/umd";

/**
 * The fetcher context. This is what is provided by the <fetch-context> component
 */
interface IFetchContext<IFetcher> {
	readonly fetcher: IFetcher;
}

/**
 * The context component
 */
interface FetchContextComponent<IFetcher> extends Vue {
	/**
	 * Parent fetcher, if any
	 */
	parentFetchContext?: IFetchContext<IFetcher>;
	/**
	 * The current fetcher.
	 */
	fetcher: IFetcher;
}

/**
 * Create the context component
 */
export function createFetchContext<IFetcher>(vue: VueConstructor) {
	return vue.extend({
		name: "FetchContext",
		inject: {
			parentFetchContext: {
				from: FETCH_CONTEXT_PROVIDE,
				default: null,
			},
		},
		provide() {
			const self: any = this;
			const fetchContext: IFetchContext<IFetcher> = {
				get fetcher() {
					return self.fetcherValue;
				},
			};
			return { [FETCH_CONTEXT_PROVIDE]: fetchContext };
		},
		props: {
			fetcher: {
				type: Object,
				default: null,
			},
		},
		computed: {
			fetcherValue(this: FetchContextComponent<IFetcher>) {
				const parentFetcher = this.parentFetchContext?.fetcher;
				return {
					...parentFetcher,
					...this.fetcher,
				};
			},
		},
		render(
			this: FetchContextComponent<IFetcher>,
			createElement: VueCreateElement
		) {
			return createElement("div", {}, this.$slots.default);
		},
	});
}
