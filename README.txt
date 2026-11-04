ELYSIAN ESTATES — เวอร์ชันจัดการข้อมูลผ่าน GitHub

อัปโหลดไฟล์ทั้งหมด 5 ไฟล์ไปที่ ROOT ของ Repository guindaeyo/realestateofelysian:
  index.html
  style.css
  script.js
  data.json
  favicon.svg

สำคัญ: ต้องอัปโหลด data.json และ favicon.svg เพิ่มจากเวอร์ชันเดิม เว็บจะโหลดข้อมูลจาก data.json ไม่ใช่ข้อมูลที่ฝังอยู่ใน script.js

ใช้งานหน้าแอดมิน:
1. เปิดเมนู แอดมิน บนเว็บ
2. กรอกรหัสผ่านที่คุณกำหนดไว้
3. เลือกหมวดและรายการ จากนั้นแก้ เพิ่ม หรือลบข้อมูล
4. กด “บันทึกการแก้ไข” เพื่อเก็บไว้ในร่างบนหน้าเว็บ
5. หากต้องการให้ทุกคนเห็นข้อมูลใหม่ ต้องกรอก GitHub Fine-grained Personal Access Token ของเจ้าของ Repository แล้วกด “บันทึกขึ้น GitHub”
6. GitHub จะอัปเดต data.json และ Vercel จะ Deploy ใหม่โดยอัตโนมัติ

สร้าง token: GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token
Repository access: Only select repositories → guindaeyo/realestateofelysian
Repository permissions: Contents = Read and write
ควรตั้งวันหมดอายุให้สั้น และเก็บ token ไว้เฉพาะผู้ดูแล ห้ามใส่ token ลงในไฟล์ GitHub หรือนำไปแชร์

ข้อจำกัดความปลอดภัย:
เว็บไซต์นี้เป็น Static Website จึงไม่มีระบบตรวจสอบรหัสแอดมินจากเซิร์ฟเวอร์ รหัสที่ใช้เปิดหน้าแอดมินไม่ใช่การรักษาความปลอดภัยแท้จริง; การแก้ไฟล์ส่วนกลางถูกควบคุมด้วยสิทธิ์ของ GitHub token เท่านั้น
รหัสผ่านสำหรับเปิด UI สามารถถูกข้ามได้โดยผู้มีความรู้ด้านโค้ด ไม่มีการเก็บ GitHub token ใน localStorage
หากต้องการการล็อกอินที่ปลอดภัยจริง ๆ จำเป็นต้องมี backend หรือบริการ authentication เพิ่มเติม
