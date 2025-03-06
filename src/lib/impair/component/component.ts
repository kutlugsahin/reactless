import { effect, ReactiveEffectRunner, stop } from '@vue/reactivity';
import { createElement, FC, memo, MutableRefObject, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { DependencyContainer } from 'tsyringe';
import { setCurrentComponentContainerRef, useViewModel } from './hooks/useViewModel';
import { Context } from '../context/context';
import { Constructor } from '@impair/types';

function useForceUpdate() {
	const [_, setVal] = useState({});

	return useCallback(() => {
		setVal({});
	}, []);
}

function useStopRunner(runnerRef: MutableRefObject<ReactiveEffectRunner | undefined>) {
	useEffect(() => {
		return () => {
			stop(runnerRef.current!);
			runnerRef.current = undefined;
		};
	}, []);
}

function debounceMicrotask(fn: Function) {
	let called = false;

	return () => {
		if (!called) {
			called = true;
			queueMicrotask(() => {
				called = false;
				fn();
			});
		}
	};
}

export function component<P>(component: FC<P>) {
	return memo((props: P) => {
		const forceUpdate = useForceUpdate();
		const renderResult = useRef<ReactNode>();
		const runner = useRef<ReactiveEffectRunner>();
		const propsRef = useRef<P>(props);
		const isDirty = useRef(false);
		const componentContainer = useRef<DependencyContainer>();

		propsRef.current = props;
		isDirty.current = false;

		if (!runner.current) {
			const render = debounceMicrotask(() => {
				if (isDirty.current) {
					forceUpdate();
				}
			});

			runner.current = effect(
				() => {
					setCurrentComponentContainerRef(componentContainer);
					renderResult.current = component(propsRef.current);
				},
				{
					scheduler() {
						isDirty.current = true;
						render();
					},
				}
			);
		} else {
			runner.current?.();
		}

		useStopRunner(runner);

		if (componentContainer.current) {
			return createElement(Context.Provider, { value: componentContainer.current }, renderResult.current);
		}

		return renderResult.current;
	});
}

export interface RendererViewModel {
	render(): ReactNode;
}

export function componentWithViewModel(viewModel: Constructor<RendererViewModel>) {
	return component(() => {
		const { render } = useViewModel(viewModel);
		return render();
	});
}
