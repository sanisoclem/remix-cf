import { useMatches } from "@remix-run/react"

export const useParentData = <T>(path: string): T => {
  const matches = useMatches()
  const data = matches.find((match) => match.pathname === path)?.data

  if (data === undefined || data === null)
    throw new Error('parent data not found');

  return data as T
}