import {
	Observable,
	of,
	ObservableInput,
	from,
	NEVER,
	Operator,
	empty,
	OperatorFunction,
} from "rxjs";
import { switchMap, switchMapTo, tap, catchError } from "rxjs/operators";

export type ResultHandler<R> = {
	next(value: R): void;
	error(err: any): void;
};

export type ResultOperator<R> = {
	(): OperatorFunction<R, never>;
	<T>(callback?: (value: T) => ObservableInput<R>): OperatorFunction<T, never>;
};

export function result<R>(handler: ResultHandler<R>): ResultOperator<R> {
	return function <T>(callback?: (value: T) => ObservableInput<R>) {
		return switchMap<T, Observable<never>>((value) => {
			if (!callback) {
				handler.next(value as any);
				return empty();
			}
			return from(callback(value)).pipe(
				tap((result) => {
					handler.next(result);
				}),
				catchError((error) => {
					handler.error(error);
					return of(null);
				}),
				switchMapTo(empty())
			);
		});
	};
}
