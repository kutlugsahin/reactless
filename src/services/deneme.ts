import { Subject } from 'rxjs';
import { injectable } from 'tsyringe';
import { state } from '../lib/viewmodel';

@injectable()
export class DenemeService {
	subject = new Subject<number>();

	count = state(0);
}
