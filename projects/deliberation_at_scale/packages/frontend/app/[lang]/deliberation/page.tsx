import Link from 'next/link';

export default function Deliberation() {
    return (
        <Link
            className="bg-white shadow rounded py-3 px-4"
            href="/deliberation/permission"
        >
            Ask for permissions
        </Link>
    );
}