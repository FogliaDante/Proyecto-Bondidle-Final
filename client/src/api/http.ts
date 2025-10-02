const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';


export async function http<T>(path: string, opts: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}${path}`, {
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        ...opts,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}