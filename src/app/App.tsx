import { ServiceProvider } from '@impair'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { Header } from './components/header'
import { UserList } from './components/user-list'
import { UserPosts } from './features/user-posts/components/user-posts'
import { PostService } from './features/user-posts/services/post-service'
import { LocationService } from './services/location-service'
import { UserService } from './services/user-service'
import { AlbumService } from './features/user-albums/services/album-service'
import { UserAlbums } from './features/user-albums/components/user-albums'

export function App() {
  return (
    <BrowserRouter>
      <ServiceProvider provide={[UserService, LocationService]}>
        <div className="flex w-dvw h-dvh fixed">
          <div className="w-[250px] border-r border-slate-500">
            <UserList />
          </div>
          <div className="flex-1 flex flex-col">
            <div className="h-16 flex items-center">
              <Header />
            </div>
            <div className="flex-1 overflow-y-auto">
              <Routes>
                <Route path="/" element={<Navigate to="/posts" />} />
                <Route
                  path="/posts"
                  element={
                    <ServiceProvider provide={[PostService, AlbumService]} key={0}>
                      <UserPosts />
                    </ServiceProvider>
                  }
                />
                <Route
                  path="/albums"
                  element={
                    <ServiceProvider provide={[AlbumService]} key={1}>
                      <UserAlbums />
                    </ServiceProvider>
                  }
                />
              </Routes>
            </div>
          </div>
        </div>
      </ServiceProvider>
    </BrowserRouter>
  )
}
