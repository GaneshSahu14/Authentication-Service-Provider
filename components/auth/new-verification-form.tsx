"use client";

import { BeatLoader } from "react-spinners";
import { CardWrapper } from "./card-wrapper";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { newVerification } from "@/src/actions/new-verification";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";

export const NewVerificationForm = () => {
    const [error, setError] = useState<string>("");  // ✅ Always a string
    const [success, setSuccess] = useState<string>("");  // ✅ Always a string
    const [loading, setLoading] = useState<boolean>(true);  // ✅ Track loading state

    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    useEffect(() => {
        if (success || error) return;  // ✅ Prevent unnecessary re-renders
        if (!token) {
            setError("Missing token!");
            setLoading(false);
            return;
        }

        setLoading(true);  // Start loading before API call
        newVerification(token)
            .then((data) => {
                setError(data?.error || "");  // ✅ Ensure error is always a string
                setSuccess(data?.success || "");  // ✅ Ensure success is always a string
            })
            .catch(() => setError("Something went wrong!"))
            .finally(() => setLoading(false));  // ✅ Ensure loading stops
    }, [token]);

    return (
        <CardWrapper 
            headerLabel="Confirming your verification" 
            backButtonLabel="Back to login" 
            backButtonHref="/auth/login"
        >
            <div className="w-full flex flex-col items-center justify-center">
                {loading ? <BeatLoader /> : (
                    <>
                        {success ? <FormSuccess message={success} /> : <FormError message={error} />}
                    </>
                )}
            </div>
        </CardWrapper>
    );
};
