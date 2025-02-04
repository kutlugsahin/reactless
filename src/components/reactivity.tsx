import { effect, ref } from '@vue/reactivity';

export const Reactivity = () => {
	return (
		<div>
			<button
				onClick={() => {
					product.value.count++;
				}}
			>
				Inc {product.value.count}
			</button>
		</div>
	);
};

const product = ref({
	price: 1,
	count: 0,
});

effect(() => {
	console.log('price', product.value.price);
});

effect(() => {
	console.log('count', product.value.count);
});

// const totalPrise = computed(() => {
// 	return product.value.price * product.value.count;
// });

// effect(() => {
// 	console.log('total', totalPrise.value);
// });
