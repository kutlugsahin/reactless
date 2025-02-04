import { component, useService } from '@impair';
import { UserService } from '../services/user-service';
import classNames from 'classnames';

export const UserList = component(() => {
	const { users, selectUser, selectedUser } = useService(UserService);

	return (
		<div className="flex flex-col items-center gap-1 p-1">
			<div className="w-full py-2">
				<span className="text-3xl">Users</span>
			</div>
			{users.map((user: any) => (
				<div
					onClick={() => selectUser(user)}
					className={classNames(
						'bg-gray-50 border border-gray-500 cursor-pointer hover:bg-slate-200 w-full p-2',
						selectedUser?.id === user.id && 'bg-slate-200'
					)}
					key={user.id}
				>
					{user.name}
				</div>
			))}
		</div>
	);
});
