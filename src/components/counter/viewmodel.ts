import { inject, injectable } from 'tsyringe';
import { MainService } from '../../services/main';
import type { IMainService } from '../../services/main';
import type { Props } from '../../viewmodel';
import { ComponentProps, OnMount, state } from '../../viewmodel';
import { CounterProps } from './counter';
import { Subject } from 'rxjs';

@injectable()
export class CounterViewModel implements OnMount {
	count = state(0);
	mainCount = state(0);

	subject = new Subject<number>();

	constructor(
		@inject(MainService) private main: IMainService,
		@inject(ComponentProps) private props: Props<CounterProps>
	) {
		this.props.id.subscribe((p) => {
			console.log('id', p);
		});

		this.main.counter.value.subscribe((p) => {
			console.log('main counter value', p);
		});
	}

	inc() {
		this.main.increment();
		this.count.next((p) => p + 1);
		this.count.next((p) => p + 1);
		this.count.next((p) => p + 1);
	}

	onMount() {
		this.main.counter.value.subscribe(this.mainCount);
	}
}
