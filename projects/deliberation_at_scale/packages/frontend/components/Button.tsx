import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ReactNode } from 'react';

import useTheme, { ThemeColors } from "@/hooks/useTheme";

const textColorMap: Record<ThemeColors, string> = {
    'blue': 'text-blue-600',
    'green': 'text-green-600',
    'orange': 'text-orange-600',
};

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
    const theme = useTheme();

    const className = `
        transition-colors
        rounded-md py-3 px-4
        ${textColorMap[theme]} ${widthVariant} font-semibold
        border bg-white hover:bg-gray-50
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
