import Link from "next/link"
import { useRouter } from "next/router"

type Props = {
  error_message?: string
}

export const Error404 = ({ error_message }: Props) => {
  return (
    <>
      <div className="flex flex-col items-center justify-center gap-10 py-32">
        <Link href={"/"}>
          <img src="/logo.png" alt="Logo" className="h-16 text-primary-foreground" />
        </Link>
        <h1 className="bg-gradient-to-r from-sky-500 to-emerald-600 bg-clip-text text-8xl font-extrabold text-transparent dark:from-sky-700 dark:to-emerald-800">
          404
        </h1>
        <p>You didn&apos;t break the internet, but we can&apos;t find what you are looking for.</p>
        {error_message && <p className="text-red-500 dark:text-red-400">{error_message}</p>}
      </div>
    </>
  )
}

export default function NotFoundPage() {
  const { error_message } = useRouter().query

  return <Error404 error_message={error_message as string} />
}
