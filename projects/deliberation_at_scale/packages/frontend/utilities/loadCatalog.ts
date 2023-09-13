import type { Messages } from '@lingui/core';

/**
 * Load a language catalog for a particular locale, and return the messages that
 * are in the catalog.
 */
export default async function loadCatalog(locale: string) {
    const catalog = await import(`@lingui/loader!../locales/${locale}.po`);
    return catalog.messages as Messages;
}