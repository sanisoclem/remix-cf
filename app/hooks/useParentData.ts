import { useMatches } from "@remix-run/react"

export const useParentData = <T>(id: string): T => {
  const matches = useMatches()
  const data = matches.find((match) => match.id === id)?.data
  console.log(JSON.stringify(matches));
  if (data === undefined || data === null)
    throw new Error('parent data not found');

  return data as T
}