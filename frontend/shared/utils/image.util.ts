/**
 * Utility to generate full image URLs from backend paths.
 * Returns undefined if path is missing, which prevents the browser from
 * attempting to download the current page as an image (common issue with empty string src).
 */
export const getImageUrl = (path: string | null | undefined): string | undefined => {
    if (!path) return undefined;
    if (path.startsWith('http') || path.startsWith('blob:')) return path;
    const baseUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    return `${baseUrl}/${path.replace(/\\/g, '/')}`;
};
