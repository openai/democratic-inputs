import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import { PropsWithChildren } from 'react';

export interface PillProps extends PropsWithChildren {
    icon?: IconDefinition;
    className?: string;
}

export default function Pill({ icon, children, className }: PillProps) {
    return (
        <div className={classNames("rounded-full border inline-flex gap-2 items-center px-4 py-2 text-sm uppercase", className)}>
            {icon && <FontAwesomeIcon icon={icon} />}
            {children}
        </div>
    );
}