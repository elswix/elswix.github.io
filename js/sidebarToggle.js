const sidebarToggle = document.getElementById('sidebarToggle');
sidebarToggle.addEventListener('click', function () {
    const isActive = document.querySelector('.sidebar').classList.toggle('active');
    sidebarToggle.style.backgroundColor = isActive ? '#333' : '#111';
});