import { useUpdateDemographicsMutation } from "@/generated/graphql";
import { useCallback, useState } from "react";

export interface UseDemographicsSurveyOptions {
    userId: string;
}

export default function useDemographicsSurvey(options: UseDemographicsSurveyOptions) {
    const { userId } = options ?? {};
    const [newDemographics, setNewDemographics] = useState({});
    const [updateDemographicsMutation] = useUpdateDemographicsMutation();
    const saveDemographics = useCallback(() => {
        updateDemographicsMutation({
            variables: {
                userId,
                demographics: newDemographics,
            }
        });
    }, [newDemographics, updateDemographicsMutation, userId]);
    const expandDemographics = useCallback((key: string, value: string) => {
        setNewDemographics((demographics) => {
            return {
                ...demographics,
                [key]: value,
            };
        });
    }, [setNewDemographics]);

    return {
        newDemographics,
        expandDemographics,
        saveDemographics,
    };
}
