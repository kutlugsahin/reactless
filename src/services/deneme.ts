import { Subject } from 'rxjs';
import { injectable } from 'tsyringe';
import { state } from '../viewmodel';

@injectable()
export class DenemeService {
	subject = new Subject<number>();

	count = state(0);
}
