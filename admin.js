async function loadAll(){
  try {
    const [s,p] = await Promise.all([
      api("adminSummary",{token:adminToken}),
      api("packages")
    ]);

    adminPackages = p.packages || [];

    A("stats").innerHTML =
      stat("Total Pesanan",s.summary.totalOrders) +
      stat("Pesanan Lunas",s.summary.paid) +
      stat("Menunggu",s.summary.pending) +
      stat("Omzet",money(s.summary.revenue));

    A("stock-summary").innerHTML = adminPackages.map(p =>
      `<tr>
        <td>${esc(p.name)}</td>
        <td>${s.summary.stock[p.id]?.available || 0}</td>
        <td>${s.summary.stock[p.id]?.sold || 0}</td>
      </tr>`
    ).join("");

    A("stock-package").innerHTML = adminPackages.map(p =>
      `<option value="${esc(p.id)}">${esc(p.name)} — ${money(p.price)}</option>`
    ).join("");

    loadOrders();

  } catch(e) {
    msg("Gagal memuat dashboard: " + e.message);
    console.error("Dashboard error:", e);
  }
}
