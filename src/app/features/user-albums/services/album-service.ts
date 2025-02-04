import { inject, injectable } from 'tsyringe';
import { getUserAlbums } from '../../../api/api';
import { UserService } from '../../../services/user-service';
import { state, trigger } from '@impair';

@injectable()
export class AlbumService {
	@state
	public albums: any[] = [];

	constructor(@inject(UserService) private userService: UserService) {}

	@trigger
	public async fetchPosts() {
		if (this.userService.selectedUser?.id) {
			this.albums = await getUserAlbums(this.userService.selectedUser.id);
		}
	}
}
