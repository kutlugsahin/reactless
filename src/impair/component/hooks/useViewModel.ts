import { Constructor } from '../../types';
import { useRegisteredContainer } from '../../container/useRegisteredContainer';

export function useViewModel<T extends Constructor, P extends object>(viewModel: T, props?: P): InstanceType<T> {
	const container = useRegisteredContainer(props, [viewModel]);
	return container.resolve<InstanceType<T>>(viewModel);
}
