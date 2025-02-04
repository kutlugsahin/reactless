export async function getUsers() {
	const res = await fetch('https://jsonplaceholder.typicode.com/users');
	return await res.json();
}

export async function getUser(id: number) {
	const res = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);
	return await res.json();
}

export async function getUserPosts(userId: number) {
	const res = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}/posts`);
	return await res.json();
}

export async function getUserAlbums(userId: number) {
	const res = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}/albums`);
	return await res.json();
}

export async function getPostComments(postId: number) {
	const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${postId}/comments`);
	return await res.json();
}
