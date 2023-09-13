'use client';
import loadCatalog from '@/utilities/loadCatalog';
import { i18n, Messages } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { PropsWithChildren, useEffect } from 'react';

export interface LanguageProps {
    initialMessages: Messages;
    locale: string;
}

/**
 * This provider handles all internationalization-related setup and handling.
 */
export default function Language({ initialMessages, locale, children }: PropsWithChildren<LanguageProps>) {
    // GUARD: Check if the i18n locale hasn't been set yet
    if (i18n.locale === undefined) {
        // If so, do that immediately
        i18n.loadAndActivate({ locale, messages: initialMessages });
    }

    // Listen for locale changes
    useEffect(() => {
        // Define how locale should be loaded should they change
        async function loadAndSetLocale() {
            // Load the catalog for the new locale
            const messages = await loadCatalog(locale);
            
            // Assign the locale to i18n
            i18n.loadAndActivate({ locale, messages });
        }

        // GUARD: Check if the locale has changed
        const localeDidChange = locale !== i18n.locale;
        if (localeDidChange) {
            loadAndSetLocale();
        }
    }, [locale]);

    return (
        <I18nProvider i18n={i18n}>
            {children}
        </I18nProvider>
    );
}