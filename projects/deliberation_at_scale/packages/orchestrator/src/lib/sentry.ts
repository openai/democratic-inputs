import * as Sentry from "@sentry/node";
import { ProfilingIntegration } from "@sentry/profiling-node";
import { Helpers } from "graphile-worker";

import { SENTRY_DSN } from "../config/constants";

Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [
        new ProfilingIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
});

// eslint-disable-next-line @typescript-eslint/ban-types
export function wrapInErrorCatcher(f: Function) {
    return (...args: unknown[]) => {
        try {
            f(...args);
        } catch (error) {
            Sentry.captureException(error);
            throw error;
        }
    };
}

export interface LogEventOptions {
    message: string;
    level: Sentry.SeverityLevel;
    helpers?: Helpers;
}

export function captureEvent(options: LogEventOptions) {
    const { message, level, helpers } = options;

    Sentry.captureEvent({
        message,
        level,
    });

    if (helpers && level !== 'fatal' && level !== 'warning') {
        helpers.logger?.[level]?.(message);
    }
}


export default Sentry;
