/**
 * Helpers for displaying users safely.
 *
 * A user may have a null displayName AND a null username (e.g. a GitHub
 * account that exposed neither). These helpers guarantee a usable string
 * so the UI never calls .charAt() on null.
 */

export function userLabel(user) {
    return (user && (user.displayName || user.username)) || 'Unknown user';
}

export function userInitial(user) {
    return userLabel(user).charAt(0).toUpperCase();
}