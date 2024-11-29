document.addEventListener("DOMContentLoaded", function () {
    const links = document.querySelectorAll("a");
    // Đặt mặc định active theo URL
    const currentPath = window.location.pathname; // Lấy URL hiện tại
    links.forEach((link) => {
        if (link.getAttribute("href") === currentPath || 
            (currentPath === "/" && link.getAttribute("href") === "/home")) {
            link.classList.add("active");
        }
    });
    // Thêm sự kiện click để cập nhật trạng thái active
    links.forEach((link) => {
        link.addEventListener("click", function () {
            // Xóa class "active" khỏi tất cả các thẻ <a>
            links.forEach((item) => item.classList.remove("active"));
            // Thêm class "active" vào thẻ <a> được bấm
            this.classList.add("active");
        });
    });
});
