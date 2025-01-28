import type { Producer } from 'immer';
import { produce } from 'immer';
import { BehaviorSubject, Observable, Subject, take } from 'rxjs';

import type { Dictionary, ObservableProp, ObservableValues, ValueUpdater } from '../types';

export class MutableSubject<T> extends BehaviorSubject<T> implements ObservableProp<T> {
	constructor(value: T) {
		super(value);
	}

	public update(updater: Producer<T>) {
		this.next(produce(this.value, updater));
	}

	public next(value: T): void;
	public next(updater: ValueUpdater<T>): void;
	public next(valueOrUpdater: T | ValueUpdater<T>) {
		if (typeof valueOrUpdater === 'function') {
			super.next((valueOrUpdater as ValueUpdater<T>)(this.value));
		} else {
			super.next(valueOrUpdater);
		}
	}
}

export function state<T>(): MutableSubject<T>;
export function state<T>(defaultValue: T): MutableSubject<T>;
export function state<T>(defaultValue?: T) {
	return new MutableSubject(defaultValue);
}

export function toValues<T extends Dictionary>(object: T): ObservableValues<T> {
	return Object.keys(object).reduce((acc, key: keyof T) => {
		const value = object[key] as any;

		if (value instanceof BehaviorSubject) {
			acc[key] = value.value;
		} else if (value instanceof Observable) {
			value.pipe(take(1)).subscribe((v) => {
				acc[key] = v;
			});
		} else {
			acc[key] = value;
		}

		return acc;
	}, {} as ObservableValues<T>);
}

export function setValues<T extends Dictionary>(object: T, values: Partial<ObservableValues<T>>) {
	Object.keys(values).forEach((key: keyof T) => {
		const source = object[key] as any;
		const value = values[key] as any;

		if (source instanceof Subject) {
			source.next(value);
		} else {
			object[key] = value;
		}
	});
}
