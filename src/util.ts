import { Observable } from "rxjs";
import { map, distinctUntilChanged } from "rxjs/operators";

export function watch<T = unknown>(
	vm: Vue,
	prop: string | Function
): Observable<T> {
	return vm.$watchAsObservable(prop as any, { immediate: true }).pipe(
		map(({ newValue }) => newValue),
		distinctUntilChanged()
	);
}
