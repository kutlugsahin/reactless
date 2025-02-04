import { component, useService } from '@impair';
import { Link, Route, Routes } from 'react-router';
import { UserService } from '../services/user-service';

export const Header = component(() => {
	const { selectedUser } = useService(UserService);

	if (!selectedUser) {
		return null;
	}

	return (
		<div className="flex justify-between items-center gap-2 border-slate-500 w-full px-4 pb-4 pt-2">
			<Routes>
				<Route path="/posts" element={<span className="text-3xl">{selectedUser.name}'s Posts</span>} />
				<Route path="/albums" element={<span className="text-3xl">{selectedUser.name}'s Albums</span>} />
			</Routes>
			<div className="flex gap-2">
				<Link to="/posts">Posts</Link>
				<Link to="/albums">Albums</Link>
			</div>
		</div>
	);
});
