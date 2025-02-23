import { component, inject, injectable, Props, ServiceProvider, state, trigger, useViewModel } from '@impair';
import { useState } from 'react';
import { QueryClientService, QueryService } from '../lib/query-service/query-service';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Lifecycle } from 'tsyringe';
import { createQuery, setQueryClient } from '../lib/query-service/create-query';

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
class PostService extends QueryService<[number]> {
	protected key = 'posts';

	constructor(@inject(QueryClientService) queryClient: QueryClient) {
		super(queryClient);
	}

	protected queryFunction(id: number): Promise<any> {
		return fetch(`https://jsonplaceholder.typicode.com/posts/${id}`).then((r) => r.json());
	}
}

@injectable()
class PostViewModel {
	@state
	selectedId = 1;

	// constructor(@inject(PostService) public posts: PostService) {}

	// init() {
	// 	this.posts.queryKey(() => [this.selectedId]);
	// }
	posts = queryPosts(() => [this.selectedId]);

	inc() {
		this.selectedId++;
	}
}

const Posts = component(() => {
	const { posts, inc } = useViewModel(PostViewModel);

	return (
		<div>
			<button className="border border-slate-800" onClick={inc}>
				inc
			</button>
			<hr />
			{JSON.stringify(posts.data, null, 2)}
		</div>
	);
});

const client = new QueryClient();

setQueryClient(client);

export function Comp() {
	const [id, setId] = useState(0);

	return (
		<QueryClientProvider client={client}>
			<ServiceProvider
				provide={[
					// {
					// 	token: PostService,
					// 	provider: { useClass: PostService },
					// 	options: {
					// 		lifecycle: Lifecycle.Transient,
					// 	},
					// },
					{
						token: QueryClientService,
						provider: { useValue: client },
						options: {
							lifecycle: Lifecycle.Transient,
						},
					},
				]}
			>
				<div>
					<Posts />
				</div>
			</ServiceProvider>
		</QueryClientProvider>
	);
}
