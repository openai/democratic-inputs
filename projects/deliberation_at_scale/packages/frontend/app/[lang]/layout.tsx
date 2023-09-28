import { PropsWithChildren } from 'react';
import { i18n } from '@lingui/core';
import loadCatalog from '@/utilities/loadCatalog';
import Language from '@/components/Language';
import ColouredHeader from '@/components/ColouredHeader';
import { MESSAGES_SCROLL_CONTAINER_ID } from '@/utilities/constants';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * This layout will load the right language files on the server and gracefully
 * pass them on to the client-side.
 */
export default async function Layout({
    children, params
}: PropsWithChildren<{ params: { lang: string } }>) {
    // Load the catalog for the current language
    const messages = await loadCatalog(params.lang);

    // Then instruct i18n to use them
    i18n.loadAndActivate({ locale: params.lang, messages });

    return (
        <Language initialMessages={messages} locale={params.lang}>
            <article className="flex flex-col justify-between h-screen">
                <section className="shrink-0">
                    <ColouredHeader />
                </section>
                <section className="max-w-[768px] w-full h-full mx-auto flex flex-col grow shrink min-h-0">
                    {children}
                </section>
            </article>
        </Language>
    );
}
