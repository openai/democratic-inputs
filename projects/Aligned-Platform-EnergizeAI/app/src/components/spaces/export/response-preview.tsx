import { TableIcon } from "lucide-react"
import React from "react"
import JSONPretty from "react-json-pretty"
import { z } from "zod"

import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TopicTreeBuildConfig } from "@energizeai/engine"

type Props = {
  values: z.infer<typeof TopicTreeBuildConfig>
  exportType: "json" | "csv"
  setExportType: (type: "json" | "csv") => void
}

const buildResponseFromValues = (values: z.infer<typeof TopicTreeBuildConfig>) => {
  const resp: Record<string, any> = {
    "[Topic ID]": {
      title: "Topic title goes here...",
      description: "Topic description goes here...",
    },
  }

  if (values.topic__author_id) {
    resp["[Topic ID]"]["author_id"] = "User ID of the topic author goes here..."
  }

  if (values.topic__updated_by) {
    resp["[Topic ID]"]["updated_by"] = "User ID of the topic updater goes here..."
  }

  if (values.topic__space_id) {
    resp["[Topic ID]"]["space_id"] = "Space ID of the topic goes here..."
  }

  if (values.topic__sparkline) {
    resp["[Topic ID]"]["sparkline"] = "Sparkline goes here..."
  }

  if (values.topic__created_at) {
    resp["[Topic ID]"]["created_at"] = "ISO creation date string of topic goes here..."
  }

  if (values.topic__updated_at) {
    resp["[Topic ID]"]["updated_at"] = "ISO update date string of topic goes here..."
  }

  if (values.guidelines) {
    resp["[Topic ID]"]["guidelines"] = {
      ["[Guideline ID]"]: {
        value: "Guideline value goes here...",
      },
    }

    if (values.guideline__author_id) {
      resp["[Topic ID]"]["guidelines"]["[Guideline ID]"]["author_id"] = "User ID of the guideline author goes here..."
    }

    if (values.guideline__updated_by) {
      resp["[Topic ID]"]["guidelines"]["[Guideline ID]"]["updated_by"] = "User ID of the guideline updater goes here..."
    }

    if (values.guideline__created_at) {
      resp["[Topic ID]"]["guidelines"]["[Guideline ID]"]["created_at"] =
        "ISO creation date string of guideline goes here..."
    }

    if (values.guideline__updated_at) {
      resp["[Topic ID]"]["guidelines"]["[Guideline ID]"]["updated_at"] =
        "ISO update date string of guideline goes here..."
    }

    if (values.ratings) {
      resp["[Topic ID]"]["guidelines"]["[Guideline ID]"]["ratings"] = {
        ["[Rating ID]"]: {
          rating: "helpful | not_helpful",
        },
      }

      if (values.rating__author_id) {
        resp["[Topic ID]"]["guidelines"]["[Guideline ID]"]["ratings"]["[Rating ID]"]["author_id"] =
          "User ID of the rating author goes here..."
      }

      if (values.rating__updated_by) {
        resp["[Topic ID]"]["guidelines"]["[Guideline ID]"]["ratings"]["[Rating ID]"]["updated_by"] =
          "User ID of the rating updater goes here..."
      }

      if (values.rating__created_at) {
        resp["[Topic ID]"]["guidelines"]["[Guideline ID]"]["ratings"]["[Rating ID]"]["created_at"] =
          "ISO creation date string of rating goes here..."
      }

      if (values.rating__updated_at) {
        resp["[Topic ID]"]["guidelines"]["[Guideline ID]"]["ratings"]["[Rating ID]"]["updated_at"] =
          "ISO update date string of rating goes here..."
      }
    }
  }

  return resp
}

type CsvTable = {
  title: string
  headers: {
    title: string
    description: string
  }[]
}

const buildCsvResponseFromValues = (values: z.infer<typeof TopicTreeBuildConfig>) => {
  const tables: CsvTable[] = []

  tables.push({
    title: "Topics",
    headers: [
      {
        title: "ID",
        description: "Topic ID goes here...",
      },
      {
        title: "Title",
        description: "Topic title goes here...",
      },
      {
        title: "Description",
        description: "Topic description goes here...",
      },
      {
        title: "Parent ID",
        description: "Parent ID of the topic goes here...",
      },
    ],
  })

  if (values.topic__author_id) {
    tables[0].headers.push({
      title: "Author ID",
      description: "User ID of the topic author goes here...",
    })
  }

  if (values.topic__updated_by) {
    tables[0].headers.push({
      title: "Updated By",
      description: "User ID of the topic updater goes here...",
    })
  }

  if (values.topic__space_id) {
    tables[0].headers.push({
      title: "Space ID",
      description: "Space ID of the topic goes here...",
    })
  }

  if (values.topic__sparkline) {
    tables[0].headers.push({
      title: "Sparkline",
      description: "Sparkline goes here...",
    })
  }

  if (values.topic__created_at) {
    tables[0].headers.push({
      title: "Created At",
      description: "ISO creation date string of topic goes here...",
    })
  }

  if (values.topic__updated_at) {
    tables[0].headers.push({
      title: "Updated At",
      description: "ISO update date string of topic goes here...",
    })
  }

  if (!values.guidelines) {
    return tables
  }

  tables.push({
    title: "Guidelines",
    headers: [
      {
        title: "ID",
        description: "Guideline ID goes here...",
      },
      {
        title: "Value",
        description: "Guideline value goes here...",
      },
      {
        title: "Topic ID",
        description: "Topic ID of the guideline goes here...",
      },
    ],
  })

  if (values.guideline__author_id) {
    tables[1].headers.push({
      title: "Author ID",
      description: "User ID of the guideline author goes here...",
    })
  }

  if (values.guideline__updated_by) {
    tables[1].headers.push({
      title: "Updated By",
      description: "User ID of the guideline updater goes here...",
    })
  }

  if (values.guideline__created_at) {
    tables[1].headers.push({
      title: "Created At",
      description: "ISO creation date string of guideline goes here...",
    })
  }

  if (values.guideline__updated_at) {
    tables[1].headers.push({
      title: "Updated At",
      description: "ISO update date string of guideline goes here...",
    })
  }

  if (!values.ratings) {
    return tables
  }

  tables.push({
    title: "Ratings",
    headers: [
      {
        title: "ID",
        description: "Rating ID goes here...",
      },
      {
        title: "Rating",
        description: "helpful | not_helpful",
      },
      {
        title: "Guideline ID",
        description: "Guideline ID of the rating goes here...",
      },
    ],
  })

  if (values.rating__author_id) {
    tables[2].headers.push({
      title: "Author ID",
      description: "User ID of the rating author goes here...",
    })
  }

  if (values.rating__updated_by) {
    tables[2].headers.push({
      title: "Updated By",
      description: "User ID of the rating updater goes here...",
    })
  }

  if (values.rating__created_at) {
    tables[2].headers.push({
      title: "Created At",
      description: "ISO creation date string of rating goes here...",
    })
  }

  if (values.rating__updated_at) {
    tables[2].headers.push({
      title: "Updated At",
      description: "ISO update date string of rating goes here...",
    })
  }

  return tables
}

export const ResponsePreview = ({ values, exportType, setExportType }: Props) => {
  const val = buildResponseFromValues(values)
  const tables = buildCsvResponseFromValues(values)

  return (
    <div className="text-md flex h-full flex-col gap-3 overflow-y-hidden rounded-md border p-5 py-3 font-semibold">
      <Tabs className="w-full" value={exportType} onValueChange={(v) => setExportType(v as "json" | "csv")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="json">JSON</TabsTrigger>
          <TabsTrigger value="csv">CSV</TabsTrigger>
        </TabsList>
      </Tabs>
      <Separator />
      {exportType === "csv" ? (
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
          {tables.map((table) => (
            <div key={table.title} className="mt-4 flex flex-col gap-4">
              <h1 className="flex items-center">
                <TableIcon className="mr-2 h-5 w-5" />
                {table.title}
              </h1>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Column</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="font-normal">
                  {table.headers.map((header) => (
                    <TableRow key={table.title + header.title}>
                      <TableCell>{header.title}</TableCell>
                      <TableCell>{header.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Separator />
            </div>
          ))}
        </div>
      ) : (
        <JSONPretty
          className="flex-1 overflow-y-auto text-sm"
          id="json-pretty"
          data={val}
          theme={{
            key: "color: green;",
          }}
        />
      )}
    </div>
  )
}
