import { useEffect, useState } from 'react';
import {
	asapScheduler,
	BehaviorSubject,
	combineLatest,
	debounceTime,
	distinctUntilChanged,
	isObservable,
	map,
	Observable,
	Subject,
	Subscription,
} from 'rxjs';

import { ConnectedProps, Dictionary } from '../types';
import { getAllPropertiesAndMethods } from './object';

export function emitOnceIfNoValue<T>(source: Observable<T>): Observable<T> {
	const result = new BehaviorSubject<T>(undefined!);
	source.subscribe(result);
	return result;
}

function defineSetterMethod(object: Dictionary, key: string, observable: Observable<any>) {
	if (observable instanceof Subject) {
		object[`set${key.charAt(0).toUpperCase()}${key.slice(1)}`] = (value: any) => {
			observable.next(value);
		};
	}
}

function getConnectedProps<T extends object>(service: T) {
	const props = getAllPropertiesAndMethods(service);

	const mappings = props.map((key) => [key, (service as any)[key]] as [string, any]);

	const observables = mappings.filter(([_key, value]) => isObservable(value)) as [string, Observable<any>][];
	const nonObservables = mappings.filter((p) => !observables.includes(p));

	return {
		observables,
		nonObservables,
	};
}

export function useConnectedProps<T extends object>(service: T) {
	const [connectedProps, setConnectedProps] = useState<ConnectedProps<T>>(() => {
		const { nonObservables, observables } = getConnectedProps(service);

		const result: any = {
			setters: {},
			...Object.fromEntries(nonObservables),
		};

		const subscriptions: Subscription[] = [];

		observables.forEach(([key, observable]) => {
			defineSetterMethod(result.setters, key, observable);

			const subs = observable.subscribe((value) => {
				(result as any)[key] = value;
			});

			subscriptions.push(subs);
		});

		subscriptions.forEach((subs) => subs.unsubscribe());

		return result;
	});

	useEffect(() => {
		const { nonObservables, observables } = getConnectedProps(service);

		if (observables.length) {
			const subs = combineLatest(
				observables.map(([key, observable]) =>
					observable.pipe(
						distinctUntilChanged(),
						emitOnceIfNoValue,
						map((value) => [key, value])
					)
				)
			)
				.pipe(debounceTime(0, asapScheduler))
				.subscribe((results) => {
					setConnectedProps((props) => ({
						...props,
						...Object.fromEntries(nonObservables),
						...Object.fromEntries(results),
						setters: props.setters,
					}));
				});

			return () => {
				subs.unsubscribe();
			};
		} else {
			setConnectedProps((props) => ({
				...props,
				...(Object.fromEntries(nonObservables) as ConnectedProps<T>),
			}));
		}
	}, [service]);

	return connectedProps;
}
