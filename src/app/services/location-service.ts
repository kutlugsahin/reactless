import { inject, injectable, Props } from '@impair';
import { useNavigate } from 'react-router';

export type LocationServiceProps = {
	navigate: ReturnType<typeof useNavigate>;
};

@injectable()
export class LocationService {
	constructor(@inject(Props) private props: LocationServiceProps) {}

	public get navigate() {
		return this.props.navigate;
	}
}
