import { VueCreateElement, VueComponentOptions } from "../types";
import { FETCH_CONTEXT_PROVIDE } from "../constants";
import { VueConstructor } from "vue/types/umd";
import { watch } from "../util/watch";
import { Observable, BehaviorSubject, ReplaySubject, Subscription } from "rxjs";

/**
 * The fetcher context. This is what is provided by the <fetch-context> component
 */
export interface IFetchContext<IFetcher> {
	readonly fetcher: IFetcher;
	readonly fetcher$: Observable<IFetcher>;
}

/**
 * The context component
 */
export interface IFetchContextComponent<IFetcher> extends Vue {
	/**
	 * Parent fetcher, if any
	 */
	parentFetchContext?: IFetchContext<IFetcher>;
	/**
	 * The prop for the fetcher
	 */
	fetcher: IFetcher;
	/**
	 * Current fetcher value observable
	 */
	fetcherValue$: ReplaySubject<IFetcher>;
	/**
	 * Fetcher observable
	 */
	readonly fetcherValue: IFetcher;
	/**
	 * Subscription
	 */
	fetcherSubscription: Subscription;
	/**
	 * Refresh the contex
	 */
	refresh(): void;
}

/**
 * Create the context component
 */
export function createFetchContextComponent<IFetcher>(vue: VueConstructor) {
	return vue.extend({
		name: "FetchContext",
		inject: {
			parentFetchContext: {
				from: FETCH_CONTEXT_PROVIDE,
				default: null,
			},
		},
		provide(this: IFetchContextComponent<IFetcher>) {
			const self = this;
			const fetchContext: IFetchContext<IFetcher> = {
				get fetcher() {
					return self.fetcherValue;
				},
				get fetcher$() {
					return self.fetcherValue$;
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
			fetcherValue(this: IFetchContextComponent<IFetcher>) {
				const parentFetcher = this.parentFetchContext?.fetcher;
				return {
					...parentFetcher,
					...this.fetcher,
				};
			},
		},
		created(this: IFetchContextComponent<IFetcher>) {
			this.fetcherValue$ = new ReplaySubject<IFetcher>(1);
			const fetcherValue$ = watch<IFetcher>(this, "fetcherValue");
			this.fetcherSubscription = fetcherValue$.subscribe(this.fetcherValue$);
		},
		beforeDestroy(this: IFetchContextComponent<IFetcher>) {
			this.fetcherValue$.complete();
			this.fetcherSubscription!.unsubscribe();
		},
		methods: {
			refresh(this: IFetchContextComponent<IFetcher>) {
				this.fetcherValue$.next(this.fetcherValue);
			},
		},
		render(
			this: IFetchContextComponent<IFetcher>,
			createElement: VueCreateElement
		) {
			return createElement("div", {}, this.$slots.default);
		},
	});
}
