import { inject, injectable } from 'tsyringe';

import { useState } from 'react';
import { component, derived, ServiceProvider, state, trigger, useService, useViewModel } from './impair';

@injectable()
class Data {
	@state
	data = 0;
}

//adsasdsa
@injectable()
class SuperData extends Data {
	@state
	user = {
		name: 'kutlu',
		age: 39,
	};
}

@injectable()
class State {
	@state
	public value = 3;

	constructor(@inject(SuperData) public data: SuperData) {
		console.log('dataaa', data.data);
	}

	@derived
	get double() {
		return this.value * 2;
	}

	@trigger
	printData() {
		console.log('data', this.data.data);
	}

	@trigger
	printDouble() {
		console.log('trigger:', this.double);
	}

	inc() {
		this.value++;
		this.data.data++;
		this.data.user.age++;
	}
}

export function App2() {
	const [x, setX] = useState(0);

	return (
		<ServiceProvider provide={[State, SuperData]}>
			<Comp x={x} />
			<Com2 />
			<button onClick={() => setX(x + 1)}>XX</button>
		</ServiceProvider>
	);
}

const Comp = component<{ x: number }>(({ x }) => {
	const { value, inc } = useService(State);

	return (
		<button onClick={inc}>
			{value} : {x}
		</button>
	);
});

@injectable()
class ViewModel {
	@state
	count = 7;

	@state
	name = '';

	constructor(@inject(SuperData) public dataService: SuperData) {}

	onMount() {
		setInterval(() => {
			this.count++;
		}, 500);
	}

	inc() {
		this.count++;
	}

	updateName(name: string) {
		this.name = name;
	}
}

const Com2 = component(() => {
	const { inc, name, updateName, dataService } = useViewModel(ViewModel);

	return (
		<div>
			{/* <button onClick={inc}>{count}</button> */}
			<button onClick={inc}>{dataService.user.age}</button>
			<input type="text" value={name} onChange={(e) => updateName(e.target.value)} />
		</div>
	);
});
