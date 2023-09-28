import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function Loader() {
    return (
        <div className="flex w-screen h-screen items-center justify-center text-foreground text-gray-400">
            <FontAwesomeIcon icon={faSpinner} spin size="2x" />
        </div>
    );
}
