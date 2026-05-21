const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
    throw new Error('VITE_API_URL is not set.');
}

async function request(method, path, body) {
    const options = {
        method,
        credentials: 'include',
        headers: {},
    };

    // TODO: support FormData for uploads later
    if (body !== undefined) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_URL}${path}`, options);

    let data = {};
    try {
        data = await response.json();
    } catch {
        // empty response body (204, etc.)
    }

    if (!response.ok) {
        const error = new Error(data.error || `HTTP ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
    }

    return data;
}

const api = {
    get: (path) => request('GET', path),

    post: (path, body) => request('POST', path, body),

    patch: (path, body) => request('PATCH', path, body),

    delete: (path) => request('DELETE', path),
};

export default api;