export const replaceTextVariables = (text: string, replacements: Record<string, string>) => {
    let newText = text;

    for (const [key, value] of Object.entries(replacements)) {
        newText = newText.replace(`[${key}]`, value);
    }

    return newText;
};
