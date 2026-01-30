// Theme Switching Logic
const themeBtns = document.querySelectorAll('.theme-btn');
const body = document.body;

const setTheme = (theme) => {
    // Remove all theme classes
    body.classList.remove('theme-default', 'theme-tech', 'theme-minimal');
    // Add selected theme class
    body.classList.add(`theme-${theme}`);

    // Update button states
    themeBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === theme);
    });

    // Persist theme
    localStorage.setItem('preferred-theme', theme);
};

// Initialize theme
const savedTheme = localStorage.getItem('preferred-theme') || 'default';
setTheme(savedTheme);

// Add event listeners to buttons
themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        setTheme(btn.dataset.theme);
    });
});
