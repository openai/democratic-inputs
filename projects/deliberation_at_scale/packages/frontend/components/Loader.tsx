import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Loader() {
    return (
        <div className="w-full h-full text-gray-300 text-4xl flex items-center justify-center">
            <FontAwesomeIcon fontSize={100} icon={faSpinner} spin />
        </div>
    );
}
