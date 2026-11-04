'use strict';

// เปิด/ปิดรายละเอียดของแต่ละบ้าน โดยไม่ต้องโหลดหน้าเว็บใหม่
const detailButtons = document.querySelectorAll('.detail-toggle');

detailButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const detail = document.getElementById(button.getAttribute('aria-controls'));
    if (!detail) return;

    const opening = button.getAttribute('aria-expanded') !== 'true';

    // เปิดรายละเอียดได้ทีละหลัง เพื่อให้หน้าเว็บไม่ยาวเกินจำเป็น
    detailButtons.forEach((otherButton) => {
      const otherDetail = document.getElementById(otherButton.getAttribute('aria-controls'));
      otherButton.setAttribute('aria-expanded', 'false');
      otherButton.querySelector('span:first-child').textContent = 'VIEW PROPERTY DETAILS';
      if (otherDetail) otherDetail.hidden = true;
    });

    if (opening) {
      detail.hidden = false;
      button.setAttribute('aria-expanded', 'true');
      button.querySelector('span:first-child').textContent = 'HIDE PROPERTY DETAILS';
    }
  });
});
