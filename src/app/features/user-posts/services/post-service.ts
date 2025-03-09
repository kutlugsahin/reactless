import { state, trigger } from '@impair'
import { inject, injectable } from 'tsyringe'
import { getUserPosts } from '../../../api/api'
import { UserService } from '../../../services/user-service'

@injectable()
export class PostService {
	@state
	public posts: any[] = []

	constructor(@inject(UserService) private userService: UserService) {}

	@trigger
	public async fetchPosts() {
	  if (this.userService.selectedUser?.id) {
	    this.posts = await getUserPosts(this.userService.selectedUser.id)
	  }
	}
}
