import type { PropsWithChildren } from 'react';

import { Context } from '../context/context';
import type { ProviderProps } from '../types';
import { useRegisteredContainer } from '../container/useRegisteredContainer';

export function ServiceProvider<P extends {}>({
	provide,
	children,
	props = {} as P,
}: PropsWithChildren<ProviderProps<P>>) {
	const container = useRegisteredContainer(props, provide);
	return <Context.Provider value={container}>{children}</Context.Provider>;
}
