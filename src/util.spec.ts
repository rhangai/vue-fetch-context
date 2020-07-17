import { watch } from "./util";
import Vue from "vue";
import { tap, take, skip } from "rxjs/operators";
import { Observable } from "rxjs";
import { Chance } from "chance";

describe("util", () => {
	describe("watch", () => {
		const chance = new Chance();

		const randomValue = () => {
			const fn: any = chance.pickone([
				chance.string,
				chance.integer,
				chance.bool,
			]);
			return fn.call(chance);
		};

		it("should create an observable", async () => {
			const vm = new Vue({});
			const watcher$ = watch(vm, "value");
			expect(watcher$).toBeInstanceOf(Observable);
		});

		it("should emit initial value", async () => {
			const initialValue = randomValue();
			const vm = new Vue({
				data: () => ({
					value: initialValue,
				}),
			});
			const watcher$ = watch(vm, "value");
			const value = await watcher$.pipe(take(1)).toPromise();
			expect(value).toBe(initialValue);
		});

		it("should emit values", async () => {
			const vm = new Vue({
				data: () => ({
					value: null,
				}),
			});
			const watcher$ = watch(vm, "value", { immediate: false });
			const testWatch = async (value: any) => {
				vm.value = null;
				const valuePromise = watcher$.pipe(take(1)).toPromise();
				vm.$nextTick(() => (vm.value = value));
				const result = await valuePromise;
				expect(result).toBe(value);
			};
			const values = chance.n(randomValue, 10);
			for (const value of values) {
				await testWatch(value);
			}
		});
	});
});
