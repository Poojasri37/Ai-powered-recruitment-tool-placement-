export const getAuthToken = () => {
    const path = window.location.pathname;
    if (
        path.startsWith('/candidate') ||
        path.startsWith('/apply') ||
        path.startsWith('/interview/') ||
        path === '/candidate-dashboard' ||
        path === '/candidate-jobs'
    ) {
        return localStorage.getItem('candidate_token');
    }
    return localStorage.getItem('recruiter_token');
};

export const getAuthUser = () => {
    const path = window.location.pathname;
    if (
        path.startsWith('/candidate') ||
        path.startsWith('/apply') ||
        path.startsWith('/interview/') ||
        path === '/candidate-dashboard' ||
        path === '/candidate-jobs'
    ) {
        const user = localStorage.getItem('candidate_user');
        return user ? JSON.parse(user) : null;
    }
    const user = localStorage.getItem('recruiter_user');
    return user ? JSON.parse(user) : null;
};

export const setAuth = (token: string, user: any) => {
    const role = user.role;
    localStorage.setItem(`${role}_token`, token);
    localStorage.setItem(`${role}_user`, JSON.stringify(user));
};

export const clearAuth = (role: 'recruiter' | 'candidate') => {
    localStorage.removeItem(`${role}_token`);
    localStorage.removeItem(`${role}_user`);
};
