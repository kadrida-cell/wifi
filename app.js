const $ = (id) => document.getElementById(id);
const fallbackPackages = [
  {id:"P1",name:"Paket 1",duration:"2 Jam",price:1000},
  {id:"P2",name:"Paket 2",duration:"6 Jam",price:2000},
  {id:"P3",name:"Paket 3",duration:"12 Jam",price:3000},
  {id:"P4",name:"Paket 4",duration:"1 Hari",price:5000},
  {id:"P5",name:"Paket 5",duration:"7 Hari",price:20000},
  {id:"P6",name:"Paket 6",duration:"15 Hari",price:35000},
  {id:"P7",name:"Paket 7",duration:"1 Bulan",price:65000},
  {id:"PF",name:"Paket Family",duration:"1 Bulan",price:135000}
];
let packages = fallbackPackages;
const rupiah = n => new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(Number(n||0));
let publicSettings = {storeName:"KADRIDA CELL",tagline:"Kami siap melayani.",whatsapp:"6287841962805",qrisUrl:"",paymentInstructions:"Silakan hubungi admin untuk instruksi pembayaran."};
const apiReady = () => window.APP_CONFIG.API_URL && window.APP_CONFIG.API_URL.startsWith("https://");
async function apiGet(action, params={}) {
  if(!apiReady()) throw new Error("Website belum dihubungkan ke Google Apps Script.");
  const url = new URL(window.APP_CONFIG.API_URL); url.searchParams.set("action",action);
  Object.entries(params).forEach(([k,v])=>url.searchParams.set(k,v));
  return new Promise((resolve,reject)=>{
    const cb="jsonp_"+Math.random().toString(36).slice(2);
    const timer=setTimeout(()=>{cleanup();reject(new Error("Server tidak merespons. Coba lagi."));},15000);
    function cleanup(){delete window[cb];script.remove();clearTimeout(timer);}
    window[cb]=(data)=>{cleanup();data.ok===false?reject(new Error(data.error||"Terjadi kesalahan.")):resolve(data);};
    const script=document.createElement("script");script.src=url+"&callback="+cb;script.onerror=()=>{cleanup();reject(new Error("Gagal menghubungi server."));};document.body.appendChild(script);
  });
}
function renderPackages(){
  $("package-grid").innerHTML=packages.map(p=>`<article class="package"><span class="duration">${p.duration}</span><h3>${p.name}</h3><div class="price">${rupiah(p.price)}</div><button class="button" data-buy="${p.id}">Beli Sekarang</button></article>`).join("");
}
async function loadPackages(){
  renderPackages();
  if(!apiReady()) return;
  try{const [r,s]=await Promise.all([apiGet("packages"),apiGet("publicSettings")]);if(r.packages?.length){packages=r.packages;renderPackages();}if(s.settings)publicSettings=s.settings;}catch(e){console.warn(e.message);}
}
function openOrder(p){
  $("package-id").value=p.id;$("modal-title").textContent=p.name+" • "+p.duration;$("modal-price").textContent=rupiah(p.price);
  $("order-created").innerHTML="";$("order-form").style.display="block";$("modal").classList.add("open");$("modal").setAttribute("aria-hidden","false");
}
$("package-grid").addEventListener("click",e=>{const b=e.target.closest("[data-buy]");if(b){const p=packages.find(x=>x.id===b.dataset.buy);if(p)openOrder(p);}});
$("close-modal").onclick=()=>{$("modal").classList.remove("open");$("modal").setAttribute("aria-hidden","true");};
$("modal").addEventListener("click",e=>{if(e.target===$("modal"))$("close-modal").click();});
$("order-form").addEventListener("submit",async e=>{
  e.preventDefault();if(!apiReady()){alert("Website belum dihubungkan ke Google Apps Script. Selesaikan pengaturan backend terlebih dahulu.");return;}
  const btn=e.submitter;btn.disabled=true;btn.textContent="Memproses...";
  try{
    const data={packageId:$("package-id").value,name:$("customer-name").value.trim(),phone:$("customer-phone").value.trim()};
    const r=await apiGet("createOrder",data);
    $("order-form").style.display="none";
    const s=r.settings||publicSettings;const qris=s.qrisUrl?`<p><b>Scan QRIS berikut:</b></p><img class="checkout-qris" src="${escapeHtml(s.qrisUrl)}" alt="QRIS ${escapeHtml(s.storeName)}">`:"";
    $("order-created").innerHTML=`<div class="result-card"><p class="success">Pesanan berhasil dibuat. Status: MENUNGGU PEMBAYARAN.</p><small>Nomor pesanan</small><div class="order-code">${escapeHtml(r.orderId)}</div><p><b>Total: ${rupiah(r.price)}</b></p>${qris}<p>${escapeHtml(s.paymentInstructions||"Silakan hubungi admin untuk instruksi pembayaran.")}</p><p class="tiny muted">Setelah membayar, hubungi admin dan sebutkan nomor pesanan. Admin akan memeriksa pembayaran secara manual.</p><a class="button full" target="_blank" rel="noopener" href="https://wa.me/${encodeURIComponent(s.whatsapp||window.APP_CONFIG.WHATSAPP)}?text=${encodeURIComponent("Halo KADRIDA CELL, saya sudah melakukan pembayaran pesanan "+r.orderId+" sebesar "+rupiah(r.price)+". Mohon diperiksa.")}">Hubungi Admin via WhatsApp</a><p class="tiny muted">Simpan nomor pesanan untuk mengecek status dan kode voucher.</p></div>`;
  }catch(err){alert(err.message);}finally{btn.disabled=false;btn.textContent="Buat Pesanan";}
});
$("check-form").addEventListener("submit",async e=>{
  e.preventDefault();const id=$("check-order").value.trim();$("order-result").textContent="Memeriksa...";
  try{const r=await apiGet("checkOrder",{orderId:id});const o=r.order;let voucher=o.voucherCode?`<p>Kode voucer Anda:</p><div class="order-code">${escapeHtml(o.voucherCode)}</div><p class="tiny">Gunakan kode ini untuk masuk ke jaringan WiFi.</p>`:"<p>Kode voucer akan tersedia setelah pembayaran disetujui admin.</p>";
    $("order-result").innerHTML=`<div class="result-card"><b>${escapeHtml(o.packageName)}</b><br>${rupiah(o.price)}<p>Status: <span class="status ${o.status==="LUNAS"?"paid":""}">${escapeHtml(o.status)}</span></p>${voucher}</div>`;
  }catch(err){$("order-result").innerHTML=`<p class="error">${escapeHtml(err.message)}</p>`;}
});
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
$("year").textContent=new Date().getFullYear();loadPackages();
