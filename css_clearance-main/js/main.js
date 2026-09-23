const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let APP={user:null,csrf:null};

async function api(url, options={}) {
  const opts={...options,headers:{'Content-Type':'application/json',...(options.headers||{})}};
  const r=await fetch(url,opts); const j=await r.json().catch(()=>({ok:false,message:'Server returned invalid JSON.'}));
  if(!j.ok && r.status===401){location.reload();}
  if(!j.ok) throw new Error(j.message||'Request failed.');
  return j;
}
async function apiForm(url, form) {
  const r=await fetch(url,{method:'POST',body:form}); const j=await r.json().catch(()=>({ok:false,message:'Server returned invalid JSON.'}));
  if(!j.ok && r.status===401){location.reload()}
  if(!j.ok) throw new Error(j.message||'Request failed.');
  return j;
}
function toast(msg,type='ok'){const x=document.createElement('div');x.className='toast '+type;x.textContent=msg;$('#toast-root').appendChild(x);setTimeout(()=>x.remove(),3200)}
function esc(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function formData(form){return Object.fromEntries(new FormData(form).entries())}
function csrfData(data={}){return {...data,csrf:APP.csrf}}

async function boot(){
  const remembered=localStorage.getItem('ccs_remembered_identifier');
  if(remembered && $('[name="identifier"]')){$('[name="identifier"]').value=remembered;$('[name="remember"]').checked=true}
  try{
    const j=await api('api/auth.php'); APP.user=j.data.user; APP.csrf=j.data.csrf;
    if(APP.user){$('#auth-view').classList.add('hidden');$('#app-view').classList.remove('hidden');renderShell();loadPage('dashboard')}
  }catch(e){toast(e.message,'error')}
}
function renderShell(){
 const u=APP.user;
 $('#side-user').innerHTML=`${u.photo_url?`<img class="side-photo" src="${esc(u.photo_url)}" alt="">`:`<span class="side-photo side-initial">${esc((u.full_name||'U').slice(0,1).toUpperCase())}</span>`}<div><b>${esc(u.full_name)}</b><span>${esc(roleName(u.role))}${u.section?' • '+esc(u.section):''}</span></div>`;
 $('#avatar').innerHTML=u.photo_url?`<img src="${esc(u.photo_url)}" alt="Profile photo">`:esc((u.full_name||'U').slice(0,1).toUpperCase());
 const nav=u.role==='student'
  ?[['dashboard','▦ Dashboard'],['clearance','◉ Clearance Status'],['print','▤ Printable Clearance'],['settings','⚙ Settings']]
  :[['dashboard','▦ Dashboard'],['section','◉ Section Clearance'],['requirements','▤ Requirements'],['settings','⚙ Settings']];
 $('#nav').innerHTML=nav.map(x=>`<button class="nav-item" data-page="${x[0]}">${x[1]}</button>`).join('');
 $$('#nav .nav-item').forEach(b=>b.onclick=()=>loadPage(b.dataset.page));
}
function roleName(r){return ({student:'Student',lab:'Laboratory/Shop',library:'Library',cashier:'Cashier',sds:'Student Development Services',adviser:'Class Adviser',program_head:'Program Head',dean:'Dean',registrar:'Registrar'})[r]||r}
function setActive(p){$$('.nav-item').forEach(x=>x.classList.toggle('active',x.dataset.page===p))}
async function loadPage(p){
 setActive(p); const page=$('#page');
 page.innerHTML='<div class="panel">Loading…</div>';
 try{
  if(p==='dashboard') await dashboardPage();
  else if(p==='clearance') await studentClearancePage();
  else if(p==='print') await printPage();
  else if(p==='section') await sectionPage();
  else if(p==='requirements') await requirementsPage();
  else if(p==='settings') await settingsPage();
 }catch(e){page.innerHTML=`<div class="panel"><b>Unable to load this page.</b><p class="muted">${esc(e.message)}</p></div>`}
}
function stat(n,l){return `<div class="card stat"><div class="number">${esc(n)}</div><div class="label">${esc(l)}</div></div>`}
async function dashboardPage(){
 const j=await api('api/dashboard.php?action=summary'), d=j.data, p=$('#page');
 if(d.role==='student'){
  const pct=Math.round(d.cleared/d.total*100);
  p.innerHTML=`<div class="page-head"><div><h1>${esc(APP.user.full_name)}</h1><p>Student • ${esc(APP.user.course)} ${esc(APP.user.year_level)}-${esc(APP.user.section)}</p></div><span class="select">AY 2025-2026 ▾</span></div>
  <div class="progress-card"><div class="panel-title">Clearance Progress <span style="float:right">${d.cleared}/${d.total} Cleared</span></div><div class="progress-line"><i style="width:${pct}%"></i></div><div class="progress-meta"><span>${pct}% complete</span><span>Current semester</span></div></div>
  <div class="panel"><div class="panel-title">Department clearance</div><div class="cards">${d.departments.map(x=>`<div class="card"><b>${esc(x.department)}</b><p class="muted">${esc(x.officer||'To be Announced')}</p><span class="status ${x.status==='cleared'?'cleared':'pending'}">● ${x.status==='cleared'?'Cleared':'Pending'}</span></div>`).join('')}</div>
  <div class="notice">${d.printable?'All departments are cleared. Your printable clearance is unlocked.':'Printing unlocks once all 8 departments show Cleared.'}</div></div>
  <button class="btn primary" onclick="loadPage('clearance')">View Requirements</button>`;
 }else if(d.role==='registrar'){
  p.innerHTML=`<div class="page-head"><div><h1>Registrar Dashboard</h1><p>System assignments for clearance offices</p></div></div><div class="panel"><div class="panel-title">Office assignments</div><div class="table-wrap"><table class="data-table"><thead><tr><th>Office</th><th>Signatory</th><th>Course</th></tr></thead><tbody>${d.assignments.map(x=>`<tr><td>${esc(x.department)}</td><td>${esc(x.officer)}</td><td>${esc(x.course)}</td></tr>`).join('')}</tbody></table></div></div>`;
 }else{
  const c=d.counts||{};
  p.innerHTML=`<div class="page-head"><div><h1>${esc(d.department)} - Dashboard</h1><p>Signatory: ${esc(APP.user.full_name)}<br>Assigned Course: ${esc(APP.user.course||'BSIT & BSIS')}</p></div><span class="select">AY 2025-2026 ▾</span></div>
  <div class="cards">${stat(c.assigned||0,'Students Assigned')}${stat(c.cleared||0,'Cleared')}${stat(c.pending||0,'Pending')}</div>
  <div class="panel"><div class="panel-title">Sections requiring action</div><div class="table-wrap"><table class="data-table"><thead><tr><th>SECTION</th><th>COURSE</th><th>TOTAL</th><th>CLEARED</th><th>PENDING</th><th>ACTION</th></tr></thead><tbody>${d.sections.map(x=>`<tr><td>${esc(x.section)}</td><td>${esc(x.course)}</td><td>${x.total}</td><td>${x.cleared}</td><td>${x.pending}</td><td><button class="action-btn primary" onclick="openSection('${esc(x.section)}')">Open</button></td></tr>`).join('')}</tbody></table></div></div>
  <div class="notice">The Registrar's system settings determine which staff account handles each course for each office. Only matching assignments appear here.</div>`;
 }
}
async function studentClearancePage(){
 const j=await api('api/clearance.php?action=student'),d=j.data;
 $('#page').innerHTML=`<div class="page-head"><div><h1>Clearance Status - 1st Semester, AY 2025-2026</h1><p>Tap a department to view the requirements checklist that office has set for this term.</p></div></div>
 <div class="panel"><div class="table-wrap"><table class="data-table"><thead><tr><th>NO.</th><th>DEPARTMENT</th><th>CLEARING OFFICER</th><th>STATUS</th><th>DATE</th><th>REMARKS</th></tr></thead><tbody>${d.departments.map((x,i)=>`<tr><td>${i+1}</td><td><button class="link-btn" onclick="showDeptReq('${esc(x.department)}')">${esc(x.department)}</button></td><td>${esc(x.officer||'To be Announced')}</td><td>${status(x.status)}</td><td>${x.cleared_at?new Date(x.cleared_at.replace(' ','T')).toLocaleDateString():'-'}</td><td>${esc(x.remarks||'-')}</td></tr>`).join('')}</tbody></table></div></div>
 <div class="panel"><div class="panel-title">Visible requirement checklist</div>${Object.entries(d.requirements.reduce((a,x)=>(a[x.department]??=[]).push(x.requirement_text)&&a,{})).map(([k,v])=>`<div style="margin:12px 0"><b>${esc(k)}</b><ul>${v.map(q=>`<li>${esc(q)}</li>`).join('')}</ul></div>`).join('')}</div>`;
}
function status(s){return `<span class="status ${s==='cleared'?'cleared':'pending'}">● ${s==='cleared'?'Cleared':'Pending'}</span>`}
function showDeptReq(name){toast(`Opening ${name} checklist`)}
async function printPage(){
 const j=await api('api/clearance.php?action=student'),d=j.data,all=d.departments.every(x=>x.status==='cleared');
 $('#page').innerHTML=all?`<div class="page-head no-print"><div><h1>Printable Clearance</h1><p>Your clearance is complete.</p></div><button class="btn primary" onclick="window.print()">Print / Save as PDF</button></div><div class="print-page"><div class="print-title"><h1>UNIVERSITY OF RIZAL SYSTEM</h1><div>CCS Student Clearance</div><p>${esc(APP.user.full_name)} • ${esc(APP.user.student_no||'')} • ${esc(APP.user.course)} ${esc(APP.user.section)}</p></div><table class="print-table"><tr><th>No.</th><th>Department</th><th>Clearing Officer</th><th>Status</th><th>Date</th></tr>${d.departments.map((x,i)=>`<tr><td>${i+1}</td><td>${esc(x.department)}</td><td>${esc(x.officer||'To be Announced')}</td><td>Cleared</td><td>${x.cleared_at?new Date(x.cleared_at.replace(' ','T')).toLocaleDateString():'-'}</td></tr>`).join('')}</table><p style="margin-top:30px">This document confirms completion of the listed clearance offices for the current term.</p></div>`:`<div class="panel"><h1>Printable Clearance</h1><p>Printing is locked until all 8 departments show <b>Cleared</b>.</p><button class="btn primary" onclick="loadPage('clearance')">View Clearance Status</button></div>`;
}
let currentSection='';
async function sectionPage(section){
 const j=await api(`api/clearance.php?action=section&section=${encodeURIComponent(section||'BSIT 3-2A')}`),d=j.data; currentSection=d.section;
 $('#page').innerHTML=sectionTable(d);
}
function sectionTable(d){
 return `<div class="page-head"><div><h1>Section Clearance - ${esc(d.section)}</h1><p>Tick a box then “Exclude Selected” to leave specific students out.</p></div><div class="row"><button class="btn ghost" onclick="excludeSelected()">Exclude Selected</button><button class="btn primary" onclick="clearAll()">Clear All</button></div></div><div class="panel"><div class="table-wrap"><table class="data-table"><thead><tr><th></th><th>STUDENT NO.</th><th>NAME</th><th>SECTION</th><th>STATUS</th><th>REMARKS</th><th>ACTION</th></tr></thead><tbody>${d.students.map(x=>`<tr><td><input class="exclude" type="checkbox" value="${x.id}"></td><td>${esc(x.student_no)}</td><td>${esc(x.full_name)}</td><td>${esc(x.section)}</td><td>${status(x.status)}</td><td>${esc(x.remarks||'-')}</td><td><button class="action-btn" onclick="editClearance(${x.id},'${esc(x.status)}','${esc(x.remarks||'')}')">Edit</button></td></tr>`).join('')}</tbody></table></div></div>`;
}
async function openSection(section){setActive('section');$('#page').innerHTML='<div class="panel">Loading...</div>';try{await sectionPage(section)}catch(e){$('#page').innerHTML=`<div class="panel"><b>Unable to load this page.</b><p class="muted">${esc(e.message)}</p></div>`}}
async function refreshSection(){await sectionPage(currentSection)}
async function clearAll(){
 const exclude=$$('.exclude:checked').map(x=>Number(x.value));
 if(!confirm(`Clear all students in ${currentSection} except ${exclude.length} excluded?`)) return;
 const excludeRemarks=exclude.length?prompt('Enter the required remark for the excluded student(s):','Not cleared - action required.'):'';
 if(exclude.length && !excludeRemarks?.trim()) return toast('A remark is required for excluded students.','error');
 try{await api('api/clearance.php?action=clear_all',{method:'POST',body:JSON.stringify(csrfData({section:currentSection,exclude,exclude_remarks:excludeRemarks||''}))});toast('Section clearance updated.');await refreshSection()}catch(e){toast(e.message,'error')}
}
async function excludeSelected(){await clearAll()}
function editClearance(id,status0,remarks0){
 $('#modal-root').innerHTML=`<div class="modal-backdrop"><div class="modal"><h2>Update Clearance</h2><form id="edit-clearance"><input type="hidden" name="student_id" value="${id}"><label>Status<select name="status"><option value="cleared" ${status0==='cleared'?'selected':''}>Cleared</option><option value="pending" ${status0!=='cleared'?'selected':''}>Pending</option></select></label><label style="margin-top:12px">Remarks<span class="required-hint ${status0==='cleared'?'hidden':''}"> Required when pending</span><textarea name="remarks" rows="3" ${status0!=='cleared'?'required':''}>${esc(remarks0)}</textarea></label><div class="modal-actions"><button type="button" class="btn ghost" onclick="closeModal()">Cancel</button><button class="btn primary">Save</button></div></form></div></div>`;
 const form=$('#edit-clearance'),statusInput=form.elements.status,remarksInput=form.elements.remarks;
 statusInput.onchange=()=>{remarksInput.required=statusInput.value==='pending';remarksInput.closest('label').querySelector('.required-hint').classList.toggle('hidden',statusInput.value==='cleared')};
 form.onsubmit=async e=>{e.preventDefault();if(!form.reportValidity())return;try{await api('api/clearance.php?action=update',{method:'POST',body:JSON.stringify(csrfData(formData(e.target)))});closeModal();toast('Clearance updated.');await refreshSection()}catch(x){toast(x.message,'error')}};
}
async function requirementsPage(){
 const j=await api('api/requirements.php'),d=j.data;
 $('#page').innerHTML=`<div class="page-head"><div><h1>Requirements Settings - ${esc(d.department)}</h1><p>This office defines its own checklist. Items marked “Visible to students” appear in the student Clearance Status page.</p></div><button class="btn primary" onclick="requirementModal()">+ Add Requirement</button></div><div class="panel"><div class="req-list">${d.requirements.filter(x=>x.is_active==1).map(x=>`<div class="req-row"><div>${esc(x.requirement_text)}</div><div><label class="switch"><input type="checkbox" ${x.visibility?'checked':''} onchange="toggleReq(${x.id},this.checked)"><span class="slider"></span></label> <small>Visible to students</small></div><button class="action-btn" onclick="requirementModal(${x.id},'${esc(x.requirement_text)}',${x.visibility})">Edit</button></div>`).join('')}</div></div>`;
}
function requirementModal(id=0,text='',vis=1){
 $('#modal-root').innerHTML=`<div class="modal-backdrop"><div class="modal"><h2>${id?'Edit':'Add'} Requirement</h2><form id="req-form"><input type="hidden" name="id" value="${id}"><label>Requirement<textarea name="requirement_text" rows="3" required>${text}</textarea></label><label class="check" style="margin-top:12px"><input type="checkbox" name="visibility" ${vis?'checked':''}> Visible to students</label><div class="modal-actions"><button type="button" class="btn ghost" onclick="closeModal()">Cancel</button>${id?`<button type="button" class="btn danger" onclick="deleteReq(${id})">Delete</button>`:''}<button class="btn primary">Save</button></div></form></div></div>`;
 $('#req-form').onsubmit=async e=>{e.preventDefault();let d=formData(e.target);d.visibility=$('[name=visibility]').checked;try{await api('api/requirements.php?action=save',{method:'POST',body:JSON.stringify(csrfData(d))});closeModal();toast('Requirement saved.');requirementsPage()}catch(x){toast(x.message,'error')}};
}
async function toggleReq(id,v){try{await api('api/requirements.php?action=save',{method:'POST',body:JSON.stringify(csrfData({id,requirement_text:'',visibility:v}))})}catch(e){toast(e.message,'error');requirementsPage()}}
async function deleteReq(id){if(!confirm('Remove this requirement?'))return;try{await api('api/requirements.php?action=delete',{method:'POST',body:JSON.stringify(csrfData({id}))});closeModal();toast('Requirement removed.');requirementsPage()}catch(e){toast(e.message,'error')}}
function closeModal(){$('#modal-root').innerHTML=''}
function confirmDialog(title,message){return new Promise(resolve=>{$('#modal-root').innerHTML=`<div class="modal-backdrop"><div class="modal confirm-modal"><h2>${esc(title)}</h2><p class="muted">${esc(message)}</p><div class="modal-actions"><button type="button" class="btn ghost" data-confirm-cancel>Cancel</button><button type="button" class="btn primary" data-confirm-ok>Confirm</button></div></div></div>`;$('#modal-root [data-confirm-cancel]').onclick=()=>{closeModal();resolve(false)};$('#modal-root [data-confirm-ok]').onclick=()=>{closeModal();resolve(true)}})}
async function settingsPage(){
 const u=APP.user;
 $('#page').innerHTML=`<div class="page-head"><div><h1>Account Settings</h1><p>Update your personal profile and login credentials.</p></div></div><div class="panel"><div class="profile-grid"><div><div class="photo" id="photo-preview">${u.photo_url?`<img src="${esc(u.photo_url)}" alt="Profile photo">`:esc((u.full_name||'U').slice(0,1))}</div><label class="action-btn photo-picker">Change Photo<input id="photo-input" type="file" name="photo" accept="image/jpeg,image/png,image/gif,image/webp"></label><small class="muted">JPG, PNG, GIF, or WebP up to 5 MB.</small></div><form id="settings-form"><div class="settings-section"><h3>Profile</h3><div class="settings-grid"><label>Full Name<input name="full_name" value="${esc(u.full_name)}" required></label><label>Email<input type="email" name="email" value="${esc(u.email)}" required></label><label>Contact Number<input name="contact_no" value="${esc(u.contact_no||'')}" required></label></div></div><div class="settings-section"><h3>Security</h3><div class="settings-grid"><label>Current Password<div class="password-field"><input type="password" name="current_password"><button type="button" class="password-toggle" data-password-toggle aria-label="Show password">Show</button></div></label><label>New Password<div class="password-field"><input type="password" name="new_password" minlength="8" placeholder="Leave blank to keep current"><button type="button" class="password-toggle" data-password-toggle aria-label="Show password">Show</button></div></label></div></div><button class="btn primary" id="save-settings">Save Changes</button></form></div></div>`;
 setupPasswordToggles($('#page'));
 $('#photo-input').onchange=e=>{const file=e.target.files[0];if(!file)return;if(file.size>5*1024*1024){toast('Profile photos must be 5 MB or smaller.','error');e.target.value='';return}const reader=new FileReader();reader.onload=()=>{$('#photo-preview').innerHTML=`<img src="${esc(reader.result)}" alt="New profile photo">`};reader.readAsDataURL(file)};
 $('#settings-form').onsubmit=async e=>{e.preventDefault();if(!e.target.reportValidity())return;if(!await confirmDialog('Save profile changes?','Your profile details and selected photo will be updated.'))return;const button=$('#save-settings');button.disabled=true;button.classList.add('is-saving');button.textContent='Saving...';try{const payload=new FormData(e.target);payload.append('csrf',APP.csrf);const j=await apiForm('api/settings.php',payload);APP.user={...APP.user,...j.data.user};renderShell();toast('Changes saved successfully.')}catch(x){toast(x.message,'error')}finally{button.disabled=false;button.classList.remove('is-saving');button.textContent='Save Changes'}};
}
function setupPasswordToggles(root=document){root.querySelectorAll('[data-password-toggle]').forEach(button=>button.onclick=()=>{const input=button.parentElement.querySelector('input');const visible=input.type==='text';input.type=visible?'password':'text';button.textContent=visible?'Show':'Hide';button.setAttribute('aria-label',visible?'Show password':'Hide password')})}
function setupAuth(){
 setupPasswordToggles($('#auth-view'));
 const resetToken=new URLSearchParams(location.search).get('reset');
 if(resetToken){$('#login-panel').classList.add('hidden');$('#register-panel').classList.add('hidden');$('#reset-panel').classList.remove('hidden');$('#forgot-form').classList.add('hidden');$('#reset-password-form').classList.remove('hidden');}
 $('#show-register').onclick=()=>{$('#login-panel').classList.add('hidden');$('#reset-panel').classList.add('hidden');$('#register-panel').classList.remove('hidden')};
 $$('#show-login,#back-to-login').forEach(x=>x.onclick=()=>{$('#register-panel').classList.add('hidden');$('#reset-panel').classList.add('hidden');$('#login-panel').classList.remove('hidden')});
 $$('#show-reset,#forgot').forEach(x=>x.onclick=e=>{e.preventDefault();$('#login-panel').classList.add('hidden');$('#register-panel').classList.add('hidden');$('#reset-panel').classList.remove('hidden')});
 $('#forgot-form').onsubmit=async e=>{e.preventDefault();try{const j=await api('api/auth.php?action=forgot',{method:'POST',body:JSON.stringify(csrfData(formData(e.target)))});toast(j.message);$('#back-to-login').click()}catch(x){toast(x.message,'error')}};
 $('#reset-password-form').onsubmit=async e=>{e.preventDefault();const token=new URLSearchParams(location.search).get('reset');try{const j=await api('api/auth.php?action=reset',{method:'POST',body:JSON.stringify(csrfData({...formData(e.target),token}))});toast(j.message);history.replaceState({},'',location.pathname);$('#back-to-login').click()}catch(x){toast(x.message,'error')}};
 $('#login-form').onsubmit=async e=>{e.preventDefault();try{const d=csrfData(formData(e.target));if(d.remember)localStorage.setItem('ccs_remembered_identifier',d.identifier);else localStorage.removeItem('ccs_remembered_identifier');const j=await api('api/auth.php?action=login',{method:'POST',body:JSON.stringify(d)});APP.user=j.data.user;APP.csrf=j.data.csrf;$('#auth-view').classList.add('hidden');$('#app-view').classList.remove('hidden');renderShell();loadPage('dashboard');toast(j.message)}catch(x){toast(x.message,'error')}};
 $('#register-form').onsubmit=async e=>{e.preventDefault();try{const d=csrfData(formData(e.target));const j=await api('api/auth.php?action=register',{method:'POST',body:JSON.stringify(d)});toast(j.message);$('#show-login').click();e.target.reset()}catch(x){toast(x.message,'error')}};
 $('#logout').onclick=async()=>{if(!confirm('Are you sure you want to log out?'))return;try{await api('api/auth.php?action=logout',{method:'POST',body:JSON.stringify({csrf:APP.csrf})})}finally{location.reload()}};
}
document.addEventListener('DOMContentLoaded',()=>{setupAuth();boot()});
