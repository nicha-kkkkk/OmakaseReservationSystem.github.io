// frontend/History/historyAdmin.js

// ------------------ เมนู ------------------
const menuToggle = document.querySelector(".menu-toggle");
const navMenu = document.querySelector(".nav-menu");

menuToggle.addEventListener("click", () => {
    navMenu.classList.toggle("active");
    menuToggle.textContent = navMenu.classList.contains("active") ? "✕" : "☰";
});

document.addEventListener("click", (e) => {
    if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
        navMenu.classList.remove("active");
        menuToggle.textContent = "☰";
    }
});

function positionNavMenu() {
    const header = document.querySelector("header");
    const navMenu = document.querySelector(".nav-menu");
    if (!header || !navMenu) return;
    const rect = header.getBoundingClientRect();
    navMenu.style.top = rect.bottom + 8 + "px";
}

window.addEventListener("load", positionNavMenu);
window.addEventListener("resize", positionNavMenu);

// ------------------ ดึงข้อมูลการจอง (ของลูกค้าทั้งหมดสำหรับแอดมิน) ------------------
let reservations = [];
let currentPage = 1;
const rowsPerPage = 3;

async function fetchReservations() {
    const listContainer = document.getElementById("reservation-list");

    try {
        const res = await fetch("http://127.0.0.1:8080/api/admin/reservations/all");
        const data = await res.json();

        if (!data.reservations || data.reservations.length === 0) {
            listContainer.innerHTML = "<p>ไม่พบข้อมูลการจอง</p>";
            return;
        }

        reservations = data.reservations;
        renderReservations(1);
    } catch (err) {
        console.error("Fetch error:", err);
        listContainer.innerHTML = "<p>เกิดข้อผิดพลาดในการโหลดข้อมูล</p>";
    }
}

// ------------------ แสดงข้อมูลการจอง ------------------
function renderReservations(page) {
    currentPage = page;
    const listContainer = document.getElementById("reservation-list");
    listContainer.innerHTML = "";

    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageItems = reservations.slice(start, end);

    pageItems.forEach(r => {
        const customerName = r.user_id?.name || "ไม่ระบุชื่อ";

        const date = r.reservation_time ? new Date(r.reservation_time) : null;
        const formattedDate = date ? `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}` : "-";

        const card = document.createElement("div");
        card.className = "reservation-card";
        card.innerHTML = `
            <div class="course-title">${r.course_name || "-"}</div>
            <div class="detail-line">
                <span>วันที่ ${formattedDate}</span>
                <span>เวลา ${r.reservation_hour || "-"}</span>
            </div>
            <div class="detail-line">
                <span>จำนวนคน ${r.number_of_people || "-"}</span>
                <span>ราคา ${r.course_price && r.number_of_people ? (r.course_price * r.number_of_people).toLocaleString("th-TH") + " บาท" : "-"}</span>
            </div>
            <a href="#" class="view-more" style="color:white;">ดูเพิ่มเติม</a>
            <div class="extra-details" style="display: none;">
                <p>ลูกค้า: ${customerName}</p>
                <p>อีเมล: ${r.user_id?.email || "-"}</p>
                <p>เบอร์โทร: ${r.user_id?.phone || "-"}</p>
                <p>รายการอาหารที่แพ้:<br>
                ${r.allergies && r.allergies.length > 0 ? r.allergies.join("<br>") : "ไม่มี"}</p>
                <p>เลือกเพื่อแทนรายการอาหารที่แพ้:<br>
                ${r.selected_menu && r.selected_menu.length > 0 ? r.selected_menu.join("<br>") : "ให้ทางร้านจัดการเลือกให้"}</p>
                <p>สถานะ: ${r.status || "-"}</p>
                <p>เช็คอิน: ${r.checkin_status || "ยังไม่ได้เช็คอิน"}</p> <!-- ✅ แสดงสถานะเช็คอิน -->
            </div>
        `;
        listContainer.appendChild(card);
    });

    // toggle ดูเพิ่มเติม
    document.querySelectorAll(".reservation-card .view-more").forEach(btn => {
        const extra = btn.nextElementSibling;
        extra.style.display = "none";
        btn.textContent = "ดูเพิ่มเติม";

        btn.addEventListener("click", e => {
            e.preventDefault();
            if (extra.style.display === "none") {
                extra.style.display = "block";
                btn.textContent = "ปิดรายละเอียด";
            } else {
                extra.style.display = "none";
                btn.textContent = "ดูเพิ่มเติม";
            }
        });
    });

    renderPagination();
}

// ------------------ แสดงปุ่ม Pagination ------------------
function renderPagination() {
    const paginationContainer = document.getElementById("pagination");
    if (!paginationContainer) return;
    paginationContainer.innerHTML = "";

    const totalPages = Math.ceil(reservations.length / rowsPerPage);

    // ปุ่มย้อนกลับ / หน้าแรก
    if (currentPage > 1) {
        const backBtn = document.createElement("button");
        backBtn.textContent = "ย้อนกลับ";
        backBtn.style.backgroundColor = "#730606";
        backBtn.style.color = "#fff";
        backBtn.style.border = "none";
        backBtn.style.borderRadius = "6px";
        backBtn.style.padding = "6px 12px";
        backBtn.style.margin = "0 3px";
        backBtn.style.cursor = "pointer";
        backBtn.onclick = () => renderReservations(currentPage - 1);
        paginationContainer.appendChild(backBtn);
    } else {
        const firstBtn = document.createElement("button");
        firstBtn.textContent = "หน้าแรก";
        firstBtn.style.backgroundColor = "#ccc";
        firstBtn.style.color = "#fff";
        firstBtn.style.border = "none";
        firstBtn.style.borderRadius = "6px";
        firstBtn.style.padding = "6px 12px";
        firstBtn.style.margin = "0 3px";
        firstBtn.disabled = true;
        paginationContainer.appendChild(firstBtn);
    }

    // เลขหน้า
    for (let i = 1; i <= totalPages; i++) {
        const pageSpan = document.createElement("span");
        pageSpan.textContent = i;
        pageSpan.style.margin = "0 6px";
        pageSpan.style.cursor = "pointer";
        pageSpan.style.fontWeight = (i === currentPage) ? "bold" : "normal";
        pageSpan.onclick = () => renderReservations(i);
        paginationContainer.appendChild(pageSpan);
    }

    // ปุ่มถัดไป
    if (currentPage < totalPages) {
        const nextBtn = document.createElement("button");
        nextBtn.textContent = "ถัดไป";
        nextBtn.style.backgroundColor = "#730606";
        nextBtn.style.color = "#fff";
        nextBtn.style.border = "none";
        nextBtn.style.borderRadius = "6px";
        nextBtn.style.padding = "6px 12px";
        nextBtn.style.margin = "0 3px";
        nextBtn.style.cursor = "pointer";
        nextBtn.onclick = () => renderReservations(currentPage + 1);
        paginationContainer.appendChild(nextBtn);
    }
}

// ------------------ ออกจากระบบ ------------------
const logoutBtn = document.querySelector(".logout");
logoutBtn?.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("staffName");
    localStorage.removeItem("userId");
    localStorage.removeItem("user");
    localStorage.removeItem("reservationId");

    window.location.href = "../loginEmployee.html";
});

// ------------------ โหลดข้อมูลเมื่อเปิดหน้า ------------------
document.addEventListener("DOMContentLoaded", fetchReservations);
