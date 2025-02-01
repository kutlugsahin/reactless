import { useService } from '@impair';
import { State } from './App2';

export function MyComp() {
	const { value } = useService(State);

	return <div>{value}</div>;
}

function MyComp2() {
	const { value } = useService(State);

	return <div>{value}</div>;
}
