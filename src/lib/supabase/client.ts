import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // Verificar que estamos en el navegador
          if (typeof document === 'undefined') return undefined
          
          const cookie = document.cookie
            .split('; ')
            .find(row => row.startsWith(`${name}=`))
          return cookie ? cookie.split('=')[1] : undefined
        },
        set(name: string, value: string, options: any) {
          // Verificar que estamos en el navegador
          if (typeof document === 'undefined') return
          
          let cookieString = `${name}=${value}`
          
          if (options?.maxAge) {
            cookieString += `; max-age=${options.maxAge}`
          }
          if (options?.path) {
            cookieString += `; path=${options.path}`
          }
          if (options?.domain) {
            cookieString += `; domain=${options.domain}`
          }
          if (options?.sameSite) {
            cookieString += `; samesite=${options.sameSite}`
          }
          if (options?.secure) {
            cookieString += '; secure'
          }
          
          document.cookie = cookieString
        },
        remove(name: string, options: any) {
          this.set(name, '', { ...options, maxAge: 0 })
        },
      },
    }
  )
}
