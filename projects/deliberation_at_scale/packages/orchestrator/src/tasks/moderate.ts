// import { Helpers } from "graphile-worker";
import supabase from "../lib/supabase";
import openai from "../lib/openai";
import { Database } from "src/generated/database.types";

type Message = Database["public"]["Tables"]["messages"]["Row"]

let isUpdating = false;

export default async function moderate(
    message: Message,
    // helpers: Helpers
) {
    console.log(message);
    // GUARD
    if (!message) {
        console.error("No message in payload");
    } else {
        console.log(message.content);
    }

    const response = await openai.moderations.create({
        input: message.content,
    });

    console.log(JSON.stringify(response));

    if (response.results[0].flagged) {
        console.log("Message Flagged!");

        if (isUpdating) {
            return;
        }

        const flaggedTrue: string[] = [];

        response.results.forEach((result) => {
            const categories = result.categories;
            for (const flag in categories) {
                if (categories[flag as keyof typeof categories] === true) {
                    flaggedTrue.push(flag);
                }
            }
        });

        // update the message
        isUpdating = true;
        try {
            const result = await supabase
                .from("messages")
                .update({
                    content:
            "Edit! This message has been flagged as: " +
            flaggedTrue.join(", ") +
            ".",
                    type: "bot",
                })
                .eq("id", message.id);
            const hasError = !!result.error;

            if (hasError) {
                throw new Error(result.error.message);
            }
        } catch (error) {
            // TODO: handle errors
        }

        isUpdating = false;
    }
}
