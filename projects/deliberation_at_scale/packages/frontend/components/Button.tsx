import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ReactNode } from 'react';

import useColorClassName from "@/hooks/useTintedThemeColor";

interface Props {
    children: ReactNode;
    icon?: IconProp;
    onClick: () => void;
    widthVariant?: WidthVariant;
    disabled?: boolean;
}

type WidthVariant = 'w-full' | 'w-auto';

export default function Button(props: Props) {
    const { children, icon, onClick, widthVariant = 'w-full', disabled = false } = props;
    const textColor = useColorClassName({ classNamePrefix: 'text', tint: 700 });
    const className = `
        transition-colors
        rounded-md py-2 px-4 shadow-3xl
        ${textColor} ${widthVariant}
        flex items-center justify-center gap-2
        ${disabled ? 'grayscale cursor-not-allowed' : ''}
    `;

    return (
        <button
            onClick={onClick}
            className={className}
            disabled={disabled}
        >
            {icon && (
                <FontAwesomeIcon icon={icon} />
            )}
            {children}
        </button>
    );
}