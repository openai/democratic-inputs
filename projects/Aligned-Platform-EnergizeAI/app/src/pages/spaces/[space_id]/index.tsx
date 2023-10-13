import { Constitution } from "@/components/playground/constitution"
import { Experiment } from "@/components/playground/experiment"

const Playground = () => {
  return (
    <div className="flex h-full flex-col gap-4 overflow-y-hidden">
      <div className="flex flex-1 flex-col gap-6 overflow-y-hidden lg:flex-row">
        <Constitution />
        <Experiment />
      </div>
    </div>
  )
}

export default Playground
