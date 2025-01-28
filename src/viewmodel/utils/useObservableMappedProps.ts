import { useEffect, useMemo } from 'react';
import { BehaviorSubject } from 'rxjs';

export function useMappedObservableProps<P extends object>(props: P) {
	const { mappedProps, next } = useMemo(() => {
		const mappedProps = Object.fromEntries(
			Object.entries(props).map(([key, value]) => [key, new BehaviorSubject(value)])
		);

		return {
			next(nextProps: P) {
				Object.keys(nextProps).forEach((key) => {
					const value = mappedProps[key].value;
					const nextValue = (nextProps as any)[key];

					if (value !== nextValue) {
						mappedProps[key].next(nextValue);
					}
				});
			},
			mappedProps,
		};
	}, []);

	useEffect(() => {
		if (props) {
			next(props);
		}
	}, [next, props]);

	return mappedProps;
}
