const projectSidebar = document.querySelector('.project-sidebar');
const sidebarToggleButton = document.querySelector('.sidebar-toggle-button');

if (projectSidebar && sidebarToggleButton) {
    let isDragging = false;
    let hasMoved = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;

    sidebarToggleButton.addEventListener('pointerdown', (event) => {
        const sidebarBounds = projectSidebar.getBoundingClientRect();

        isDragging = true;
        hasMoved = false;
        startX = event.clientX;
        startY = event.clientY;
        startLeft = sidebarBounds.left;
        startTop = sidebarBounds.top;
        projectSidebar.style.transform = 'none';
        sidebarToggleButton.setPointerCapture(event.pointerId);
        sidebarToggleButton.style.cursor = 'grabbing';
    });

    sidebarToggleButton.addEventListener('pointermove', (event) => {
        if (!isDragging) {
            return;
        }

        const horizontalDistance = event.clientX - startX;
        const verticalDistance = event.clientY - startY;
        hasMoved = hasMoved || Math.abs(horizontalDistance) > 4 || Math.abs(verticalDistance) > 4;

        const sidebarWidth = projectSidebar.offsetWidth;
        const sidebarHeight = projectSidebar.offsetHeight;
        const nextLeft = Math.min(
            Math.max(0, startLeft + horizontalDistance),
            window.innerWidth - sidebarWidth
        );
        const nextTop = Math.min(
            Math.max(0, startTop + verticalDistance),
            window.innerHeight - sidebarHeight
        );

        projectSidebar.style.left = `${nextLeft}px`;
        projectSidebar.style.top = `${nextTop}px`;
    });

    sidebarToggleButton.addEventListener('pointerup', (event) => {
        isDragging = false;
        sidebarToggleButton.releasePointerCapture(event.pointerId);
        sidebarToggleButton.style.cursor = 'grab';
    });

    sidebarToggleButton.addEventListener('click', (event) => {
        if (hasMoved) {
            event.preventDefault();
            event.stopPropagation();
            hasMoved = false;
        }
    });
}
