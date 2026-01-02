import { createRootRoute, Link, Outlet } from '@tanstack/react-router';

export const rootRoute = createRootRoute({
  component: () => (
    <>
      <nav style={{ display: 'flex', gap: '0.5em' }}>
        <Link to="/">Posts</Link>
        <Link to="/notifications">Notifications</Link>
      </nav>
      <Outlet />
    </>
  ),
});
