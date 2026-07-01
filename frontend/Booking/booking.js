
//frontend/Booking/booking.js
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
  if (!header || !navMenu) return;
  const rect = header.getBoundingClientRect();
  navMenu.style.top = (rect.bottom + 8) + 'px';
}
window.addEventListener('load', positionNavMenu);
window.addEventListener('resize', positionNavMenu);

// ------------------ วันที่และจำนวนที่นั่ง ------------------
const dateInput = document.getElementById('booking-date');
const seatsInfo = document.getElementById('seatsInfo');
let remainingSeats = 0;

if (dateInput) {
  const today = new Date();
  today.setDate(today.getDate() + 1); // ✅ เริ่มจากวันพรุ่งนี้
  dateInput.min = today.toISOString().split('T')[0];

const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 60); // กำหนดล่วงหน้าได้ไม่เกิน 60 วัน
  dateInput.max = maxDate.toISOString().split('T')[0];
}

dateInput?.addEventListener('change', async () => {
  const date = dateInput.value;
  if (!date) return seatsInfo.textContent = "";

  if (!course_name || !reservation_hour) {
    seatsInfo.textContent = "❌ กรุณาเลือกคอร์สก่อน";
    return;
  }

  try {
    const res = await fetch(`https://omakase-backend-li58.onrender.com/api/reservations/availability?date=${date}&course_name=${encodeURIComponent(course_name)}&reservation_hour=${encodeURIComponent(reservation_hour)}`);
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json();
    remainingSeats = data.remaining;

    seatsInfo.textContent = remainingSeats === 0
      ? "⚠️ จำนวนที่นั่งเต็มแล้ว"
      : `จำนวนที่นั่งเหลือ: ${remainingSeats} ที่นั่ง`;

    const peopleInput = document.querySelector('input[name="people"]');
    if (peopleInput) {
      peopleInput.max = remainingSeats;
      if (peopleInput.value > remainingSeats) peopleInput.value = remainingSeats;
    }
  } catch (err) {
    console.error(err);
    seatsInfo.textContent = "❌ ไม่สามารถโหลดจำนวนที่นั่งได้";
  }
});

// ------------------ โหลดข้อมูลผู้ใช้ ------------------
async function loadUser() {
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  if (!userId) {
    alert("กรุณาเข้าสู่ระบบก่อนทำการจอง");
    window.location.href = "../HomeLogin/login.html";
    return;
  }
  try {
    const res = await fetch(`https://omakase-backend-li58.onrender.com/api/profile?id=${userId}`, {
      headers: token ? { "Authorization": `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error("ไม่สามารถโหลดข้อมูลผู้ใช้");
    const data = await res.json();
    document.querySelector('input[name="name"]').value = data.name || "";
    document.querySelector('input[name="phone"]').value = data.phone || "";
    document.querySelector('input[name="email"]').value = data.email || "";
  } catch (err) {
    console.error(err);
    alert("โหลดข้อมูลผู้ใช้ล้มเหลว กรุณากรอกข้อมูลเอง");
  }
}
loadUser();

// ------------------ Modal รูปอาหาร ------------------
const modalHtml = `
<div id="imgModal" class="modal" style="display:none;">
  <div class="modal-backdrop" style="position:fixed;inset:0;background:rgba(0,0,0,.6)"></div>
  <div class="modal-body" style="
      position:fixed;
      left:50%;
      top:55%;
      transform:translate(-50%,-50%);
      max-width:90vw;
      max-height:90vh;
      background:#fff;
      border-radius:12px;
      padding:16px;
      overflow:auto;
      text-align:center;">
    <button id="closeModal" style="
      float:right;
      border:none;
      background:#eee;
      border-radius:8px;
      padding:6px 10px;
      cursor:pointer;">ปิด</button>
    <h3 style="text-align:center;margin-bottom:12px;">รูปอาหาร</h3>
    <div id="modalGallery" style="
      display:grid;
      grid-template-columns:repeat(auto-fill,minmax(180px,1fr));
      gap:16px;
      justify-items:center;">
    </div>
  </div>
</div>
`;
document.body.insertAdjacentHTML('beforeend', modalHtml);

function openImageGallery(foods) {
  const modal = document.getElementById('imgModal');
  const modalImgContainer = document.getElementById('modalGallery');
  modalImgContainer.innerHTML = '';
  foods.forEach(f => {
    if (f.food_img && f.food_img.base64) {
      const imgUrl = `data:${f.food_img.mimeType};base64,${f.food_img.base64}`;
      modalImgContainer.innerHTML += `
        <div class="food-card">
          <img src="${imgUrl}" alt="${f.food_name}" style="max-width:150px;border-radius:8px;">
          <p>${f.food_name}</p>
        </div>`;
    }
  });
  modal.style.display = 'block';
}
document.getElementById('closeModal').onclick = () => { document.getElementById('imgModal').style.display = 'none'; };

// ------------------ โหลดคอร์สและเมนู ------------------
const courseId = parseInt(document.body.dataset.courseId, 10);
let course_name = "";
let course_price = 0;
let reservation_hour = "";

async function loadCourseAndMenus() {
  if (courseId === 499) {
    course_name = "Omakase 499+ (7 Courses)";
    course_price = 499;
    reservation_hour = "11:00 - 12:00 น.";
  } else if (courseId === 699) {
    course_name = "Omakase 699+ (9 Courses)";
    course_price = 699;
    reservation_hour = "13:00 - 14:30 น.";
  } else if (courseId === 899) {
    course_name = "Omakase 899+ (11 Courses)";
    course_price = 899;
    reservation_hour = "15:30 - 17:30 น.";
  } else if (courseId === 1099) {
    course_name = "Omakase 1099+ (13 Courses)";
    course_price = 1099;
    reservation_hour = "18:30 - 21:00 น.";
  }

  try {
    const res = await fetch(`https://omakase-backend-li58.onrender.com/api/admin/food/${courseId}`);
    if (!res.ok) throw new Error("โหลดข้อมูลคอร์สล้มเหลว");
    const data = await res.json();
    if (!data.dataFood) return;

    const listFoods = data.dataFood[0].list_foods;
    const menuCheckbox = document.querySelector(".menu-checkbox");
    const allergyCheckbox = document.querySelector(".allergy-checkbox");
    const labelGroup = allergyCheckbox?.previousElementSibling;

    menuCheckbox.innerHTML = "";
    allergyCheckbox.innerHTML = "";

    listFoods.forEach(f => {
      const labelMenu = document.createElement("label");
      labelMenu.innerHTML = `<input type="checkbox"> ${f.food_name}`;
      menuCheckbox.appendChild(labelMenu);

      const labelAllergy = document.createElement("label");
      labelAllergy.innerHTML = `<input type="checkbox"> ${f.food_name}`;
      allergyCheckbox.appendChild(labelAllergy);
    });

    const otherInput = document.createElement("input");
    otherInput.type = "text";
    otherInput.placeholder = "อื่นๆ เช่น: แพ้ถั่ว, แป้ง, ฯลฯ";
    allergyCheckbox.appendChild(otherInput);

    const autoSelectLabel = document.createElement("label");
    autoSelectLabel.innerHTML = `<input type="checkbox"> ให้ทางร้านจัดการเลือกให้`;
    menuCheckbox.appendChild(autoSelectLabel);

    if (labelGroup) {
      const btnLabel = document.createElement("label");
      btnLabel.textContent = "กดเพื่อดูรูปอาหาร";
      btnLabel.style = "margin-left: 16px; padding-left: 150px; color: #730606; cursor:pointer;";
      btnLabel.onclick = () => openImageGallery(listFoods);
      labelGroup.appendChild(btnLabel);
    }
  } catch (err) {
    console.error(err);
  }
}
loadCourseAndMenus();
// ------------------ ส่งฟอร์มจอง (เก็บข้อมูลไว้ก่อน ไปชำระเงิน) ------------------
const form = document.querySelector("form");
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const userId = localStorage.getItem("userId");
    const date = document.querySelector("#booking-date").value;
    const peopleInput = document.querySelector('input[name="people"]');
    const numberOfPeople = parseInt(peopleInput.value, 10);

    // ✅ ตรวจสอบข้อมูลครบก่อน
    if (!userId || !date || !numberOfPeople) {
      alert("❌ กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    if (numberOfPeople > remainingSeats) {
      alert(`❌ จำนวนคนเกินที่นั่งเหลือ (${remainingSeats} คน)`);
      return;
    }

    // ✅ ตรวจสอบนโยบายหลังจากข้อมูลครบ
    const policyCheckbox = document.querySelector('input[name="acceptPolicy"]');
    if (!policyCheckbox?.checked) {
      alert("❌ กรุณายอมรับนโยบายของทางร้าน");
      return;
    }

    const allergies = Array.from(document.querySelectorAll('.allergy-checkbox input[type="checkbox"]'))
      .filter(i => i.checked)
      .map(i => i.nextSibling.textContent?.trim())
      .filter(Boolean);

    const otherAllergy = document.querySelector('.allergy-checkbox input[type="text"]');
    if (otherAllergy?.value) allergies.push(otherAllergy.value.trim());

    const selected_menu = Array.from(document.querySelectorAll('.menu-checkbox input[type="checkbox"]'))
      .filter(i => i.checked)
      .map(i => i.nextSibling.textContent?.trim())
      .filter(Boolean);

    const bookingData = {
      user_id: userId,
      reservation_time: date,
      reservation_hour,
      number_of_people: numberOfPeople,
      allergies,
      selected_menu,
      course_name,
      course_price,
      status: "รอดำเนินการ"
    };

    localStorage.setItem("pendingBooking", JSON.stringify(bookingData));
    window.location.href = "../Payment/payment.html";
  });
}

// ------------------ ปุ่มซ่อน/แสดงรายละเอียดนโยบาย ------------------
const toggleBtn = document.getElementById('togglePolicy');
const policyDetails = document.getElementById('policyDetails');

if (toggleBtn && policyDetails) {
  toggleBtn.addEventListener('click', () => {
    if (policyDetails.style.display === 'none' || policyDetails.style.display === '') {
      policyDetails.style.display = 'block';
      toggleBtn.textContent = 'ซ่อนรายละเอียด';
    } else {
      policyDetails.style.display = 'none';
      toggleBtn.textContent = 'อ่านรายละเอียดเพิ่มเติม';
    }
  });
}


// ------------------ ออกจากระบบ ------------------
const logoutBtn = document.querySelector(".logout");
logoutBtn?.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("user");
  localStorage.removeItem("pendingBooking");
  window.location.href = "../login.html";
});
