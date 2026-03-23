export const getAuthToken = () => {
    const path = window.location.pathname;
    if (
        path === '/candidate-jobs' ||
        path === '/candidate-dashboard' ||
        path === '/candidate-interviews-complete' ||
        path === '/mock-interview' ||
        path.startsWith('/mock-interview-report') ||
        path.startsWith('/apply/') ||
        (path.startsWith('/interview/') && !path.startsWith('/interview-results'))
    ) {
        return localStorage.getItem('candidate_token');
    }
    return localStorage.getItem('recruiter_token');
};

export const getAuthUser = () => {
    const path = window.location.pathname;
    if (
        path === '/candidate-jobs' ||
        path === '/candidate-dashboard' ||
        path === '/candidate-interviews-complete' ||
        path === '/mock-interview' ||
        path.startsWith('/mock-interview-report') ||
        path.startsWith('/apply/') ||
        (path.startsWith('/interview/') && !path.startsWith('/interview-results'))
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
    // Notify other tabs
    notifyAuthChange();
};

export const clearAuth = (role: 'recruiter' | 'candidate') => {
    localStorage.removeItem(`${role}_token`);
    localStorage.removeItem(`${role}_user`);
    // Notify other tabs
    notifyAuthChange();
};

// Cross-tab notification helper
function notifyAuthChange() {
    try {
        const channel = new BroadcastChannel('recruitai_auth');
        channel.postMessage({ type: 'AUTH_CHANGE' });
        channel.close();
    } catch (e) {
        // BroadcastChannel not supported — storage event is the fallback
    }
}
