import { QueryClient, QueryFunction } from "@tanstack/react-query";

// In production, VITE_API_URL points to Yandex Cloud Function
// In development, if not set, use local relative paths
const API_BASE_URL = import.meta.env.VITE_API_URL;
const IS_EXTERNAL_API = !!API_BASE_URL;

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  let fullUrl = url;
  
  // If external API is configured (production), transform the URL
  if (url.startsWith("/api") && IS_EXTERNAL_API && API_BASE_URL) {
    const endpoint = url.replace("/api/", "");
    fullUrl = `${API_BASE_URL}?action=${endpoint}`;
  }
    
  const res = await fetch(fullUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: IS_EXTERNAL_API ? "omit" : "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
