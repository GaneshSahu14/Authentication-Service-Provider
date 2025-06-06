"use client";

import { CardWrapper } from "@/components/auth/card-wrapper";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RegisterSchema } from "../../src/schemas";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { login } from "../../src/actions/login";
import { useState, useTransition } from "react";
import { register } from "../../src/actions/register";

export const RegisterForm = () => {
    const [ error, setError ] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isPending, startTransition] = useTransition();
    const form = useForm<z.infer<typeof RegisterSchema>>({ resolver: zodResolver(RegisterSchema), defaultValues: { email: "", password: "",name: "" } });
    const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
        setError(""); setSuccess("");
        startTransition(() => {register(values) .then((data) => { setError(data.error); setSuccess(data.success) })});
    }
    return (
        <CardWrapper headerLabel="Create an account" backButtonLabel="Already have an account?" backButtonHref="/auth/login" showSocial>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <div> 
                                        <Input {...field} disabled = {isPending} placeholder="Ravi" />
                                        <FormMessage />
                                    </div>
                                </FormControl>
                            </FormItem>
                        )}
                        />
                        <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <div> 
                                        <Input {...field} disabled = {isPending} placeholder="abc@example.com" type="email" />
                                        <FormMessage />
                                    </div>
                                </FormControl>
                            </FormItem>
                        )}
                        />
                        <FormField control={form.control} name="password" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <div> 
                                        <Input {...field} disabled = {isPending} placeholder="************" type="password" />
                                        <FormMessage />
                                    </div>
                                </FormControl>
                            </FormItem>
                        )}
                        />
                    </div>
                    <FormError message={error ?? ""} />
                    <FormSuccess message={success ?? ""} />
                    <Button disabled = {isPending} type="submit" className="w-full">
                        Create Account
                    </Button>
                </form>
            </Form>
        </CardWrapper>
    );
};