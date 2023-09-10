"use client";
import { usePathname } from "next/navigation";
import Link, { LinkProps } from "next/link";
import { AnchorHTMLAttributes, PropsWithChildren, useMemo } from 'react';
import classNames from 'classnames';

export interface NavLinkProps extends PropsWithChildren<LinkProps>, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
    activeClassName?: string;
    exact?: boolean;
}

/**
 * This component accepts an `activeClassName` prop that is added to the anchor
 * classname when the route it links to is currently active. 
 */
export function NavLink({ href, exact, children, activeClassName, className, ...props }: NavLinkProps)  {
    const pathname = usePathname();
    const isActive = useMemo(() => (
        exact ? pathname === href : pathname?.startsWith(href.toString())
    ), [pathname, href, exact]);

    return (
        <Link
            href={href}
            className={classNames([className, isActive && activeClassName])}
            {...props}
        >
            {children}
        </Link>
    );
}
