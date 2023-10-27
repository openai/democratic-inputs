type Props = {
  message: string
}

export const ErrorMessage = ({ message }: Props) => {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-10 py-20 text-center">
      <h1 className="w-full bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-center text-3xl font-extrabold text-transparent">
        Oops!
      </h1>
      <p>{message}</p>
    </div>
  )
}

export default ErrorMessage
