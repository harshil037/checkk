import useSWR from 'swr'
import fetcher from './fetch'
import { useRef, useEffect } from 'react'

export const useUser = () => {
  const { data, mutate } = useSWR('/api/user', fetcher)
  const user = data && data.user
  return [user, { mutate }]
}

export const useUsers = () => {
  const { data, mutate } = useSWR('/api/users', fetcher)
  const users = data && data.users
  return [users, { mutate }]
}

export const useClients = () => {
  const { data, mutate } = useSWR('/api/clients', fetcher)
  const clients = data && data.clients
  return [clients, { mutate }]
}

export const useDomains = (anonymousToken = '') => {
  if (anonymousToken == '') {
    const { data, mutate } = useSWR('/api/domains', fetcher)
    const domains = data && data.domains
    return [domains, { mutate }]
  } else {
    const { data, mutate } = useSWR('/api/domains', (url) => {
      return getWithToken(url, anonymousToken)
    })
    const domains = data && data.domains
    return [domains, { mutate }]
  }
}

const getWithToken = (url, token) => {
  return fetch(url, {
    method: 'get',
    headers: { 'x-anonymous-token': token },
  }).then((r) => r.json())
}

export const useIsMounted = () => {
  const isMounted = useRef(false)
  useEffect(() => {
    isMounted.current = true
    return () => (isMounted.current = false)
  }, [])
  return isMounted
}

export const getApi = async (url) => {
  const res = await fetch(url, {
    method: 'get',
    headers: { 'Content-Type': 'application/json' },
  })
  const jsonRes = res.status == 200 ? await res.json() : null
  return { ...jsonRes, status: res.status }
}

export const api = async (url, method, headers, body = null) => {
  const res = body
    ? await fetch(url, {
        method: method,
        headers: headers,
        body: body,
      })
    : await fetch(url, {
        method: method,
        headers: headers,
      })
  const jsonRes = await res.json()
  return { jsonRes, status: res.status }
}

export const useAutoFocus = () => {
  const focused = useRef(null);

  useEffect(() => {
    if (focused.current) {
      focused.current?.focus();
    }
  }, [focused?.current]);

  return focused;
};