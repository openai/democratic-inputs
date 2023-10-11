'use client';
import { LocalMediaContext } from '@/components/LocalMedia/context';
import { PermissionState, setPermissionState } from '@/state/slices/room';
import { useAppDispatch, useAppSelector } from '@/state/store';
import { usePathname } from 'next/navigation';
import { useContext, useEffect, useMemo } from 'react';
import useLocalizedPush from './useLocalizedPush';
import { useLanguage } from './useLanguage';

export interface UseLocalMediaOptions {
    request: boolean;
    redirect: boolean;
}

const defaultUseLocalMediaOptions: UseLocalMediaOptions = {
    /** When permissions are missing, request them from the user. This will
     * cause a permission pop up to appear in the user's browser. */
    request: true,
    /** When permissions are missing,  */
    redirect: true,
};

export type UseLocalMedia = LocalMediaContext | { state: null, actions: null, _ref: null };

/**
 * Retrieve the state for the current local media.
 */
export function useLocalMedia(): LocalMediaContext;
export function useLocalMedia(options: Partial<UseLocalMediaOptions>): UseLocalMedia;
export function useLocalMedia(options: Partial<UseLocalMediaOptions> = {}) {
    const {
        request, redirect,
    } = useMemo(() => Object.assign({}, defaultUseLocalMediaOptions, options), [options]);
    const ctx = useContext(LocalMediaContext);
    const permission = useAppSelector((state) => state.room.permission);
    const dispatch = useAppDispatch();
    const { push } = useLocalizedPush();
    const pathname = usePathname();
    const language = useLanguage();
    const pathnameWithoutLocale = pathname?.replace(`/${language}/`, '/');

    useEffect(() => {
        if (permission === PermissionState.NONE) {
            if (redirect) {
                push(`/lobby/permission?redirect=${pathnameWithoutLocale}`);
            }
            if (request) {
                dispatch(setPermissionState(PermissionState.REQUESTED));
            }
        }
    }, [permission, redirect, request, dispatch, pathnameWithoutLocale, push]);

    // GUARD: Check that the context provider is somewhere in the tree
    if (!ctx) {
        return { state: null, actions: null, _ref: null };
    }

    return ctx;
}
