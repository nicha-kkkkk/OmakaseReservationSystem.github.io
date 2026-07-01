// // // frontend/History/history.js

// // ------------------ เมนู ------------------
// const menuToggle = document.querySelector(".menu-toggle");
// const navMenu = document.querySelector(".nav-menu");

// menuToggle.addEventListener("click", () => {
//     navMenu.classList.toggle("active");
//     menuToggle.textContent = navMenu.classList.contains("active") ? "✕" : "☰";
// });

// document.addEventListener("click", (e) => {
//     if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
//         navMenu.classList.remove("active");
//         menuToggle.textContent = "☰";
//     }
// });

// function positionNavMenu() {
//     const header = document.querySelector("header");
//     const navMenu = document.querySelector(".nav-menu");
//     if (!header || !navMenu) return;
//     const rect = header.getBoundingClientRect();
//     navMenu.style.top = rect.bottom + 8 + "px";
// }

// window.addEventListener("load", positionNavMenu);
// window.addEventListener("resize", positionNavMenu);

// // ------------------ ดึงข้อมูลการจอง ------------------
// let reservations = [];
// let currentPage = 1;
// const rowsPerPage = 3;
// async function fetchReservations() {
//     const listContainer = document.getElementById("reservation-list");
//     const customerId = localStorage.getItem("userId");

//     console.log("Fetching reservations for userId:", customerId);

//     if (!customerId) {
//         listContainer.innerHTML = "<p>ไม่พบข้อมูลลูกค้า กรุณาเข้าสู่ระบบ</p>";
//         return;
//     }

//     try {
//         const res = await fetch(`https://omakase-backend-li58.onrender.com/api/reservations/my?userId=${customerId}`);
//         const data = await res.json();
//         console.log("Reservations from API:", data); // 🔹 debug

//         if (!Array.isArray(data) || data.length === 0) {
//             listContainer.innerHTML = "<p>ไม่พบข้อมูลการจองของคุณ</p>";
//             return;
//         }

//         reservations = data;
//         renderReservations(1);
//     } catch (err) {
//         console.error("Fetch error:", err);
//         listContainer.innerHTML = "<p>เกิดข้อผิดพลาดในการโหลดข้อมูล</p>";
//     }
// }


// function renderReservations(page) {
//     currentPage = page;
//     const listContainer = document.getElementById("reservation-list");
//     listContainer.innerHTML = "";

//     const start = (page - 1) * rowsPerPage;
//     const end = start + rowsPerPage;
//     const pageItems = reservations.slice(start, end);

//     pageItems.forEach(r => {
//         // ใช้ populated name
//         const customerName = r.user_id?.name || "ไม่ระบุชื่อ";

//         const date = r.reservation_time ? new Date(r.reservation_time) : null;
//         const formattedDate = date ? `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}` : "-";

//         const card = document.createElement("div");
//         card.className = "reservation-card";
//         card.innerHTML = `
//             <div class="course-title">${r.course_name || "-"}</div>
//             <div class="detail-line">
//                 <span>วันที่ ${formattedDate}</span>
//                 <span>เวลา ${r.reservation_hour || "-"}</span>
//             </div>
//             <div class="detail-line">
//                 <span>จำนวนคน ${r.number_of_people || "-"}</span>
//                 <span>ราคา ${r.course_price && r.number_of_people ? (r.course_price * r.number_of_people).toLocaleString("th-TH") + " บาท" : "-"}</span>
//             </div>
//             <a href="#" class="view-more">ดูเพิ่มเติม</a>
//             <div class="extra-details" style="display: none;">
//                 <p>ลูกค้า: ${customerName}</p>
//                 <p>รายการอาหารที่แพ้:<br>
//                 ${r.allergies && r.allergies.length > 0 ? r.allergies.join("<br>") : "ไม่มี"}</p>
//                 <p>เลือกเพื่อแทนรายการอาหารที่แพ้:<br>
//                 ${r.selected_menu && r.selected_menu.length > 0 ? r.selected_menu.join("<br>") : "ให้ทางร้านจัดการเลือกให้"}</p>
//                 <p>สถานะ: ${r.status || "-"}</p>
//             </div>
//         `;
//         listContainer.appendChild(card);
//     });

//     // toggle ดูเพิ่มเติม
//     document.querySelectorAll(".reservation-card .view-more").forEach(btn => {
//         const extra = btn.nextElementSibling;
//         extra.style.display = "none";
//         btn.textContent = "ดูเพิ่มเติม";

//         btn.addEventListener("click", e => {
//             e.preventDefault();
//             if (extra.style.display === "none") {
//                 extra.style.display = "block";
//                 btn.textContent = "ปิดรายละเอียด";
//             } else {
//                 extra.style.display = "none";
//                 btn.textContent = "ดูเพิ่มเติม";
//             }
//         });
//     });

//     renderPagination();
// }

// function renderPagination() {
//     const paginationContainer = document.getElementById("pagination");
//     if (!paginationContainer) return;
//     paginationContainer.innerHTML = "";

//     const totalPages = Math.ceil(reservations.length / rowsPerPage);

//     // ปุ่มย้อนกลับ / หน้าแรก
//     if (currentPage > 1) {
//         const backBtn = document.createElement("button");
//         backBtn.textContent = "ย้อนกลับ";
//         backBtn.style.backgroundColor = "#730606";
//         backBtn.style.color = "#fff";
//         backBtn.style.border = "none";
//         backBtn.style.borderRadius = "6px";
//         backBtn.style.padding = "6px 12px";
//         backBtn.style.margin = "0 3px";
//         backBtn.style.cursor = "pointer";
//         backBtn.onclick = () => renderReservations(currentPage - 1);
//         paginationContainer.appendChild(backBtn);
//     } else {
//         const firstBtn = document.createElement("button");
//         firstBtn.textContent = "หน้าแรก";
//         firstBtn.style.backgroundColor = "#ccc";
//         firstBtn.style.color = "#fff";
//         firstBtn.style.border = "none";
//         firstBtn.style.borderRadius = "6px";
//         firstBtn.style.padding = "6px 12px";
//         firstBtn.style.margin = "0 3px";
//         firstBtn.disabled = true;
//         paginationContainer.appendChild(firstBtn);
//     }

//     // เลขหน้า
//     for (let i = 1; i <= totalPages; i++) {
//         const pageSpan = document.createElement("span");
//         pageSpan.textContent = i;
//         pageSpan.style.margin = "0 6px";
//         pageSpan.style.cursor = "pointer";
//         pageSpan.style.fontWeight = (i === currentPage) ? "bold" : "normal";
//         pageSpan.onclick = () => renderReservations(i);
//         paginationContainer.appendChild(pageSpan);
//     }

//     // ปุ่มถัดไป
//     if (currentPage < totalPages) {
//         const nextBtn = document.createElement("button");
//         nextBtn.textContent = "ถัดไป";
//         nextBtn.style.backgroundColor = "#730606";
//         nextBtn.style.color = "#fff";
//         nextBtn.style.border = "none";
//         nextBtn.style.borderRadius = "6px";
//         nextBtn.style.padding = "6px 12px";
//         nextBtn.style.margin = "0 3px";
//         nextBtn.style.cursor = "pointer";
//         nextBtn.onclick = () => renderReservations(currentPage + 1);
//         paginationContainer.appendChild(nextBtn);
//     }
// }
// // ------------------ ออกจากระบบ ------------------
// const logoutBtn = document.querySelector(".logout");
// logoutBtn?.addEventListener("click", () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("userId");
//     localStorage.removeItem("user");
//     localStorage.removeItem("reservationId");
//     window.location.href = "../login.html";
// });
// document.addEventListener("DOMContentLoaded", fetchReservations);

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
    if (!header || !navMenu) return;
    const rect = header.getBoundingClientRect();
    navMenu.style.top = rect.bottom + 8 + "px";
}

window.addEventListener("load", positionNavMenu);
window.addEventListener("resize", positionNavMenu);

// ------------------ ดึงข้อมูลการจอง ------------------
let reservations = [];
let currentPage = 1;
const rowsPerPage = 3;

async function fetchReservations() {
    const listContainer = document.getElementById("reservation-list");
    const customerId = localStorage.getItem("userId");

    if (!customerId) {
        listContainer.innerHTML = "<p>ไม่พบข้อมูลลูกค้า กรุณาเข้าสู่ระบบ</p>";
        return;
    }

    try {
        const res = await fetch(`https://omakase-backend-li58.onrender.com/api/reservations/my?userId=${customerId}`);
        const data = await res.json();

        if (!Array.isArray(data) || data.length === 0) {
            listContainer.innerHTML = "<p>ไม่พบข้อมูลการจองของคุณ</p>";
            return;
        }

        reservations = data;
        renderReservations(1);
    } catch (err) {
        console.error("Fetch error:", err);
        listContainer.innerHTML = "<p>เกิดข้อผิดพลาดในการโหลดข้อมูล</p>";
    }
}

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

        // รีเซ็ตเวลาเพื่อคำนวณ diffDays ให้ถูกต้อง
        const today = new Date();
        today.setHours(0,0,0,0);
        if(date) date.setHours(0,0,0,0);

        const diffDays = date ? Math.ceil((date - today) / (1000 * 60 * 60 * 24)) : 0;
        const canReschedule = diffDays >= 3;

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
            <a href="#" class="view-more">ดูเพิ่มเติม</a>
            <div class="extra-details" style="display: none;">
                <p>ลูกค้า: ${customerName}</p>
                <p>รายการอาหารที่แพ้:<br>${r.allergies?.length ? r.allergies.join("<br>") : "ไม่มี"}</p>
                <p>เลือกเพื่อแทนรายการอาหารที่แพ้:<br>${r.selected_menu?.length ? r.selected_menu.join("<br>") : "ให้ทางร้านจัดการเลือกให้"}</p>
                <p>สถานะ: ${r.status || "-"}</p>
                <div class="button-area">
                    ${canReschedule ? `<button class="reschedule-btn" data-id="${r._id}">เลื่อนวันจอง</button>` 
                                    : `<button class="reschedule-btn" disabled>ไม่สามารถเลื่อนได้ (น้อยกว่า 3 วัน)</button>`}
                </div>
            </div>
        `;
        listContainer.appendChild(card);
    });

    // ดูรายละเอียดเพิ่มเติม
    document.querySelectorAll(".reservation-card .view-more").forEach(btn => {
        const extra = btn.nextElementSibling;
        btn.addEventListener("click", e => {
            e.preventDefault();
            extra.style.display = (extra.style.display === "none") ? "block" : "none";
            btn.textContent = (extra.style.display === "block") ? "ปิดรายละเอียด" : "ดูเพิ่มเติม";
        });
    });

// ------------------ ฟังก์ชัน Toast ------------------
function showToast(message, type = "info", duration = 3000) {
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.style.position = "fixed";
    toast.style.top = "20px";
    toast.style.right = "20px";
    toast.style.padding = "12px 20px";
    toast.style.borderRadius = "8px";
    toast.style.color = "#fff";
    toast.style.fontWeight = "bold";
    toast.style.boxShadow = "0 5px 15px rgba(0,0,0,0.3)";
    toast.style.zIndex = "99999";
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-20px)";
    toast.style.transition = "all 0.4s ease";

    switch(type) {
        case "success": toast.style.backgroundColor = "#28a745"; break; // เขียว
        case "error": toast.style.backgroundColor = "#dc3545"; break;   // แดง
        case "warning": toast.style.backgroundColor = "#ffc107"; toast.style.color = "#000"; break; // เหลือง
        default: toast.style.backgroundColor = "#007bff"; break;        // น้ำเงิน
    }

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateY(0)";
    }, 10);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(-20px)";
        setTimeout(() => toast.remove(), 400);
    }, duration);
}

// ------------------ เลื่อนวันจอง (Modal + เลือกวัน + เช็คที่นั่ง) ------------------
// ------------------ ฟังก์ชัน Toast ------------------
function showToast(message, type = "info", duration = 3000) {
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.style.position = "fixed";
    toast.style.top = "20px";
    toast.style.right = "20px";
    toast.style.padding = "12px 20px";
    toast.style.borderRadius = "8px";
    toast.style.color = "#fff";
    toast.style.fontWeight = "bold";
    toast.style.boxShadow = "0 5px 15px rgba(0,0,0,0.3)";
    toast.style.zIndex = "99999";
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-20px)";
    toast.style.transition = "all 0.4s ease";

    switch(type) {
        case "success": toast.style.backgroundColor = "#28a745"; break; // เขียว
        case "error": toast.style.backgroundColor = "#dc3545"; break;   // แดง
        case "warning": toast.style.backgroundColor = "#ffc107"; toast.style.color = "#000"; break; // เหลือง
        default: toast.style.backgroundColor = "#007bff"; break;        // น้ำเงิน
    }

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateY(0)";
    }, 10);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(-20px)";
        setTimeout(() => toast.remove(), 400);
    }, duration);
}

// ------------------ เลื่อนวันจอง (Modal + เลือกวัน + เช็คที่นั่ง) ------------------
// ------------------ เลื่อนวันจอง (Modal + เลือกวัน + เช็คนโยบายร้าน) ------------------
document.querySelectorAll(".reschedule-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const reservation = reservations.find(r => r._id === id);
        if (!reservation) return;

        // ------------------ สร้าง modal ------------------
        const modal = document.createElement("div");
        modal.style.position = "fixed";
        modal.style.top = "0";
        modal.style.left = "0";
        modal.style.width = "100%";
        modal.style.height = "100%";
        modal.style.background = "rgba(0,0,0,0.5)";
        modal.style.display = "flex";
        modal.style.justifyContent = "center";
        modal.style.alignItems = "center";
        modal.style.zIndex = "9999";

        const box = document.createElement("div");
        box.style.background = "#fff";
        box.style.padding = "20px";
        box.style.borderRadius = "12px";
        box.style.textAlign = "center";
        box.style.width = "320px";
        box.style.maxWidth = "90%";
        box.innerHTML = "<h3>เลือกวันใหม่</h3>";

        // ------------------ ช่องเลือกวัน ------------------
        const dateInput = document.createElement("input");
        dateInput.type = "date";
        dateInput.style.display = "block";
        dateInput.style.margin = "10px auto";
        dateInput.style.padding = "8px";
        dateInput.style.fontSize = "16px";

        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        dateInput.min = `${yyyy}-${mm}-${dd}`;

        // ------------------ กล่องนโยบายร้าน ------------------
        const policyContainer = document.createElement("div");
        policyContainer.className = "policy-container";
        policyContainer.style.marginTop = "12px";
        policyContainer.style.textAlign = "left";
        policyContainer.innerHTML = `
            <label style="display:block; margin-bottom:6px;">
                <input type="checkbox" name="acceptPolicy" class="big-checkbox">
                ยอมรับนโยบายของทางร้าน
            </label>
            <button type="button" id="togglePolicy"
                style="margin:8px 0; font-size:0.9rem; cursor:pointer; background:none; border:none; color:#730606; text-decoration:underline;">
                อ่านรายละเอียดเพิ่มเติม
            </button>
            <div id="policyDetails" style="display:none; margin-left:18px; font-size:0.9rem; line-height:1.5;">
                <li>ไม่สามารถเลื่อนการจองได้ภายใน 3 วันก่อนวันนัดหมาย</li>
                <li>การเลื่อนวันจองสามารถทำได้ไม่เกิน 30 วันจากวันที่จองเดิม</li>
                <li>จำกัดการเลื่อนสูงสุด 1 ครั้งต่อการจอง 1 ครั้ง</li>
            </div>
        `;

        // ------------------ ปุ่มยืนยัน/ยกเลิก ------------------
        const confirmBtn = document.createElement("button");
        confirmBtn.textContent = "ยืนยันการเลื่อนวัน";
        confirmBtn.style.backgroundColor = "#730606";
        confirmBtn.style.color = "#fff";
        confirmBtn.style.border = "none";
        confirmBtn.style.borderRadius = "6px";
        confirmBtn.style.padding = "8px 14px";
        confirmBtn.style.marginTop = "12px";
        confirmBtn.style.cursor = "pointer";

        const cancelBtn = document.createElement("button");
        cancelBtn.textContent = "ยกเลิก";
        cancelBtn.style.backgroundColor = "#ccc";
        cancelBtn.style.color = "#000";
        cancelBtn.style.border = "none";
        cancelBtn.style.borderRadius = "6px";
        cancelBtn.style.padding = "8px 14px";
        cancelBtn.style.marginTop = "12px";
        cancelBtn.style.marginLeft = "10px";
        cancelBtn.style.cursor = "pointer";

        // ------------------ ประกอบ modal ------------------
        box.appendChild(dateInput);
        box.appendChild(policyContainer);
        box.appendChild(confirmBtn);
        box.appendChild(cancelBtn);
        modal.appendChild(box);
        document.body.appendChild(modal);

        // ------------------ ปุ่มอ่าน/ซ่อนนโยบาย ------------------
        const togglePolicy = box.querySelector("#togglePolicy");
        const policyDetails = box.querySelector("#policyDetails");
        togglePolicy.addEventListener("click", () => {
            if (policyDetails.style.display === "none") {
                policyDetails.style.display = "block";
                togglePolicy.textContent = "ซ่อนรายละเอียด";
            } else {
                policyDetails.style.display = "none";
                togglePolicy.textContent = "อ่านรายละเอียดเพิ่มเติม";
            }
        });

        // ------------------ ปุ่มยืนยัน ------------------
        confirmBtn.addEventListener("click", async () => {
            const newDate = dateInput.value;
            const acceptPolicy = box.querySelector("input[name='acceptPolicy']");

            if (!acceptPolicy.checked) {
                showToast("⚠️ กรุณายอมรับนโยบายของทางร้านก่อนทำการเลื่อนวัน", "warning");
                return;
            }

            if (!newDate) {
                showToast("⚠️ กรุณาเลือกวันใหม่", "warning");
                return;
            }

            try {
                // เช็คจำนวนที่นั่ง
                const resAvailability = await fetch(`https://omakase-backend-li58.onrender.com/api/reservations/availability?date=${newDate}&course_name=${encodeURIComponent(reservation.course_name)}&reservation_hour=${encodeURIComponent(reservation.reservation_hour)}`);
                const availabilityData = await resAvailability.json();

                if (availabilityData.remaining < reservation.number_of_people) {
                    showToast(`⚠️ วันที่ ${newDate} มีที่ว่างไม่เพียงพอ กรุณาเลือกวันอื่น`, "error", 5000);
                    return;
                }

                // ถ้ามีที่ว่าง → ส่งคำขอเลื่อนวัน
                const resUpdate = await fetch(`https://omakase-backend-li58.onrender.com/api/reservations/${id}/reschedule`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ newDate })
                });

                const dataUpdate = await resUpdate.json();
                if (resUpdate.ok) {
                    showToast("🎉 เลื่อนวันจองสำเร็จ!", "success", 4000);
                    modal.remove();
                    fetchReservations(); // โหลดใหม่
                } else {
                    showToast("ขออภัย " + dataUpdate.message, "error", 5000);
                }
            } catch (err) {
                console.error(err);
                showToast("❌ ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้", "error", 5000);
            }
        });

        // ------------------ ปุ่มยกเลิก ------------------
        cancelBtn.addEventListener("click", () => modal.remove());
        modal.addEventListener("click", e => { if (e.target === modal) modal.remove(); });
    });
});


// --------------------- CSS Animation ---------------------
const style = document.createElement("style");
style.innerHTML = `
@keyframes fadeIn { from {opacity: 0;} to {opacity:1;} }
@keyframes slideDown { from {transform: translateY(-50px);} to {transform: translateY(0);} }
`;
document.head.appendChild(style);

renderPagination();

}


function renderPagination() {
    const paginationContainer = document.getElementById("pagination");
    if (!paginationContainer) return;
    paginationContainer.innerHTML = "";

    const totalPages = Math.ceil(reservations.length / rowsPerPage);

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

    for (let i = 1; i <= totalPages; i++) {
        const pageSpan = document.createElement("span");
        pageSpan.textContent = i;
        pageSpan.style.margin = "0 6px";
        pageSpan.style.cursor = "pointer";
        pageSpan.style.fontWeight = (i === currentPage) ? "bold" : "normal";
        pageSpan.onclick = () => renderReservations(i);
        paginationContainer.appendChild(pageSpan);
    }

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
    localStorage.removeItem("userId");
    localStorage.removeItem("user");
    localStorage.removeItem("reservationId");
    window.location.href = "../login.html";
});

document.addEventListener("DOMContentLoaded", fetchReservations);
