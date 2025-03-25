import { component, inject, injectable, onMount, Props, state, trigger } from 'impair'
import { QueryService } from '../lib/query/queryService'

type Post = {
  id: number
  title: string
  body: string
}

@injectable()
class QueryPost extends QueryService<Post, [id: number]> {
  protected key = 'posts'

  protected async fetch(id: number) {
    return fetch(`https://jsonplaceholder.typicode.com/posts/${id}`).then((r) => r.json())
  }
}

type PostProps = {
  id: number
}

@injectable()
class PostViewModel {
  @state
  selectedId = 1

  constructor(
    @inject(QueryPost) public posts: QueryPost,
    @inject(QueryPost) public posts2: QueryPost,
    @inject(Props) public props: PostProps,
  ) {}

  @trigger
  querySelectedPost() {
    this.posts.query(this.selectedId)
  }

  @trigger
  querySelectedPost2() {
    this.posts2.query(this.selectedId + 1)
  }

  @onMount
  sdfsdfsd() {}

  render() {
    return (
      <div>
        <div>
          <button onClick={() => this.selectedId++}>Inc</button>
          <button onClick={() => this.selectedId--}>Dec</button>
        </div>
        <hr />
        <div>
          <h2 className="font-bold">{this.posts.data?.title}</h2>
          <p>{this.posts.data?.body}</p>
        </div>
        <hr />
        <div>
          <h2 className="font-bold">{this.posts2.data?.title}</h2>
          <p>{this.posts2.data?.body}</p>
        </div>
        <hr />
        {this.props.id}
      </div>
    )
  }
}

export const Posts = component.fromViewModel<PostProps>(PostViewModel)
