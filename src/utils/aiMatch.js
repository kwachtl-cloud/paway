export function calculateAIMatch(petTags, providerTags) {
  if (!petTags || !providerTags || petTags.length === 0 || providerTags.length === 0) {
    return 0
  }

  const petTagsLower = petTags.map((t) => t.toLowerCase())
  const providerTagsLower = providerTags.map((t) => t.toLowerCase())

  let matches = 0
  providerTagsLower.forEach((pt) => {
    petTagsLower.forEach((tt) => {
      if (pt.includes(tt) || tt.includes(pt)) {
        matches++
      }
    })
  })

  const maxPossibleMatches = Math.max(petTags.length, providerTags.length)
  const matchPercentage = Math.round((matches / maxPossibleMatches) * 100)

  return Math.min(matchPercentage, 100)
}

export function getMatchColor(percentage) {
  if (percentage >= 80) return 'text-green-600 bg-green-50 border-green-200'
  if (percentage >= 50) return 'text-amber-600 bg-amber-50 border-amber-200'
  return 'text-red-600 bg-red-50 border-red-200'
}
