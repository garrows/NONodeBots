/**
 * Listens for the app launching then creates the window.
 * Ignores the provided window size.
 *
 * @see http://developer.chrome.com/trunk/apps/app.window.html
 */
chrome.app.runtime.onLaunched.addListener(function () {
    // chrome.app.window.create('source.html', {
    chrome.app.window.create('index.html', {
        width: 1000,
        height: 800,
    });
});