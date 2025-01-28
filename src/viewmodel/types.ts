import type { BehaviorSubject, Observable, Subject } from 'rxjs';
import type {
	ClassProvider,
	FactoryProvider,
	InjectionToken,
	RegistrationOptions,
	TokenProvider,
	ValueProvider,
} from 'tsyringe';

import type { isLifecycleHandled, isMounted } from './utils/symbols';
import { MutableSubject } from './utils/subject';

export type Constructor<T = any> = new (...args: any[]) => T;

export type RegisterType<T = any> = {
	token: Constructor<T>;
	factory: ClassProvider<T>;
};

type Setters<T> = {
	[K in keyof T as T[K] extends never ? never : K extends string ? `set${Capitalize<K>}` : never]: T[K];
};

export type ValueUpdater<T = any> = (value: T) => T;

export type ConnectedProps<T> = {
	[key in keyof T]: T[key] extends Observable<infer R> ? R : T[key];
} & {
	setters: Setters<ConnectedObservableSetters<T>>;
};

export type ConnectedObservableSetters<T> = {
	[key in keyof T]: T[key] extends Subject<infer R>
		? (value: R) => void
		: T[key] extends MutableSubject<infer R>
		? (value: R) => void
		: never;
};

export type ClassInstances<T extends readonly Constructor[]> = {
	[K in keyof T]: T[K] extends new (...args: any) => infer R ? WithoutLifeCycles<R> : never;
};

export type Provider<T = any> =
	| ValueProvider<T>
	| ClassProvider<T>
	| FactoryProvider<T>
	| TokenProvider<T>
	| Constructor<T>;

export type Registration<T = any> = {
	token: InjectionToken<T>;
	provider: Provider<T>;
	options?: RegistrationOptions;
};

export type ProviderProps<P extends {}> = {
	provide: (Constructor | Registration | [InjectionToken, ClassProvider<any>['useClass']])[];
	props?: P;
};

export type MergedProps<T extends Constructor, P extends {} = {}> = P & ConnectedProps<InstanceType<T>>;

export type OnMount = {
	onMount(): void;
};

export type OnUnmount = {
	onUnmount(): void;
};

export type Connector<S extends Constructor> = (viewModelType: InstanceType<S>) => any;

export type Props<T extends {}> = {
	[key in keyof T]: ObservableProp<T[key]>;
};

export type WithoutLifeCycles<T> = Omit<T, 'onMount' | 'onUnmount'>;

export type ObservableProp<T> = Omit<BehaviorSubject<T>, 'next'>;

export type ServiceInstance = OnMount &
	OnUnmount & {
		[isMounted]: boolean;
		[isLifecycleHandled]: boolean;
	};

export type Dictionary<T = any> = {
	[key: string]: T;
};

export type ObservableValues<T extends Dictionary> = {
	[key in keyof T]: T[key] extends Observable<infer R> ? R : T[key];
};
