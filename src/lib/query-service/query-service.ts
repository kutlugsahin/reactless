import { state } from '@impair';
import { QueryClient, QueryKey, QueryObserver } from '@tanstack/react-query';
import { effect, EffectScope, effectScope } from '@vue/reactivity';
import { inject, type InjectionToken } from 'tsyringe';

const queryClientSymbol = Symbol('QueryClient');
export const QueryClientService: InjectionToken = queryClientSymbol;

export abstract class QueryService<T extends QueryKey = any, R = any> {
	protected abstract readonly key: string;

	@state
	public data: R | undefined;

	@state
	public status: 'success' | 'error' | 'pending' | null = null;

	@state
	public error: Error | null = null;

	@state
	public isLoading: boolean = false;

	@state
	public isError: boolean = false;

	@state
	public isSuccess: boolean = false;

	private observer!: QueryObserver<R, Error, R, R, T>;

	private scope!: EffectScope;

	constructor(protected readonly queryClient: QueryClient) {}

	public queryKey(getKeys: () => T) {
		if (this.scope) {
			this.scope.stop();
		}

		if (this.observer) {
			this.observer.destroy();
		}

		this.scope = effectScope();

		this.scope.run(() => {
			effect(() => {
				const queryKey = getKeys();

				const queryFn = () => this.queryFunction(...queryKey);

				this.observer = new QueryObserver(this.queryClient, {
					queryKey: [this.key, ...queryKey] as any as T,
					queryFn,
				});

				this.observer.subscribe((result) => {
					this.data = result.data;
					this.status = result.status;
					this.error = result.error;
					this.isLoading = result.isLoading;
					this.isError = result.isError;
					this.isSuccess = result.isSuccess;
				});

				this.queryClient.prefetchQuery({
					queryKey,
					queryFn,
				});
			});
		});
	}

	protected abstract queryFunction(...params: T): Promise<R>;

	onMounted() {
		this.observer?.refetch();
	}
}
