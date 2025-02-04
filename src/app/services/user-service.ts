import { injectable, state } from '@impair';
import { getUsers } from '../api/api';

@injectable()
export class UserService {
	@state
	public users: any[] = [];

	@state
	public selectedUser: any = null;

	init() {
		this.fetchUsers();
	}

	public async fetchUsers() {
		this.users = await getUsers();
	}

	public selectUser(user: any) {
		this.selectedUser = user;
	}
}
