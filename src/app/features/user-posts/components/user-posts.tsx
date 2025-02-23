import { useService } from '@impair';
import { PostService } from '../services/post-service';

export function UserPosts() {
	const { posts } = useService(PostService);

	return (
		<div className="p-2">
			{posts.map((post) => (
				<div className="border-b border-slate-600 p-2" key={post.id}>
					{post.title}
				</div>
			))}
		</div>
	);
}
