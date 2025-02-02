import { useEffect, useState } from 'react';
import { inject } from 'tsyringe';

export function TodoList() {
	const [id, setId] = useState(1);
	const [todos, setTodos] = useState<any[]>([]);
	const [todo, setTodo] = useState<any>();

	useEffect(() => {
		fetch('https://jsonplaceholder.typicode.com/todos')
			.then((res) => res.json())
			.then((data) => {
				setTodos(data);
			});
	}, []);

	useEffect(() => {
		fetch(`https://jsonplaceholder.typicode.com/todos/${id}`)
			.then((res) => res.json())
			.then((data) => {
				setTodo(data);
			});
	}, [id]);

	return (
		<div>
			<div>
				{todos.map((todo) => (
					<button key={todo.id} onClick={() => setId(todo.id)}>
						{todo.title}
					</button>
				))}
			</div>
			<p>
				{todo?.title} - {todo?.completed ? 'Completed' : 'Not Completed'}
			</p>
		</div>
	);
}

// =============================== View Layer ==============================================
function BetterTodoList({ todos, todo, onTodoClicked }: any) {
	return (
		<div>
			<div>
				{todos.map((todo: any) => (
					<button key={todo.id} onClick={() => onTodoClicked(todo.id)}>
						{todo.title}
					</button>
				))}
			</div>
			<p>
				{todo?.title} - {todo?.completed ? 'Completed' : 'Not Completed'}
			</p>
		</div>
	);
}

// =============================== Business Layer ==============================================
class TodoListViewModel {
	public todos: any[] = [];
	public todo: any = {};

	constructor(@inject(UserService) private userService: UserService) {
		this.fetchTodos();
	}

	private async fetchTodos() {
		const response = await fetch('https://jsonplaceholder.typicode.com/todos');
		this.todos = await response.json();
	}

	private async fetchTodoById(id: number) {
		const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`);
		this.todo = await response.json();
	}

	public get user() {
		return this.userService.user;
	}

	onTodoClicked(id: number) {
		this.fetchTodoById(id);
	}
}

class UserService {
	public user: any = {};

	constructor() {
		this.fetchUser();
	}

	private async fetchUser() {
		const response = await fetch('https://jsonplaceholder.typicode.com/users/1');
		this.user = await response.json();
	}
}
