import { QueryClient, QueryKey, QueryObserver } from '@tanstack/react-query';
import { effect, effectScope, shallowReactive } from '@vue/reactivity';

export const effectDisposer = Symbol('EffectDisposer');

type QueryData<T extends QueryKey, R> = {
	key: string;
	query(...params: T): Promise<R>;
};

type QueryState<R> = {
	data: R | undefined;
	status: 'success' | 'error' | 'pending' | null;
	error: Error | null;
	isLoading: boolean;
	isError: boolean;
	isSuccess: boolean;
};

type EffectDisposer = {
	[effectDisposer]: undefined | (() => void);
};

let client: QueryClient;

export function setQueryClient(queryClient: QueryClient) {
	client = queryClient;
}

export function createQuery<T extends QueryKey, R = any>({ key, query }: QueryData<T, R>) {
	return function (getKeys: () => T) {
		const state = shallowReactive<QueryState<R> & EffectDisposer>({
			data: undefined,
			status: null,
			error: null,
			isLoading: false,
			isError: false,
			isSuccess: false,
			[effectDisposer]: undefined,
		});

		setTimeout(() => {
			let observer: QueryObserver<R, Error, R, R, T>;

			const scope = effectScope();

			state[effectDisposer] = () => scope.stop();

			scope.run(() => {
				effect(() => {
					const queryKey = getKeys();

					const queryFn = () => query(...queryKey);

					observer = new QueryObserver(client, {
						queryKey: [key, ...queryKey] as any as T,
						queryFn,
					});

					observer.subscribe((result) => {
						state.data = result.data;
						state.status = result.status;
						state.error = result.error;
						state.isLoading = result.isLoading;
						state.isError = result.isError;
						state.isSuccess = result.isSuccess;
					});

					client.prefetchQuery({
						queryKey,
						queryFn,
					});
				});
			});
		});

		return state as Readonly<QueryState<R>>;
	};
}
