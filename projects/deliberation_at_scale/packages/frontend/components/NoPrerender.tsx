import { PropsWithChildren, useEffect, useState } from 'react';

/**
 * Prevent any underlying components from being pre-rendered by Next.js. This
 * prevent errors such as `ReferenceError: document is not defined`.
 */
export default function NoPreRender({ children }: PropsWithChildren) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    return isClient ? children : null;
}