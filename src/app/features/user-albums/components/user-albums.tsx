import { component, useService } from '@impair';
import { AlbumService } from '../services/album-service';

export const UserAlbums = component(() => {
	const { albums } = useService(AlbumService);

	return (
		<div className="p-2">
			{albums.map((album) => (
				<div className="border-b border-slate-600 p-2" key={album.id}>
					{album.title}
				</div>
			))}
		</div>
	);
});
