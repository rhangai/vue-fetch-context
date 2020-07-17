import { Observable } from "rxjs";
import { WatchOptions } from "vue";

export function watch<T = unknown>(
	vm: Vue,
	prop: string | Function,
	options?: WatchOptions
): Observable<T> {
	const obs$ = new Observable<T>(function (observer) {
		const unwatch = vm.$watch(
			prop as any,
			function (value) {
				observer.next(value);
			},
			{ immediate: true, ...options }
		);
		return unwatch;
	});
	return obs$;
}
