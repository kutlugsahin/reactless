import { component, inject, injectable, ServiceProvider, state, type TranslationFunction, useViewModel } from '@impair';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Lifecycle } from 'tsyringe';
import { createQuery, setQueryClient } from '../lib/query-service/create-query';
import { componentWithViewModel, RendererViewModel } from '@impair/component/component';
import { ReactNode, useContext } from 'react';
import { Context } from '@impair/context/context';

// @injectable()
// class Viewmodel {
// 	@state
// 	state = {
// 		count: 0,
// 		price: 0,
// 	};

// 	constructor(@inject(Props) private props: ReactivityProps, @inject(PostService) public posts: PostService) {
// 		this.posts.queryKey(() => [this.props.id]);
// 	}

// 	@trigger
// 	logCount() {
// 		console.log('count', this.state.price);
// 	}

// 	@trigger
// 	logId() {
// 		console.log('id', this.props.id);
// 	}
// }

// interface ReactivityProps {
// 	id: number;
// }

// export const Reactivity = component((props: ReactivityProps) => {
// 	const { state, posts } = useViewModel(Viewmodel, props);

// 	console.log('render');

// 	return (
// 		<div>
// 			<button
// 				className="border border-black p-4 m-2"
// 				onClick={() => {
// 					state.count++;
// 				}}
// 			>
// 				Inc {state.count}
// 			</button>

// 			<button
// 				className="border border-black p-4 m-2"
// 				onClick={() => {
// 					state.price++;
// 				}}
// 			>
// 				Inc
// 			</button>

// 			<div>
// 				<ul>
// 					{posts.data?.map((post: any) => (
// 						<li key={post.id}>{post.title}</li>
// 					))}
// 				</ul>
// 			</div>
// 		</div>
// 	);
// });

const queryPosts = createQuery({
	key: 'posts',
	query(id: number) {
		return fetch(`https://jsonplaceholder.typicode.com/posts/${id}`).then((r) => r.json());
	},
});

@injectable()
class PostViewModel implements RendererViewModel {
	@state
	selectedId = 1;

	posts = queryPosts(() => [this.selectedId]);

	constructor(@inject('t') private t: TranslationFunction) {
		console.log('PostViewModel', this.t('hello'));
	}

	render() {
		const context = useContext(Context);

		console.log('context', context);

		return (
			<div>
				<Buttons />
				<hr />
				{JSON.stringify(this.posts.data, null, 2)}
			</div>
		);
	}

	inc() {
		this.selectedId++;
	}

	dec() {
		this.selectedId--;
	}
}

const Posts = componentWithViewModel(PostViewModel);

@injectable()
class ButtonViewModel implements RendererViewModel {
	constructor(@inject(PostViewModel) private post: PostViewModel) {}

	render(): ReactNode {
		return (
			<div>
				<button onClick={() => this.post.inc()}>Inc</button>
				<button onClick={() => this.post.dec()}>Dec</button>
			</div>
		);
	}
}

const Buttons = componentWithViewModel(ButtonViewModel);

const client = new QueryClient();

setQueryClient(client);

export function Comp() {
	// const [id, setId] = useState(0);

	return (
		<QueryClientProvider client={client}>
			<ServiceProvider provide={[]}>
				<div>
					<Posts />
				</div>
			</ServiceProvider>
		</QueryClientProvider>
	);
}
