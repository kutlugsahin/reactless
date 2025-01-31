import { useViewModel } from '../../viewmodel';
import { CounterViewModel } from './viewmodel';

export type CounterProps = {
	id: number;
};

export function Counter(props: CounterProps) {
	const {
		count,
		mainCount,
		inc,
		setters: { setCount },
	} = useViewModel(CounterViewModel, props);

	return (
		<div>
			<button onClick={inc}>
				{count} {mainCount}
			</button>
			<button onClick={() => setCount(count + 2)}>+</button>
		</div>
	);
}
