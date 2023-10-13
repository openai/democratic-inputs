import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "../ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import QueryDataLoader from "../ui/query-data-loader"
import { SectionHeader } from "../ui/section-header"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Separator } from "../ui/separator"
import { SmallSpinner } from "../ui/small-spinner"
import { useToast } from "../ui/use-toast"
import { energizeEngine } from "@/lib/energize-engine"
import { useAuth } from "@clerk/clerk-react"
import { zodResolver } from "@hookform/resolvers/zod"

const formSchema = z.object({
  ageGroup: z.enum(["Under 18", "18-24", "25-34", "35-44", "45-54", "55-64", "65+", "Prefer not to say"]).nullish(),
  race: z.string().nullish(),
  gender: z.string().nullish(),
})

type FormValues = z.infer<typeof formSchema>

export const DemoForm = () => {
  const { toast } = useToast()
  const { userId } = useAuth()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  })

  const userQuery = energizeEngine.users.getUserById.useQuery(userId as string, {
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      form.reset({
        ageGroup: data?.ageGroup ?? null,
        race: data?.race ?? null,
        gender: data?.gender ?? null,
      })
    },
  })

  const submitMutation = energizeEngine.users.saveDemoData.useMutation()
  function onSubmit(data: FormValues) {
    submitMutation.mutate(
      {
        ageGroup: data.ageGroup ?? null,
        race: data.race ?? null,
        gender: data.gender ?? null,
      },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Successfully saved demographic information.",
            variant: "success",
          })
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          })
        },
      },
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <SectionHeader
          title="Demographics"
          description="We are committed to fostering diversity. Collecting demographic information helps us ensure Aligned reflects a wide range of perspectives. This information will be kept confidential and will only be used for statistical purposes to improve the community."
        />
        <Separator />
        <QueryDataLoader queryResults={userQuery} skeletonItems={3} showLoadOnFetch={true}>
          <QueryDataLoader.IsSuccess>
            <FormField
              control={form.control}
              name="ageGroup"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age Group</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="---" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Under 18">Under 18</SelectItem>
                        <SelectItem value="18-24">18-24</SelectItem>
                        <SelectItem value="25-34">25-34</SelectItem>
                        <SelectItem value="35-44">35-44</SelectItem>
                        <SelectItem value="45-54">45-54</SelectItem>
                        <SelectItem value="55-64">55-64</SelectItem>
                        <SelectItem value="65+">65+</SelectItem>
                        <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>Select your age group</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="race"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Race</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="---" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="White / Caucasian">White / Caucasian</SelectItem>
                        <SelectItem value="Black / African American">Black / African American</SelectItem>
                        <SelectItem value="Hispanic / Latino">Hispanic / Latino</SelectItem>
                        <SelectItem value="Asian">Asian</SelectItem>
                        <SelectItem value="Native American or Alaska Native">
                          Native American or Alaska Native
                        </SelectItem>
                        <SelectItem value="Native Hawaiian or Pacific Islander">
                          Native Hawaiian or Pacific Islander
                        </SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                        <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>Select your race</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="---" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="non-binary">Non-binary</SelectItem>
                        <SelectItem value="transgender male">Transgender Male</SelectItem>
                        <SelectItem value="transgender female">Transgender Female</SelectItem>
                        <SelectItem value="genderqueer / genderfluid">Genderqueer / Genderfluid</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer not to say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>Select your gender</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={submitMutation.isLoading}>
              Submit
              {submitMutation.isLoading && <SmallSpinner className="ml-2" />}
            </Button>
          </QueryDataLoader.IsSuccess>
        </QueryDataLoader>
      </form>
    </Form>
  )
}
