import { VueCreateElement, VueComponentOptions } from "../types";
import { FETCH_CONTEXT_PROVIDE } from "../constants";
import { VueConstructor } from "vue/types/umd";
import { watch } from "../util/watch";
import { Observable, BehaviorSubject, ReplaySubject, Subscription } from "rxjs";

/**
 * The fetcher context. This is what is provided by the <fetch-context> component
 */
interface IFetchContext<IFetcher> {
	readonly fetcher: IFetcher;
	readonly fetcher$: Observable<IFetcher>;
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
	 * Fetcher observable
	 */
	fetcherSubscription: Subscription;
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
		provide(this: FetchContextComponent<IFetcher>) {
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
			fetcherValue(this: FetchContextComponent<IFetcher>) {
				const parentFetcher = this.parentFetchContext?.fetcher;
				return {
					...parentFetcher,
					...this.fetcher,
				};
			},
		},
		created(this: FetchContextComponent<IFetcher>) {
			this.fetcherValue$ = new ReplaySubject<IFetcher>(1);
			const fetcherValue$ = watch<IFetcher>(this, "fetcherValue");
			this.fetcherSubscription = fetcherValue$.subscribe(this.fetcherValue$);
		},
		beforeDestroy(this: FetchContextComponent<IFetcher>) {
			this.fetcherValue$.complete();
			this.fetcherSubscription!.unsubscribe();
		},
		methods: {
			refresh(this: FetchContextComponent<IFetcher>) {
				this.fetcherValue$.next(this.fetcherValue);
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
