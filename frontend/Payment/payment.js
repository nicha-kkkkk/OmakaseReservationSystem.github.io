// // frontend/Payment/payment.js

// // ------------------ เมนู ------------------
// const menuToggle = document.querySelector('.menu-toggle');
// const navMenu = document.querySelector('.nav-menu');

// menuToggle.addEventListener('click', () => {
//     navMenu.classList.toggle('active');
//     menuToggle.textContent = navMenu.classList.contains('active') ? '✕' : '☰';
// });

// document.addEventListener('click', (e) => {
//     if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
//         navMenu.classList.remove('active');
//         menuToggle.textContent = '☰';
//     }
// });

// function positionNavMenu() {
//     const header = document.querySelector('header');
//     const navMenu = document.querySelector('.nav-menu');
//     if (!header || !navMenu) return;
//     const rect = header.getBoundingClientRect();
//     navMenu.style.top = (rect.bottom + 8) + 'px';
// }

// window.addEventListener('load', positionNavMenu);
// window.addEventListener('resize', positionNavMenu);

// // ------------------ Popup QR พร้อมเพย์ ------------------
// const qrBtn = document.getElementById('qrBtn');
// const qrPopup = document.getElementById('qrPopup');
// const closePopup = document.getElementById('closePopup');

// qrBtn?.addEventListener('click', () => qrPopup.classList.add('active'));
// closePopup?.addEventListener('click', () => qrPopup.classList.remove('active'));

// // ปุ่มยืนยัน QR (อัปเดตสถานะชำระเงิน)
// document.querySelector("#qrPopup .confirm-btn")?.addEventListener("click", async () => {
//     const reservationId = localStorage.getItem("reservationId");
//     if (!reservationId) return alert("ไม่พบรหัสการจอง");

//     try {
//         const res = await fetch(`https://omakase-backend-li58.onrender.com/api/reservations/${reservationId}`, {
//             method: "PATCH",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ status: "ชำระเงินเรียบร้อย" })
//         });

//         const data = await res.json();
//         if (!res.ok) throw new Error(data.message || "ไม่สามารถอัปเดตสถานะได้");

//         qrPopup.classList.remove("active");
//         alert("✅ ชำระเงินสำเร็จ! ขอบคุณที่ใช้บริการ Kitsune Omakase");

//         // อัปเดตสถานะบนหน้าจอ
//         const extraDetails = document.getElementById("extraDetails");
//         if (extraDetails) {
//             const statusP = extraDetails.querySelector("p.status");
//             if (statusP) statusP.textContent = `สถานะ: ${data.status}`;
//             else extraDetails.insertAdjacentHTML("beforeend", `<p class="status">สถานะ: ${data.status}</p>`);
//         }
//     } catch (err) {
//         console.error("❌ PATCH error:", err);
//         alert("❌ เกิดข้อผิดพลาดในการอัปเดตสถานะ");
//     }
// });

// // ------------------ Popup บัตรเครดิต/เดบิต ------------------
// const cardBtn = document.getElementById('cardBtn');
// const cardPopup = document.getElementById('cardPopup');
// const cancelCard = document.getElementById('cancelCard');
// const cardForm = document.getElementById('cardForm');

// cardBtn?.addEventListener('click', () => cardPopup.classList.add('active'));
// cancelCard?.addEventListener('click', () => cardPopup.classList.remove('active'));

// cardForm?.addEventListener('submit', (e) => {
//     e.preventDefault();
//     alert("✅ ชำระเงินสำเร็จ! ขอบคุณที่ใช้บริการ Kitsune Omakase");
//     cardPopup.classList.remove('active');
// });

// // ------------------ ดูเพิ่มเติม / ซ่อนรายละเอียด ------------------
// document.getElementById("toggleDetails")?.addEventListener("click", function (event) {
//     event.preventDefault();
//     const details = document.getElementById("extraDetails");
//     if (details.style.display === "none") {
//         details.style.display = "block";
//         this.textContent = "ซ่อนรายละเอียด";
//     } else {
//         details.style.display = "none";
//         this.textContent = "ดูเพิ่มเติม";
//     }
// });

// // ------------------ โหลดข้อมูลการจอง ------------------
// async function loadReservation() {
//     const reservationId = localStorage.getItem("reservationId");
//     if (!reservationId) {
//         alert("ไม่พบข้อมูลการจอง กรุณาจองใหม่อีกครั้ง");
//         window.location.href = "../Booking/booking.html";
//         return;
//     }

//     try {
//         const res = await fetch(`https://omakase-backend-li58.onrender.com/api/reservations/${reservationId}`);
//         const data = await res.json();

//         if (!res.ok) {
//             console.error("❌ Load reservation error:", data.message);
//             alert(`โหลดข้อมูลล้มเหลว: ${data.message}`);
//             return;
//         }

//         console.log("✅ ข้อมูลที่ได้จาก API:", data);

//         const courseName = data.course_name || "Omakase 499+ (7 Courses)";
//         const coursePrice = data.course_price || 499;
//         const courseTime = data.reservation_hour || "11:00 - 12:00 น.";
//         const totalPrice = coursePrice * data.number_of_people;

//         document.querySelector(".course-title").textContent = courseName;
//         document.querySelector(".payment-info").innerHTML = `
//             <p>วันที่จอง <span>${new Date(data.reservation_time).toLocaleDateString("th-TH")}</span></p>
//             <p>เวลาจอง <span>${courseTime}</span></p>
//             <p>จำนวนคน <span>${data.number_of_people} คน</span></p>
//             <p>ราคา <span>${totalPrice.toLocaleString("th-TH")} บาท</span></p>
//         `;

//         // ✅ ข้อมูลลูกค้า + รายการแพ้อาหาร
//         const customer = data.user_id || {}; // populate จาก backend
//         const allergies = Array.isArray(data.allergies) && data.allergies.length > 0
//             ? data.allergies.join("<br>")
//             : "<em>ไม่มีรายการแพ้อาหาร</em>";
//         const selectedMenu = Array.isArray(data.selected_menu) && data.selected_menu.length > 0
//             ? data.selected_menu.join("<br>")
//             : "<em>ไม่มีรายการแทน</em>";

//         document.getElementById("extraDetails").innerHTML = `
//             <p><strong>ชื่อ:</strong> ${customer.name || "-"}</p>
//             <p><strong>อีเมล:</strong> ${customer.email || "-"}</p>
//             <p><strong>รายการอาหารที่แพ้:</strong><br>${allergies}</p>
//             <p><strong>เลือกเพื่อแทนรายการอาหารที่แพ้:</strong><br>${selectedMenu}</p>
//             <p class="status">สถานะ: ${data.status || "-"}</p>
//         `;

//         // ✅ ราคาบน QR Popup
//         const qrPriceEl = document.getElementById("qrPrice");
//         if (qrPriceEl) qrPriceEl.textContent = `${totalPrice.toLocaleString("th-TH")} บาท`;

//     } catch (err) {
//         console.error("❌ Fetch reservation error:", err);
//         alert("เกิดข้อผิดพลาดในการโหลดข้อมูลการจอง");
//         window.location.href = "../Booking/booking.html";
//     }
// }

// document.addEventListener("DOMContentLoaded", loadReservation);

// // ------------------ ออกจากระบบ ------------------
// const logoutBtn = document.querySelector(".logout");
// logoutBtn?.addEventListener("click", () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("userId");
//     localStorage.removeItem("user");
//     localStorage.removeItem("reservationId");
//     window.location.href = "../login.html";
// });

// frontend/Payment/payment.js
// ------------------ เมนู ------------------
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');

menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    menuToggle.textContent = navMenu.classList.contains('active') ? '✕' : '☰';
});

document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
        navMenu.classList.remove('active');
        menuToggle.textContent = '☰';
    }
});

function positionNavMenu() {
    const header = document.querySelector('header');
    const navMenu = document.querySelector('.nav-menu');
    if (!header || !navMenu) return;
    const rect = header.getBoundingClientRect();
    navMenu.style.top = (rect.bottom + 8) + 'px';
}
window.addEventListener('load', positionNavMenu);
window.addEventListener('resize', positionNavMenu);

// ------------------ Popup QR พร้อมเพย์ ------------------
const qrBtn = document.getElementById('qrBtn');
const qrPopup = document.getElementById('qrPopup');
const closePopup = document.getElementById('closePopup');

qrBtn?.addEventListener('click', () => qrPopup.classList.add('active'));
closePopup?.addEventListener('click', () => qrPopup.classList.remove('active'));
document.querySelector("#qrPopup .confirm-btn")?.addEventListener("click", async () => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    const pendingBooking = JSON.parse(localStorage.getItem("pendingBooking"));

    if (!userId || !pendingBooking) {
        alert("❌ ไม่พบข้อมูลการจอง กรุณาจองใหม่");
        window.location.href = "../Booking/booking.html";
        return;
    }

    const totalPrice = (pendingBooking.course_price || 0) * (pendingBooking.number_of_people || 1);

    try {
        const res = await fetch("https://omakase-backend-li58.onrender.com/api/reservations", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ""}`
            },
            body: JSON.stringify({
                ...pendingBooking,
                user_id: userId,
                status: "ชำระเงินเรียบร้อย",
                total_price: totalPrice  // ✅ ส่ง total_price
            })
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.message || "ไม่สามารถสร้างการจองได้");

        alert("✅ ชำระเงินสำเร็จ! ขอบคุณที่ใช้บริการ Kitsune Omakase");
        qrPopup.classList.remove("active");
        localStorage.removeItem("pendingBooking");
        localStorage.setItem("reservationId", result.reservation._id);

        window.location.href = "../History/history.html";
    } catch (err) {
        console.error("❌ POST error:", err);
        alert("❌ เกิดข้อผิดพลาดในการบันทึกข้อมูลการจอง");
    }
});

// ------------------ Popup บัตรเครดิต/เดบิต ------------------
const cardBtn = document.getElementById('cardBtn');
const cardPopup = document.getElementById('cardPopup');
const cancelCard = document.getElementById('cancelCard');
const cardForm = document.getElementById('cardForm');

cardBtn?.addEventListener('click', () => cardPopup.classList.add('active'));
cancelCard?.addEventListener('click', () => cardPopup.classList.remove('active'));
cardForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    const pendingBooking = JSON.parse(localStorage.getItem("pendingBooking"));

    if (!userId || !pendingBooking) {
        alert("❌ ไม่พบข้อมูลการจอง กรุณาจองใหม่");
        window.location.href = "../Booking/booking.html";
        return;
    }

    const totalPrice = (pendingBooking.course_price || 0) * (pendingBooking.number_of_people || 1);

    try {
        const res = await fetch("https://omakase-backend-li58.onrender.com/api/reservations", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ""}`
            },
            body: JSON.stringify({
                ...pendingBooking,
                user_id: userId,
                status: "ชำระเงินเรียบร้อย",
                total_price: totalPrice  // ✅ ส่ง total_price
            })
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.message || "ไม่สามารถสร้างการจองได้");

        alert("✅ ชำระเงินสำเร็จ! ขอบคุณที่ใช้บริการ Kitsune Omakase");
        cardPopup.classList.remove('active');
        localStorage.removeItem("pendingBooking");
        localStorage.setItem("reservationId", result.reservation._id);

        window.location.href = "../History/history.html";
    } catch (err) {
        console.error("❌ POST error:", err);
        alert("❌ เกิดข้อผิดพลาดในการบันทึกข้อมูลการจอง");
    }
});


// ------------------ ดูเพิ่มเติม / ซ่อนรายละเอียด ------------------
document.getElementById("toggleDetails")?.addEventListener("click", function (event) {
    event.preventDefault();
    const details = document.getElementById("extraDetails");
    if (details.style.display === "none") {
        details.style.display = "block";
        this.textContent = "ซ่อนรายละเอียด";
    } else {
        details.style.display = "none";
        this.textContent = "ดูเพิ่มเติม";
    }
});

// ------------------ โหลดข้อมูลจาก pendingBooking ------------------
function loadPendingBooking() {
    const pending = JSON.parse(localStorage.getItem("pendingBooking"));
    const user = JSON.parse(localStorage.getItem("user")); // ✅ ดึงข้อมูลผู้ใช้จาก localStorage

    if (!pending) {
        alert("ไม่พบข้อมูลการจอง กรุณาจองใหม่อีกครั้ง");
        window.location.href = "../Booking/booking.html";
        return;
    }

    const courseName = pending.course_name || "Omakase";
    const coursePrice = pending.course_price || 0;
    const totalPrice = coursePrice * pending.number_of_people;

    document.querySelector(".course-title").textContent = courseName;
    document.querySelector(".payment-info").innerHTML = `
        <p>วันที่จอง <span>${new Date(pending.reservation_time).toLocaleDateString("th-TH")}</span></p>
        <p>เวลาจอง <span>${pending.reservation_hour}</span></p>
        <p>จำนวนคน <span>${pending.number_of_people} คน</span></p>
        <p>ราคา <span>${totalPrice.toLocaleString("th-TH")} บาท</span></p>
    `;

    const allergies = Array.isArray(pending.allergies) && pending.allergies.length > 0
        ? pending.allergies.join("<br>")
        : "<em>ไม่มีรายการแพ้อาหาร</em>";
    const selectedMenu = Array.isArray(pending.selected_menu) && pending.selected_menu.length > 0
        ? pending.selected_menu.join("<br>")
        : "<em>ไม่มีรายการแทน</em>";

    // ✅ เพิ่มส่วนชื่อ/อีเมลลูกค้า
    document.getElementById("extraDetails").innerHTML = `
        <p><strong>ชื่อ:</strong> ${user?.name || "-"}</p>
        <p><strong>อีเมล:</strong> ${user?.email || "-"}</p>
        <p><strong>รายการอาหารที่แพ้:</strong><br>${allergies}</p>
        <p><strong>เลือกเพื่อแทนรายการอาหารที่แพ้:</strong><br>${selectedMenu}</p>
        <p class="status">สถานะ: รอการชำระเงิน</p>
    `;

    const qrPriceEl = document.getElementById("qrPrice");
    if (qrPriceEl) qrPriceEl.textContent = `${totalPrice.toLocaleString("th-TH")} บาท`;
}

document.addEventListener("DOMContentLoaded", loadPendingBooking);

// ------------------ ออกจากระบบ ------------------
const logoutBtn = document.querySelector(".logout");
logoutBtn?.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "../login.html";
});
