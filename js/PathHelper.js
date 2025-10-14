// PathHelper.js - Automatically handle GitHub Pages repository paths
(function() {
    // Detect if we're running on GitHub Pages
    const isGitHubPages = window.location.hostname.includes('.github.io');
    const repositoryName = 'planet_conquest'; // Your repository name
    
    // Create base path
    window.basePath = isGitHubPages ? `/${repositoryName}` : '';
    
    // Helper function to get correct path
    window.getPath = function(relativePath) {
        // Remove leading slash if present
        relativePath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
        return window.basePath + (relativePath ? '/' + relativePath : '');
    };
    
    // Helper function for navigation
    window.navigateTo = function(page) {
        window.location.href = window.getPath(page);
    };
    
    // Auto-fix links and src attributes after page load
    document.addEventListener('DOMContentLoaded', function() {
        // Fix all relative links
        const links = document.querySelectorAll('a[href]:not([href^="http"]):not([href^="/"]):not([href^="#"])');
        links.forEach(link => {
            const originalHref = link.getAttribute('href');
            if (originalHref && !originalHref.startsWith(window.basePath)) {
                link.href = window.getPath(originalHref);
            }
        });
        
        // Fix script src attributes for dynamically loaded scripts
        const scripts = document.querySelectorAll('script[src]:not([src^="http"]):not([src^="/"])');
        scripts.forEach(script => {
            const originalSrc = script.getAttribute('src');
            if (originalSrc && !originalSrc.startsWith(window.basePath)) {
                // Don't modify already loaded scripts, just note the pattern
                console.log('Script path pattern:', originalSrc, '-> would be:', window.getPath(originalSrc));
            }
        });
        
        // Fix CSS link hrefs
        const cssLinks = document.querySelectorAll('link[href]:not([href^="http"]):not([href^="/"])');
        cssLinks.forEach(link => {
            const originalHref = link.getAttribute('href');
            if (originalHref && !originalHref.startsWith(window.basePath)) {
                link.href = window.getPath(originalHref);
            }
        });
    });
    
    console.log('PathHelper initialized:', {
        isGitHubPages: isGitHubPages,
        basePath: window.basePath,
        currentURL: window.location.href
    });
})();