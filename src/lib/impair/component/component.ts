import { effect, ReactiveEffectRunner, stop } from '@vue/reactivity';
import { FC, memo, MutableRefObject, ReactNode, useCallback, useEffect, useRef, useState } from 'react';

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
			fn();
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

		return renderResult.current;
	});
}
