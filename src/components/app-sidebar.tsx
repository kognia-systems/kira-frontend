"use client";

import * as React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

const formSchema = z.object({
  avatarId: z.string().min(10, {
    message: "Avatar ID must be at least 10 characters.",
  }),
  voiceId: z.string().min(10, {
    message: "Voice ID must be at least 10 characters.",
  }),
  knowledgeBase: z.string().max(500, {
    message: "Knowledge Base must be max 500 characters.",
  }),
});

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      avatarId: "Hi",
      voiceId: "",
      knowledgeBase: "",
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }

  return (
    <Sidebar {...props}>
        <SidebarHeader> Configuración </SidebarHeader>
        <SidebarContent className="p-4">
          <SidebarGroup />
          <SidebarMenu>
            <SidebarMenuItem>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="avatarId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Avatar ID</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Avatar ID"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          This is your custom avatar id.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="voiceId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Voice ID</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Voice ID"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          This is your custom voice id.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="knowledgeBase"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Knowlegde Base</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter the prompt"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">Guardar</Button>
                </form>
              </Form>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarGroup />
        </SidebarContent>
    </Sidebar>
  );
}
