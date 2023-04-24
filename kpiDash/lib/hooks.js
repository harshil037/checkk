import useSWR from 'swr'
import fetcher from './fetch'

export const useUser = () => {
    const { data , mutate } = useSWR('api/user', fetcher)
    const user = data && data.user
    return [user, {mutate}]
}