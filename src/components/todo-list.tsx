import { useViewModel } from '@impair';
import { useEffect, useState } from 'react';

export function TodoList2() {
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
export const TodoList = ({ todos, todo, onTodoClicked }: any) => {
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
};

// =============================== Business Layer ==============================================

class TodoListService {
	public todos: any[] = [];

	public todo: any = {};

	constructor() {
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

	onTodoClicked(id: number) {
		this.fetchTodoById(id);
	}
}