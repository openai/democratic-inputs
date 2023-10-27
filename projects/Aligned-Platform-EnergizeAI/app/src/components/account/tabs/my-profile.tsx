"use client"

import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import QueryDataLoader from "@/components/ui/query-data-loader"
import { SectionHeader } from "@/components/ui/section-header"
import { Separator } from "@/components/ui/separator"
import { SmallSpinner } from "@/components/ui/small-spinner"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { energizeEngine } from "@/lib/energize-engine"
import { ProfileFormSchema } from "@energizeai/engine"
import { zodResolver } from "@hookform/resolvers/zod"

export function MyProfile() {
  const form = useForm<z.infer<typeof ProfileFormSchema>>({
    resolver: zodResolver(ProfileFormSchema),
    mode: "onChange",
  })

  const getProfileDataQuery = energizeEngine.users.getProfileData.useQuery(undefined, {
    onSuccess: (data) => {
      form.reset(data)
    },
    refetchOnWindowFocus: false,
  })

  const updateProfileMutation = energizeEngine.users.updateProfile.useMutation()
  function onSubmit(data: z.infer<typeof ProfileFormSchema>) {
    updateProfileMutation.mutate(data, {
      onSuccess: () => {
        toast({
          title: "Success!",
          description: "Your profile has been updated.",
          variant: "success",
        })
      },
      onError: (error) => {
        toast({
          title: "Error!",
          description: error.message,
          variant: "destructive",
        })
      },
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <SectionHeader title="Profile" description="Update your profile information." />
        <Separator />
        <QueryDataLoader queryResults={getProfileDataQuery} showLoadOnFetch={true}>
          <QueryDataLoader.IsSuccess>
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter username..." {...field} />
                  </FormControl>
                  <FormDescription>
                    This is your public display name. It can be your real name or a pseudonym.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter first name..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter last name..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Tell us a little bit about yourself" className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={getProfileDataQuery.isLoading || updateProfileMutation.isLoading}>
              Update profile
              {updateProfileMutation.isLoading && <SmallSpinner className="ml-2" />}
            </Button>
          </QueryDataLoader.IsSuccess>
        </QueryDataLoader>
      </form>
    </Form>
  )
}
