import { Subject } from 'rxjs';
import { delay, inject, injectable } from 'tsyringe';
import type { Props } from '../lib/viewmodel';
import { MutableSubject, OnMount, ProviderProps, state } from '../lib/viewmodel';

export interface IMainService {
	increment(): void;
	counter: CounterService;
}

@injectable()
export class CounterService {
	private count = state(10);

	constructor(@inject(delay(() => MainService)) main: MainService) {
		console.log('CounterService created');
		// console.log('Counter mainService:', main.mainValue.value);

		setTimeout(() => {
			console.log('Counter mainService:', main.mainValue.value);
		});
	}

	increment() {
		this.count.next(this.count.value + 1);
	}

	value = this.count.asObservable();
}

@injectable()
export class MainService implements OnMount, IMainService {
	mainValue = state(0);
	subject = new Subject<number>();
	aaa = new MutableSubject(0);

	constructor(
		@inject(CounterService) public counter: CounterService,
		@inject(ProviderProps) private props: Props<{ value: number }>
	) {
		console.log('MainService created');
	}

	increment() {
		this.counter.increment();
	}

	onMount() {
		this.props.value.subscribe((value) => {
			console.log('value', value);
		});

		this.counter.value.subscribe(this.mainValue);
	}
}

(window as any).MainService = MainService;

@injectable()
export class MainServiceDerived extends MainService implements IMainService {
	constructor(@inject(CounterService) counter: CounterService, @inject(ProviderProps) props: Props<{ value: number }>) {
		super(counter, props);
	}

	onMount(): void {
		this.mainValue.next(100);
		console.log('MainServiceDerived created');
	}
}
