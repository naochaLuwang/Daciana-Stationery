export function generateVariantCombinations(selectedOptions: any[]) {
    if (selectedOptions.length === 0) return []

    return selectedOptions.reduce((acc, curr) => {
        if (acc.length === 0) {
            return curr.variant_option_values.map((v: any) => ({
                title: v.value,
                // We store optionId and valueId so the action knows how to link them
                combination: [{ optionId: curr.id, valueId: v.id }]
            }))
        }

        return acc.flatMap((prev: any) =>
            curr.variant_option_values.map((v: any) => ({
                title: `${prev.title} / ${v.value}`,
                combination: [...prev.combination, { optionId: curr.id, valueId: v.id }]
            }))
        )
    }, [])
}