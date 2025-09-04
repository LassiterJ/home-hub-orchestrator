import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export const Route = createRootRoute({
    component: () => (
        <>
            <div className="p-2 flex gap-2">
                <Link to="/" className="[&.active]:font-bold">
                    Home
                </Link>{' '}
                <Link to="/cv-test" className="[&.active]:font-bold">
                    CV Test
                </Link>{' '}
                <Link to="/form-test" className="[&.active]:font-bold">
                    Form Test
                </Link>{' '}
                <Link to="/ui-components" className="[&.active]:font-bold">
                    UI Components
                </Link>
            </div>
            <hr />
            <Outlet />
            <TanStackRouterDevtools />
        </>
    ),
})
