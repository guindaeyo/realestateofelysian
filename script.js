let DATA={roads:[],houses:[],lands:[],unlocks:[]};
let originalSha=null;
let loaded=false;
let baselineData=null;
let lastDataSignature='';
let lastExternalCheck=null;
let activeRecord=null;
const REFRESH_INTERVAL_MS=60000;
const timestampText=value=>{if(!value)return 'ยังไม่มีบันทึกวันที่แก้ไขอัตโนมัติ';const date=new Date(value);return Number.isNaN(date.getTime())?'ไม่ทราบวันที่':new Intl.DateTimeFormat('th-TH-u-ca-gregory',{timeZone:'Asia/Bangkok',day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(date)+' น.'};
function updateTimestampUI(){
 const current=$('#lastUpdatedGlobal');if(current)current.textContent=timestampText(DATA.lastUpdated);
 const checked=$('#lastCheckedAt');if(checked)checked.textContent=lastExternalCheck?'ตรวจข้อมูลล่าสุด '+new Intl.DateTimeFormat('th-TH',{timeZone:'Asia/Bangkok',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(lastExternalCheck))+' น.':'ตรวจสอบข้อมูลใหม่ทุก 60 วินาที';
}
async function checkForNewData(){
 if(!loaded)return;
 try{
  const res=await fetch('data.json?refresh='+Date.now(),{cache:'no-store'});
  if(!res.ok)throw new Error('HTTP '+res.status);
  const fresh=await res.json();
  const signature=JSON.stringify(fresh);lastExternalCheck=new Date().toISOString();
  if(signature!==lastDataSignature){
   if(adminDirty){adminMessage('พบข้อมูลใหม่จากเว็บไซต์ แต่ยังมีร่างข้อมูลที่ไม่ได้เผยแพร่ กรุณาสำรอง JSON และรีเฟรชก่อนแก้ต่อ เพื่อไม่ให้ข้อมูลทับกัน','error');}
   else{
    DATA=fresh;baselineData=signature;lastDataSignature=signature;
    const modalWasOpen=!$('#detailModal').hidden;const selected=activeRecord;
    refreshSite();
    if(adminUnlocked)renderAdminRecords();
    if(modalWasOpen&&selected){const list=DATA[selected.kind==='house'?'houses':'lands'];const i=list.findIndex(x=>x.name===selected.name);if(i>=0)openModal(selected.kind,i,true);else closeModal();}
   }
  }
  updateTimestampUI();
 }catch(e){console.warn('ตรวจการเปลี่ยนแปลงข้อมูลไม่สำเร็จ',e);const el=$('#lastCheckedAt');if(el)el.textContent='ตรวจข้อมูลไม่สำเร็จ จะลองใหม่ใน 60 วินาที';}
}

async function loadData(){
  try {const res=await fetch('data.json?ts='+Date.now(),{cache:'no-store'});if(!res.ok)throw new Error('ไม่สามารถอ่าน data.json');DATA=await res.json();baselineData=JSON.stringify(DATA);lastDataSignature=baselineData;loaded=true;lastExternalCheck=new Date().toISOString();}
  catch(e){console.error(e);document.querySelector('#summaryStats').innerHTML='<p class="empty">ไม่สามารถอ่าน data.json โปรดเปิดผ่านเว็บเซิร์ฟเวอร์ เช่น Vercel หรือ Live Server</p>';return;}
  refreshSite();showView(location.hash.slice(1)||'home');setupAdmin();setInterval(checkForNewData,REFRESH_INTERVAL_MS);
}
function refreshSite(){stats();home();renderFilters();houseList();landList();requestList();updateTimestampUI();icons()}
const $=s=>document.querySelector(s);const $$=s=>Array.from(document.querySelectorAll(s));
const icons=()=>{if(window.lucide)window.lucide.createIcons()};const escapeHTML=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));const fmt=n=>Number(n).toLocaleString('en-US');
const roadNames={pine:'ไพน์วูดส์โร้ด',maple:'เมเปิลโร้ด',pumpkin:'พัมป์กินส์โร้ด',blossom:'บลอสซัมโร้ด',other:'อสังหาริมทรัพย์อื่น ๆ'};
let roadFilter='all',lastFocus=null;
function showView(view){const target=['home','directory','lands','requests','admin'].includes(view)?view:'home';$$('.view').forEach(x=>x.classList.toggle('active',x.id==='view-'+target));$$('.nav-link').forEach(x=>x.classList.toggle('active',x.dataset.view===target));$('#mainNav').classList.remove('open');$('#menuToggle').setAttribute('aria-expanded','false');history.replaceState(null,'','#'+target);window.scrollTo({top:0,behavior:'instant'});icons()}
function stats(){const arr=[['building-2',DATA.houses.length,'ทะเบียนอสังหาริมทรัพย์'],['map-pin',DATA.lands.length,'โฉนดต่างเมือง'],['file-check-2',DATA.unlocks.length,'คำร้องปลดล็อกกระทู้']];$('#summaryStats').innerHTML=arr.map(a=>`<div class="stat"><strong>${fmt(a[1])}</strong><span><i data-lucide="${a[0]}"></i> ${a[2]}</span></div>`).join('')}
function home(){$('#roadGrid').innerHTML=DATA.roads.map((r,i)=>`<article class="road-card"><div class="road-picture"><img src="${r.image}" alt="${escapeHTML(r.name)}" loading="lazy"><span class="road-number">COLLECTION 0${i+1}</span></div><div class="road-info"><span class="road-en">${r.en}</span><h3>${r.name}</h3><p>${r.description}</p><div class="road-features"><span><i data-lucide="users-round"></i> ${r.capacity} คน</span><span><i data-lucide="messages-square"></i> ${r.threads} กระทู้</span><span><i data-lucide="house"></i> ${r.type}</span></div><div class="road-price-row"><div><small class="price-prefix">ราคาเริ่มต้น</small><strong class="price">$${fmt(r.price)}</strong></div><button class="subtle-btn" data-road="${r.id}">ดูบ้านในย่านนี้ <i data-lucide="arrow-up-right"></i></button></div></div></article>`).join('')}
function renderFilters(){ $('#houseFilters').innerHTML=[['all','ทั้งหมด'],...DATA.roads.map(x=>[x.id,x.name]),['other','อื่น ๆ']].map(x=>`<button class="chip ${roadFilter===x[0]?'active':''}" data-filter="${x[0]}">${x[1]}</button>`).join('') }
function filtered(q,strings){return strings.some(s=>String(s??'').toLocaleLowerCase().includes(q))}
// Display-only natural sorting: 2 before 10, with Thai/English alphabetical tie-breakers.
// Keep original DATA array positions intact so edit/delete actions target the correct record.
const recordCollator=new Intl.Collator(['th','en'],{numeric:true,sensitivity:'base'});
function recordLabel(item,category){return String(item.name||item.house||item.en||item.id||'');}
function houseNumber(item){
 const source=String(item.number??'').trim()||String(item.name??'');
 const match=source.match(/[0-9๐-๙]+/);
 if(!match)return null;
 const digits=match[0].replace(/[๐-๙]/g,c=>String('๐๑๒๓๔๕๖๗๘๙'.indexOf(c)));
 const number=Number(digits);
 return Number.isFinite(number)?number:null;
}
function recordCompare(a,b,category){
 if(category==='houses'){
  const nA=houseNumber(a),nB=houseNumber(b);
  if(nA!==null&&nB!==null&&nA!==nB)return nA-nB;
  if(nA!==null&&nB===null)return -1;
  if(nA===null&&nB!==null)return 1;
  const roadA=DATA.roads.find(r=>r.id===a.road)?.name||roadNames[a.road]||a.road||'';
  const roadB=DATA.roads.find(r=>r.id===b.road)?.name||roadNames[b.road]||b.road||'';
  const roadResult=recordCollator.compare(roadA,roadB);
  if(roadResult)return roadResult;
 }
 return recordCollator.compare(recordLabel(a,category),recordLabel(b,category));
}
function sortedRecords(items,category){return [...items].sort((a,b)=>recordCompare(a,b,category));}

function houseList(){const q=$('#houseSearch').value.trim().toLocaleLowerCase();const rows=sortedRecords(DATA.houses.filter(x=>(roadFilter==='all'||roadFilter===x.road)&&filtered(q,[x.name,x.owner,x.rawResidents,roadNames[x.road]])),'houses');$('#houseResultCount').textContent=`พบ ${rows.length} รายการ`;$('#houseList').innerHTML=rows.length?rows.map(x=>`<button class="record-card" data-kind="house" data-id="${DATA.houses.indexOf(x)}"><span class="record-top"><span class="record-type">${escapeHTML(roadNames[x.road])}</span><i data-lucide="arrow-up-right"></i></span><h3>${escapeHTML(x.name)}</h3><span class="record-owner"><i data-lucide="user-round"></i> ${escapeHTML(x.owner)}</span><span class="record-foot"><span><i data-lucide="users-round"></i> ${escapeHTML(x.count)} คน</span><b>ดูผู้พักอาศัย</b></span></button>`).join(''):'<div class="empty">ไม่พบรายการที่ตรงกับคำค้นหา</div>';icons()}
function landList(){const q=$('#landSearch').value.trim().toLocaleLowerCase();const rows=sortedRecords(DATA.lands.filter(x=>filtered(q,[x.name,x.owner,x.residents.join(' ')])),'lands');$('#landResultCount').textContent=`พบ ${rows.length} โฉนด`;$('#landList').innerHTML=rows.length?rows.map(x=>`<button class="record-card" data-kind="land" data-id="${DATA.lands.indexOf(x)}"><span class="record-top"><span class="record-type">OUT-OF-TOWN DEED</span><i data-lucide="arrow-up-right"></i></span><h3>${escapeHTML(x.name)}</h3><span class="record-owner"><i data-lucide="user-round"></i> ${escapeHTML(x.owner)}</span><span class="record-foot"><span><i data-lucide="users-round"></i> ${escapeHTML(x.count)} คน</span><b>ดูรายชื่อ</b></span></button>`).join(''):'<div class="empty">ไม่พบรายการที่ตรงกับคำค้นหา</div>';icons()}
function requestList(){$('#requestList').innerHTML=DATA.unlocks.map(x=>`<article class="request-card"><span class="overline">APPROVAL RECORD</span><h3>${escapeHTML(x.house)}</h3><div class="request-meta"><span>ผู้ยื่นคำร้อง: ${escapeHTML(x.applicant)}</span><span>${escapeHTML(x.level)}</span><span class="status"><i data-lucide="check-circle-2"></i> ${escapeHTML(x.status)}</span></div><a href="${escapeHTML(x.url)}" target="_blank" rel="noopener noreferrer">เปิดกระทู้คำร้อง <i data-lucide="external-link"></i></a></article>`).join('');icons()}
function safeForumURL(value){
 try{const url=new URL(String(value||'').trim());return ['https:','http:'].includes(url.protocol)?url.href:'';}catch{return '';}
}
function forumLinkButton(value){const url=safeForumURL(value);return url?`<div class="forum-link-row"><a class="forum-link-button" href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">ไปยังกระทู้บ้านนี้</a></div>`:'';}
function houseImageHTML(house,road){
 // Use the image saved for this specific house, then fall back to its road's example image.
 // Other properties have no image, as configured for the admin editor.
 if(house.road==='other')return '';
 const custom=safeForumURL(house.image);
 const fallback=safeForumURL(road?.image);
 const url=custom||fallback;
 if(!url)return '';
 const alt=escapeHTML(house.name);
 return `<img class="modal-image" src="${escapeHTML(url)}" alt="${alt}" loading="eager" referrerpolicy="no-referrer"${custom&&fallback?` data-fallback-src="${escapeHTML(fallback)}"`:''}>`;
}
function peopleList(list){return list.length?`<ul class="resident-list">${list.map(n=>`<li><i data-lucide="user-round"></i><span>${escapeHTML(n)}</span></li>`).join('')}</ul>`:'<p class="modal-note">ยังไม่มีข้อมูลรายชื่อผู้พักอาศัยในไฟล์</p>'}
function metaHTML(items){return `<div class="modal-meta">${items.map(([a,b])=>`<div class="meta"><small>${a}</small><strong>${escapeHTML(b)}</strong></div>`).join('')}</div>`}
function openModal(kind,id,backgroundRefresh=false){let x,body='';if(kind==='house'){x=DATA.houses[id];if(!x)return;const r=DATA.roads.find(z=>z.id===x.road);body=`<h2 id="modalTitle">${escapeHTML(x.name)}</h2>${houseImageHTML(x,r)}${metaHTML([['ย่าน',roadNames[x.road]],['จำนวนผู้พักอาศัย',x.count+' คน'],['เจ้าของบ้าน (ตัวละครหลัก)',x.owner],['รายชื่อที่บันทึกไว้',x.residents.length+' คน']])}${forumLinkButton(x.threadUrl)}<div class="detail-section"><h3>รายชื่อผู้พักอาศัย</h3>${peopleList(x.residents)}</div>${r?`<div class="detail-section"><h3>ข้อกำหนดของประเภทบ้าน</h3><p class="modal-note">ราคา $${fmt(r.price)} · รองรับ ${r.capacity} คน · สูงสุด ${r.threads} กระทู้ต่อหลัง</p><ul>${r.rooms.map(s=>`<li>${escapeHTML(s)}</li>`).join('')}</ul><p class="modal-note">${escapeHTML(r.note)}</p></div>`:''}`;activeRecord={kind,name:x.name};$('#modalKicker').textContent='ELYSIAN PROPERTY RECORD'}else if(kind==='land'){x=DATA.lands[id];if(!x)return;body=`<h2 id="modalTitle">${escapeHTML(x.name)}</h2>${metaHTML([['เจ้าของ',x.owner],['จำนวนผู้พักอาศัย',x.count+' คน']])}${forumLinkButton(x.threadUrl)}<div class="detail-section"><h3>รายชื่อผู้พักอาศัย</h3>${peopleList(x.residents)}</div>`;activeRecord={kind,name:x.name};$('#modalKicker').textContent='DEED RECORD'}else return;$('#modalContent').innerHTML=body;if(!backgroundRefresh)lastFocus=document.activeElement;$('#detailModal').hidden=false;document.body.classList.add('modal-open');if(!backgroundRefresh)$('#modalClose').focus();icons()}
document.addEventListener('error',event=>{
 const img=event.target;
 if(!(img instanceof HTMLImageElement)||!img.matches('.modal-image'))return;
 const fallback=img.dataset.fallbackSrc;
 if(fallback){img.removeAttribute('data-fallback-src');img.src=fallback;}
 else img.hidden=true;
},true);
function closeModal(){if($('#detailModal').hidden)return;activeRecord=null;$('#detailModal').hidden=true;document.body.classList.remove('modal-open');if(lastFocus?.isConnected)lastFocus.focus()}
document.addEventListener('click',e=>{const nav=e.target.closest('[data-view]');if(nav)showView(nav.dataset.view);const go=e.target.closest('[data-go]');if(go)showView(go.dataset.go);const road=e.target.closest('[data-road]');if(road){roadFilter=road.dataset.road;renderFilters();houseList();showView('directory')}const filter=e.target.closest('[data-filter]');if(filter){roadFilter=filter.dataset.filter;renderFilters();houseList()}const rec=e.target.closest('[data-kind][data-id]');if(rec)openModal(rec.dataset.kind,Number(rec.dataset.id));if(e.target.closest('[data-close]')||e.target.closest('#modalClose'))closeModal()});
$('#menuToggle').addEventListener('click',()=>{const o=$('#mainNav').classList.toggle('open');$('#menuToggle').setAttribute('aria-expanded',String(o))});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();if(e.key==='Tab'&&!$('#detailModal').hidden){const controls=$$('#detailModal a,#detailModal button').filter(el=>el.offsetParent!==null);if(!controls.length)return;const a=controls[0],b=controls[controls.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();b.focus()}else if(!e.shiftKey&&document.activeElement===b){e.preventDefault();a.focus()}}});$('#houseSearch').addEventListener('input',houseList);$('#landSearch').addEventListener('input',landList);loadData();

// Admin editor. Draft changes remain in this browser until published to GitHub.
const ADMIN_CONFIG={repo:'guindaeyo/realestateofelysian',branch:'main',file:'data.json'};
const ADMIN_HASH='d0dce33d42fbe3ef37ea9dba8485d0342cae71b1446a1a83a7c1570edc2b1a51';
const ADMIN_FIELDS={
 houses:[['name','ชื่อบ้าน'],['road','ย่าน','road'],['number','เลขที่บ้าน'],['owner','เจ้าของบ้าน'],['image','ลิงก์รูปภาพบ้านหลังนี้ (URL)'],['threadUrl','ลิงก์กระทู้บ้านหลังนี้ (URL)'],['residents','รายชื่อผู้พักอาศัย (หนึ่งชื่อต่อบรรทัด)','lines'],['count','จำนวนผู้พักอาศัย','number']],
 lands:[['name','ชื่อโฉนด / ที่ดิน'],['owner','เจ้าของ'],['threadUrl','ลิงก์กระทู้ (URL)'],['residents','รายชื่อผู้พักอาศัย (หนึ่งชื่อต่อบรรทัด)','lines'],['count','จำนวนผู้พักอาศัย','number']],
 unlocks:[['house','บ้าน / กระทู้'],['applicant','ผู้ยื่นคำร้อง'],['level','ระดับคำร้อง'],['status','สถานะ'],['url','ลิงก์กระทู้']],
 roads:[['id','รหัสย่าน (อังกฤษ ห้ามซ้ำ)'],['name','ชื่อย่าน'],['en','ชื่อภาษาอังกฤษ'],['key','ชื่อย่อ'],['type','ประเภทบ้าน'],['price','ราคา','number'],['capacity','จำนวนคนสูงสุด','number'],['threads','จำนวนกระทู้สูงสุด','number'],['image','URL รูปภาพ'],['description','คำอธิบาย','multiline'],['rooms','รายละเอียดห้อง (หนึ่งบรรทัดต่อรายการ)','lines'],['note','หมายเหตุ','multiline']]
};
let adminUnlocked=false,adminNew=false,adminDirty=false,adminIndex=0;
function adminMessage(message,kind=''){const el=$('#adminStatus');el.textContent=message;el.className='admin-status '+kind;}
function setupAdmin(){
 $('#adminLoginForm').addEventListener('submit',async e=>{
  e.preventDefault();const password=$('#adminPassword').value;
  const data=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(password));
  const digest=Array.from(new Uint8Array(data)).map(c=>c.toString(16).padStart(2,'0')).join('');
  $('#adminPassword').value='';if(digest!==ADMIN_HASH){alert('รหัสผ่านไม่ถูกต้อง');return;}
  adminUnlocked=true;$('#adminLogin').hidden=true;$('#adminWorkspace').hidden=false;renderAdminRecords();icons();
 });
 $('#adminCategory').addEventListener('change',()=>{adminNew=false;adminIndex=0;renderAdminRecords();});
 $('#adminRecord').addEventListener('change',()=>{adminNew=false;adminIndex=Number($('#adminRecord').value);renderAdminFields();});
 $('#adminAdd').addEventListener('click',()=>{adminNew=true;renderAdminFields();});
 $('#adminDelete').addEventListener('click',()=>{
  const category=$('#adminCategory').value;if(adminNew){adminNew=false;renderAdminFields();return;}
  const obj=DATA[category][adminIndex];if(!obj)return;
  if(!confirm('ยืนยันการลบรายการนี้?\n'+(obj.name||obj.house||'รายการ')) )return;
  DATA[category].splice(adminIndex,1);adminIndex=0;DATA.lastUpdated=new Date().toISOString();adminDirty=true;renderAdminRecords();refreshSite();adminMessage('ลบจากร่างข้อมูลแล้ว กดบันทึกขึ้น GitHub เพื่อเผยแพร่');
 });
 $('#adminEditForm').addEventListener('submit',e=>{e.preventDefault();saveAdminForm();});
 $('#adminExport').addEventListener('click',()=>{
  const blob=new Blob([JSON.stringify(DATA,null,2)],{type:'application/json;charset=utf-8'});const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download='data.json';link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000);
  adminMessage('ดาวน์โหลดข้อมูลสำรองแล้ว');
 });
 $('#adminPublish').addEventListener('click',publishAdmin);
 $('#adminLogout').addEventListener('click',()=>{adminUnlocked=false;$('#adminLogin').hidden=false;$('#adminWorkspace').hidden=true;$('#githubToken').value='';adminMessage('');});
}
function renderAdminRecords(){
 const category=$('#adminCategory').value;
 const items=DATA[category]||[];
 const sorted=items.map((item,i)=>({item,i})).sort((a,b)=>recordCompare(a.item,b.item,category));
 $('#adminRecord').innerHTML=sorted.map(({item,i})=>`<option value="${i}">${escapeHTML(item.name||item.house||'รายการที่ '+(i+1))}</option>`).join('');
 if(!items.length)adminIndex=0;
 else if(adminIndex<0||adminIndex>=items.length)adminIndex=sorted[0].i;
 $('#adminRecord').value=String(adminIndex);
 renderAdminFields();icons();
}
function renderAdminFields(){
 const category=$('#adminCategory').value, fields=ADMIN_FIELDS[category], item=adminNew?{}:DATA[category][adminIndex]||{};
 $('#adminRecord').disabled=adminNew;
 $('#adminEditForm').innerHTML=fields.map(([key,label,type])=>{
  let value=item[key]??'';if(type==='lines')value=Array.isArray(value)?value.join('\n'):String(value);
  const span=type==='multiline'||type==='lines'?' span-all':'';
  let field;
  if(type==='road')field=`<select name="${key}">${[...DATA.roads.map(x=>[x.id,x.name]),['other','อื่น ๆ']].map(([id,name])=>`<option value="${escapeHTML(id)}" ${value===id?'selected':''}>${escapeHTML(name)}</option>`).join('')}</select>`;
  else if(type==='lines'||type==='multiline')field=`<textarea name="${key}" rows="${type==='lines'?'5':'3'}">${escapeHTML(value)}</textarea>`;
  else field=`<input type="${type==='number'?'number':'text'}" ${type==='number'?'min="0" step="1"':''} name="${key}" value="${escapeHTML(value)}">`;
  return `<label ${category==='houses'&&key==='image'?'id="adminImageField"':''} class="${span}">${label}${field}</label>`;
 }).join('')+'<div class="span-all"><button type="submit" class="gold-button"><i data-lucide="save"></i> '+(adminNew?'เพิ่มรายการนี้':'บันทึกการแก้ไข')+'</button></div>';
 if(category==='houses'){const roadSelect=$('#adminEditForm select[name=road]');const imageWrap=$('#adminImageField');if(roadSelect&&imageWrap){const toggle=()=>{imageWrap.hidden=roadSelect.value==='other';if(imageWrap.hidden){const input=imageWrap.querySelector('input');if(input)input.value='';}};roadSelect.addEventListener('change',toggle);toggle();}}
 icons();
}
function saveAdminForm(){
 if(!adminUnlocked)return;
 const category=$('#adminCategory').value,fields=ADMIN_FIELDS[category],form=new FormData($('#adminEditForm'));
 const old=adminNew?{}:DATA[category][adminIndex]||{};
 const result={...old};
 for(const [key,label,type] of fields){let value=String(form.get(key)??'').trim();if(type==='number')value=Math.max(0,Number(value)||0);else if(type==='lines')value=value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);result[key]=value;}
 if(category==='houses'&&result.road==='other')result.image='';
 if((category==='houses'||category==='lands')&&result.threadUrl&&!safeForumURL(result.threadUrl)){adminMessage('ลิงก์กระทู้ไม่ถูกต้อง กรุณาใช้ URL https://...','error');return;}
 if(category==='houses'&&result.image){try{const url=new URL(result.image);if(!['https:','http:'].includes(url.protocol))throw new Error('URL');}catch(e){adminMessage('ลิงก์รูปภาพไม่ถูกต้อง กรุณาใช้ URL https://...','error');return;}}
 if(!result.name&&!result.house){adminMessage('กรุณากรอกชื่อรายการ','error');return;}
 if(category==='houses'||category==='lands'){
  result.count=Number(result.count)||result.residents.length;
  if(category==='houses')result.rawResidents=result.residents.map((x,i)=>`${i+1}. ${x}`).join('\n');
 }
 if(category==='roads'&&DATA.roads.some((x,i)=>x.id===result.id&&(adminNew||i!==adminIndex))){adminMessage('รหัสย่านซ้ำกับที่มีอยู่','error');return;}
 result.updatedAt=new Date().toISOString();
 if(adminNew){DATA[category].push(result);adminIndex=DATA[category].length-1;adminNew=false;}else DATA[category][adminIndex]=result;
 DATA.lastUpdated=result.updatedAt;adminDirty=true;renderAdminRecords();refreshSite();adminMessage('บันทึกร่างสำเร็จ — กดบันทึกขึ้น GitHub เพื่อให้ข้อมูลแสดงบนเว็บสำหรับทุกคน','success');
}
const encodeBase64=str=>btoa(Array.from(new TextEncoder().encode(str),b=>String.fromCharCode(b)).join(''));
// Only report GitHub's permission/status diagnostics; never show or log the token.
async function githubError(response,step){
 const info=await response.json().catch(()=>({}));
 const required=response.headers.get('x-accepted-github-permissions');
 const granted=response.headers.get('x-oauth-scopes');
 let advice='';
 if(response.status===401)advice='Token ไม่ถูกต้องหรือหมดอายุ';
 else if(response.status===403)advice=step.startsWith('เขียน')?'GitHub ไม่อนุญาตให้ Token เขียนไฟล์: ตรวจสอบว่า Token มี Contents: Read and write สำหรับ Repository นี้ และตรวจสอบกฎป้องกันสาขา main':'GitHub ไม่อนุญาตให้ Token อ่านไฟล์: ตรวจสอบ Resource owner และ Selected repositories';
 else if(response.status===404)advice='ไม่พบไฟล์หรือ Repository ที่ Token มีสิทธิ์เข้าถึง ตรวจสอบ guindaeyo/realestateofelysian และ data.json';
 else if(response.status===409)advice='มีการเปลี่ยนแปลงไฟล์พร้อมกัน ให้รีเฟรชและลองใหม่';
 else if(response.status===422)advice='รูปแบบคำขอหรือค่า SHA ไม่ถูกต้อง';
 const details=[step+'ไม่สำเร็จ (HTTP '+response.status+')',info.message||response.statusText,required?'สิทธิ์ที่ API ต้องการ: '+required:'',granted?'OAuth scopes: '+granted:'',advice].filter(Boolean);
 return new Error(details.join(' — '));
}
async function publishAdmin(){
 if(!adminUnlocked)return;
 const token=$('#githubToken').value.trim();if(!token){adminMessage('กรุณาใส่ GitHub fine-grained token ก่อนเผยแพร่','error');return;}
 const button=$('#adminPublish');button.disabled=true;adminMessage('กำลังตรวจสอบข้อมูลไฟล์บน GitHub...');
 const url=`https://api.github.com/repos/${ADMIN_CONFIG.repo}/contents/${ADMIN_CONFIG.file}`;
 const headers={'Authorization':'Bearer '+token,'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'};
 try{
  const get=await fetch(url+'?ref='+encodeURIComponent(ADMIN_CONFIG.branch),{headers,cache:'no-store'});
  if(!get.ok)throw await githubError(get,'อ่านไฟล์ data.json');
  const existing=await get.json();
  // Guard against accidentally overwriting changes made by another editor.
  const parsed=JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(existing.content.replace(/\s/g,'')),c=>c.charCodeAt(0))));
  if(adminDirty && baselineData && JSON.stringify(parsed)!==baselineData)throw new Error('ไฟล์บน GitHub มีการเปลี่ยนแปลงจากที่เปิดหน้านี้ กรุณาสำรอง JSON แล้วรีเฟรชเพื่อป้องกันข้อมูลทับกัน');
  if(!adminDirty && JSON.stringify(DATA)===JSON.stringify(parsed)){adminMessage('ไม่มีการแก้ไขใหม่ที่ต้องเผยแพร่','success');return;}
  if(adminDirty&&!confirm('ยืนยันเผยแพร่ข้อมูลทั้งหมดขึ้น GitHub?\nเว็บไซต์จะอัปเดตหลัง Vercel Deploy สำเร็จ'))return;
  const payload={message:'Update Elysian property records via admin',content:encodeBase64(JSON.stringify(DATA,null,2)+'\n'),sha:existing.sha,branch:ADMIN_CONFIG.branch};
  const sent=await fetch(url,{method:'PUT',headers,body:JSON.stringify(payload)});
  if(!sent.ok)throw await githubError(sent,'เขียนไฟล์ data.json');
  adminDirty=false;baselineData=JSON.stringify(DATA);lastDataSignature=baselineData;lastExternalCheck=new Date().toISOString();updateTimestampUI();adminMessage('เผยแพร่ขึ้น GitHub สำเร็จ! Vercel จะเริ่ม Deploy ใหม่โดยอัตโนมัติ','success');$('#githubToken').value='';
 }catch(e){adminMessage('ไม่สำเร็จ: '+e.message,'error');}finally{button.disabled=false;}
}
