import { createRootRoute } from '@tanstack/react-router';

export const rootRoute = createRootRoute({
  component: () => (
    <>
      <nav style={{ marginBottom: '1rem' }}>
        <Link to="/" style={{ marginRight: '1rem' }}>
          Posts
        </Link>
        <Link to="/notifications">Notifications</Link>
      </nav>
      <Outlet />
    </>
  ),
});
