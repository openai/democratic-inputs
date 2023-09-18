"use client";
import { usePathname } from "next/navigation";
import Link, { LinkProps } from "next/link";
import { AnchorHTMLAttributes, ReactNode, useMemo } from 'react';
import classNames from 'classnames';

export interface NavLinkProps extends LinkProps, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'children'> {
    activeClassName?: string;
    exact?: boolean;
    children: ReactNode | ((active: boolean) => ReactNode);
}

/**
 * This component accepts an `activeClassName` prop that is added to the anchor
 * classname when the route it links to is currently active. 
 */
export function NavLink({ href, exact, children, activeClassName, className, ...props }: NavLinkProps)  {
    const pathname = usePathname();
    const isActive = useMemo(() => (
        exact ? pathname === href : pathname?.startsWith(href.toString()) || false
    ), [pathname, href, exact]);

    return (
        <Link
            href={href}
            className={classNames([className, isActive && activeClassName])}
            {...props}
        >
            {typeof children === 'function' ? children(isActive) : children}
        </Link>
    );
}
