import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ReactNode } from 'react';
import { isNumber } from 'radash';

import useTheme, { ThemeColors } from "@/hooks/useTheme";

const textColorMap: Record<ThemeColors, string> = {
    'blue': 'text-blue-600',
    'green': 'text-green-600',
    'orange': 'text-orange-600',
};

const selectedBorderMap: Record<ThemeColors, string> = {
    'blue': 'border-blue-600',
    'green': 'border-green-600',
    'orange': 'border-orange-600',
};

interface Props {
    children: ReactNode;
    icon?: IconProp;
    onClick: () => void;
    widthVariant?: WidthVariant;
    disabled?: boolean;
    selected?: boolean;
    className?: string;
    progress?: number;
}

type WidthVariant = 'w-full' | 'w-auto';

export default function Button(props: Props) {
    const { children, icon, onClick, widthVariant = 'w-full', disabled = false, selected = false, className, progress } = props;
    const theme = useTheme();
    const showProgress = isNumber(progress);
    const validatedProgress = showProgress ? Math.max(0, Math.min(1, progress)) : 0;

    const defaultClasses = `
        transition-colors
        rounded-md shadow-sm md:py-3 md:px-4 py-2 px-2
        ${textColorMap[theme]} ${widthVariant} font-semibold
        bg-white hover:bg-gray-50
        flex items-center justify-center gap-2
        ${disabled ? 'grayscale cursor-not-allowed' : ''}
        ${showProgress ? 'rounded-b-none' : ''}

        ${className}
    `;

    const parentClasses = `
        flex-1 border rounded-md
        ${selected ? selectedBorderMap[theme] : ''}
    `;

    return (
        <div className={parentClasses}>
            <button
                onClick={onClick}
                className={defaultClasses}
                disabled={disabled}
            >
                {icon && (
                    <FontAwesomeIcon icon={icon} />
                )}
                {children}

            </button>
            {showProgress && (
                <div className='h-2 w-full bg-gray-300 rounded-b'>
                    <div className="h-full bg-green-400 rounded-b" style={{ width: `${validatedProgress * 100}%` }}></div>
                </div>
            )}
        </div>
    );
}
