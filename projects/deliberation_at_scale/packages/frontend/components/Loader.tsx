import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface Props {
    title?: string;
}

export default function Loader(props?: Props) {
    const { title } = props ?? {};

    return (
        <div className="flex flex-col gap-4 w-full h-full items-center justify-center text-foreground text-gray-400">
            <FontAwesomeIcon icon={faSpinner} spin size="2x" />
            {title && <p className="text-lg">{title}</p>}
        </div>
    );
}
