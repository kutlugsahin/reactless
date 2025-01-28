import { container, inject, injectable, Lifecycle } from 'tsyringe';
import './App.css';


import {
	BehaviorSubject,
	combineLatest,
	Observable,
	Subject
} from 'rxjs';
import { DenemeService } from './services/deneme';
import { MainService } from './services/main';
import { ServiceProvider, useService } from './viewmodel';

const useConnectedProps = () =>
	useService(MainService, (mainService) => ({
		increment: mainService.increment,
		value: mainService.counter.value,
		mainValue: mainService.mainValue,
	}));

function App() {
	// const {
	// 	increment,
	// 	value,
	// 	setters: {},
	// } = useConnectedProps();

	const {
		subject,
		count,
		setters: { setSubject, setCount },
	} = useService(DenemeService);

	return (
		<>
			{/* <button
				onClick={() => {
					increment();
				}}
			>
				{value}
			</button>
			<div>
				<Counter id={value + 1} />
				<Counter id={value + 2} />
				<ServiceProvider provide={[[MainService, MainServiceDerived]]}>
					<Counter id={value + 3} />
					<Counter id={value + 3} />
				</ServiceProvider>
			</div> */}

			<div>
				<hr />
				<button onClick={() => setSubject((subject ?? 0) + 1)}>{subject}</button>
				<button onClick={() => setCount(count + 1)}>{count}</button>
			</div>
		</>
	);
}

export default () => {
	return (
		<ServiceProvider provide={[MainService, DenemeService]} props={{ value: 123 }}>
			<App />
		</ServiceProvider>
	);
};

@injectable()
class Main {
	value = 0;
}

@injectable()
class A {
	count = 0;

	constructor(@inject(Main) public main: Main) {}
}

const c1 = container.createChildContainer();

c1.register(Main, { useClass: Main }, { lifecycle: Lifecycle.Singleton });
c1.register(A, { useClass: A }, { lifecycle: Lifecycle.Singleton });

const c2 = c1.createChildContainer();

console.log(c2.isRegistered(A));
console.log(c2.isRegistered(Main));

// c2.register(A, { useClass: A }, { lifecycle: Lifecycle.Singleton });
c1.afterResolution(
	A,
	(_, instance) => {
		console.log('c1 resolved', instance);
	},
	{ frequency: 'Once' }
);
c2.afterResolution(
	A,
	(_, instance) => {
		console.log('c2 resolved', instance);
	},
	{ frequency: 'Once' }
);

const a1 = c1.resolve(A);

a1.count = 1;
a1.main.value = 1;

const a2 = c2.resolve(A);
c2.resolve(A);
c2.resolve(A);
c2.resolve(A);
c2.resolve(A);
c2.resolve(A);

console.log(a1 === a2);

a2.count = 2;
a2.main.value = 2;

console.log(a1.count, a2.count);
console.log(a1.main.value, a2.main.value);

const s1 = new BehaviorSubject<number>(3);
const s2 = new Subject<number>();

combineLatest([s1.pipe(startWithIfNoValue), s2.pipe(startWithIfNoValue)]).subscribe((vals) => {
	console.log(vals);
});

console.log('xxx');

s1.next(0);

function startWithIfNoValue(source: Observable<any>) {
	const result = new BehaviorSubject<any>(undefined);
	source.subscribe(result);
	return result;
}
