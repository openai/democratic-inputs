import React, { ReactNode } from "react"

import ErrorMessage from "./error-message"
import { UseTRPCQueryResult } from "@trpc/react-query/shared"

interface QueryDataLoaderProps {
  children: ReactNode
  queryResults: UseTRPCQueryResult<any, any>
  skeletonItems?: number
  showEmptyState?: boolean
  addSkeletonContainer?: boolean
  showLoadOnFetch?: boolean
  forceState?: "loading" | "success" | "error" | "empty" | "none"
}

interface IsLoadingProps {
  children: ReactNode
}

interface IsSuccessProps {
  children: ReactNode
}

interface IsErrorProps {
  children: ReactNode
}

interface IsEmptyProps {
  children: ReactNode
}

const QueryDataLoader: React.FC<QueryDataLoaderProps> & {
  IsLoading: React.FC<IsLoadingProps>
  IsSuccess: React.FC<IsSuccessProps>
  IsError: React.FC<IsErrorProps>
  IsEmpty: React.FC<IsEmptyProps>
} = ({
  children,
  showLoadOnFetch = false,
  queryResults,
  skeletonItems = 4,
  showEmptyState = true,
  addSkeletonContainer = true,
  forceState,
}) => {
  type State = "loading" | "success" | "error" | "empty" | "none"

  let currentState: State = "none"

  // GET THE CURRENT STATE

  if (
    queryResults.isSuccess &&
    (!queryResults.data || (Array.isArray(queryResults.data) && queryResults.data.length === 0)) &&
    showEmptyState
  ) {
    currentState = "empty"
  } else if (queryResults.error) {
    currentState = "error"
  } else if (queryResults.isLoading || (showLoadOnFetch && queryResults.isFetching)) {
    currentState = "loading"
  } else if (queryResults.isSuccess) {
    currentState = "success"
  } else {
    currentState = "none"
  }

  if (forceState) {
    currentState = forceState
  }

  // SET THE DEFAULT STATE NODES

  const stateNodeMap: Record<State, ReactNode> = {
    loading: (
      <div className="flex flex-col gap-4">
        {Array.from({ length: skeletonItems }).map((_, i) => (
          <div key={i} className="h-10 w-full rounded bg-muted" />
        ))}
      </div>
    ),
    success: <div>{JSON.stringify(queryResults.data)}</div>,
    error: <ErrorMessage message={queryResults.error?.message} />,
    empty: <div className="w-full rounded border border-dashed py-20 text-center">No data to display.</div>,
    none: null,
  }

  // GET THE CHILDREN -> STATE MAPPING
  if (React.Children.toArray(children).some(Boolean)) {
    for (const child of React.Children.toArray(children)) {
      if (!React.isValidElement(child)) {
        continue
      }

      if (child.type === QueryDataLoader.IsError) {
        stateNodeMap["error"] = React.cloneElement(child)
      } else if (child.type === QueryDataLoader.IsEmpty) {
        stateNodeMap["empty"] = React.cloneElement(child)
      } else if (child.type === QueryDataLoader.IsLoading && skeletonItems > 1 && addSkeletonContainer) {
        stateNodeMap["loading"] = (
          <div className="flex w-full flex-col gap-4">
            {Array.from({ length: skeletonItems }).map((_, i) => React.cloneElement(child, { key: i }))}
          </div>
        )
      } else if (child.type === QueryDataLoader.IsLoading && skeletonItems > 1 && !addSkeletonContainer) {
        stateNodeMap["loading"] = Array.from({ length: skeletonItems }).map((_, i) =>
          React.cloneElement(child, { key: i }),
        )
      } else if (child.type === QueryDataLoader.IsLoading) {
        stateNodeMap["loading"] = React.cloneElement(child)
      } else if (child.type === QueryDataLoader.IsSuccess) {
        stateNodeMap["success"] = React.cloneElement(child)
      }
    }
  }

  return <>{stateNodeMap[currentState]}</>
}

QueryDataLoader.IsLoading = function SkeletonLoader({ children }) {
  return <>{children}</>
}

QueryDataLoader.IsSuccess = function DataLoaded({ children }) {
  return <>{children}</>
}

QueryDataLoader.IsError = function ErrorDisplay({ children }) {
  return <>{children}</>
}

QueryDataLoader.IsEmpty = function EmptyDisplay({ children }) {
  return <>{children}</>
}

export default QueryDataLoader
