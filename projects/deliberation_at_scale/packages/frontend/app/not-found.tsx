import Link from "next/link";

export default function NotFound() {
    return (
        <div className="mx-auto my-auto w-full h-screen flex flex-col items-center justify-center gap-4">
            <h2 className="text-xl">Page Not Found</h2>
            <Link href="/" className="bg-green-300 rounded px-4 py-2">Go back</Link>
        </div>
    );
}
