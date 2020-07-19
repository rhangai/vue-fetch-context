import {
	Observable,
	ObservableInput,
	from,
	empty,
	OperatorFunction,
} from "rxjs";
import { switchMap, catchError } from "rxjs/operators";

export type ResultHandler<R> = {
	next(value: R): void;
	error(err: any): void;
};

export type ResultSubject<R> = {
	value(value: any): Observable<never>;

	operator(): OperatorFunction<R, never>;
	operator<T>(
		callback?: (value: T) => ObservableInput<R>
	): OperatorFunction<T, never>;

	catch<T = unknown>(): OperatorFunction<T, T>;
};

export function createResultSubject<R>(
	handler: ResultHandler<R>
): ResultSubject<R> {
	return {
		value(value: any) {
			handler.next(value as any);
			return empty();
		},
		operator: function <T>(callback?: (value: T) => ObservableInput<R>) {
			return switchMap<T, Observable<never>>((value) => {
				if (!callback) {
					handler.next(value as any);
					return empty();
				}
				return from(callback(value)).pipe(
					switchMap((result) => {
						handler.next(result);
						return empty();
					}),
					catchError((error) => {
						handler.error(error);
						return empty();
					})
				);
			});
		},
		catch: function <T>() {
			return catchError<T, Observable<T>>((error) => {
				handler.error(error);
				return empty();
			});
		},
	};
}
