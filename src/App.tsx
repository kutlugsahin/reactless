import { useEffect, useState } from 'react';

export function App() {
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
				{todo?.title}
			</p>
		</div>
	);
}
