import {
  component,
  delay,
  inject,
  injectable,
  QueryService,
  RendererViewModel,
  setQueryClient,
  state,
  trigger,
} from '@impair'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

import { container } from 'tsyringe'

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

@injectable()
class QueryPost extends QueryService<any, [id: number]> {
  protected key = 'posts'

  protected async fetch(id: number) {
    return fetch(`https://jsonplaceholder.typicode.com/posts/${id}`).then((r) => r.json())
  }
}

@injectable()
class UserVideModel {
  @state
  userName = 'kutlu'

  constructor(@inject(delay(() => PostViewModel)) public postviewModel: PostViewModel) {}
}

@injectable()
class PostViewModel implements RendererViewModel {
  @state
  selectedId = 1

  constructor(
    @inject(delay(() => UserVideModel)) public user: UserVideModel,
    @inject(QueryPost) public posts: QueryPost,
    @inject(QueryPost) public posts2: QueryPost,
  ) {}

  @trigger
  querySelectedPost() {
    this.posts.query(this.selectedId + 0)
  }

  @trigger
  querySelectedPost2() {
    this.posts2.query(this.selectedId + 1)
  }

  render() {
    return (
      <div>
        <Buttons />
        <hr />
        {JSON.stringify(this.posts.data, null, 2)}
        <hr />
        {JSON.stringify(this.posts2.data, null, 2)}
      </div>
    )
  }

  inc() {
    this.selectedId++
  }

  dec() {
    this.selectedId--
  }
}

const Posts = component.fromViewModel(PostViewModel)

@injectable()
class ButtonViewModel implements RendererViewModel {
  constructor(@inject(PostViewModel) private post: PostViewModel) {}

  render(): ReactNode {
    return (
      <div>
        <button onClick={() => this.post.inc()}>Inc</button>
        <button onClick={() => this.post.dec()}>Dec</button>
        <input
          type="text"
          value={this.post.user.userName}
          onChange={(e) => {
            this.post.user.userName = e.target.value
          }}
        />
      </div>
    )
  }
}

const Buttons = component.fromViewModel(ButtonViewModel)

const client = new QueryClient()

setQueryClient(client)

export function Comp() {
  // const [id, setId] = useState(0);

  return (
    <QueryClientProvider client={client}>
      {/* <ServiceProvider provide={[]}> */}
      <div>
        <Posts />
      </div>
      {/* </ServiceProvider> */}
    </QueryClientProvider>
  )
}

@injectable()
class A {
  constructor(@inject(delay(() => B)) private b: B) {}

  public data = 3
}

@injectable()
class B {
  constructor(@inject(delay(() => A)) public a: A) {}
}

const c1 = container.createChildContainer()
const c2 = c1.createChildContainer()

const r1 = c1.resolve.bind(c1)

const r2 = c2.resolve.bind(c2)

// c1.resolve = function (...args: any[]) {
// 	const instance = r1.call(c1, ...args);

// 	if (isProxy(instance)) {
// 		console.log('isProxy');
// 	}

// 	return instance;
// };

// c2.resolve = function (...args: any[]) {
// 	const instance = r2.call(c2, ...args);

// 	if (args.length > 1) {
// 		console.log('isProxy');
// 	}

// 	console.log(instance);

// 	return instance;
// };

const b = c2.resolve(B)

// setTimeout(() => {
console.log(b.a.data)
// });
