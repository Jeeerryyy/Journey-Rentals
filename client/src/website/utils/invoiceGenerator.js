/* Journey Rentals Solapur — High Fidelity Tax Invoice Generator */

export function generateInvoiceHTML(booking) {
  if (!booking) return "";

  const refId = booking.referenceId || booking.id || booking._id || "JR-2026";
  const invNumber = `JR-INV-${refId}`;
  const invDate = new Date(booking.createdAt || Date.now()).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

  const customerName = booking.userSnapshot?.name || booking.customerName || booking.customerInfo?.name || "Customer";
  const customerPhone = booking.userSnapshot?.phone || booking.customerPhone || booking.customerInfo?.phone || "N/A";
  const customerEmail = booking.userSnapshot?.email || booking.customerEmail || booking.customerInfo?.email || "N/A";
  const customerDl = booking.documents?.licenseNumber || booking.customerInfo?.dlNumber || "Verified at Station";
  const customerAadhaar = booking.documents?.aadhaarNumber || booking.customerInfo?.aadhaarNumber || "Verified at Station";

  const vehicleName = booking.vehicleSnapshot?.brand
    ? `${booking.vehicleSnapshot.brand} ${booking.vehicleSnapshot.model}`
    : booking.vehicleName || "Self-Drive Vehicle";
  const vehicleCategory = booking.vehicleSnapshot?.category || booking.category || "Standard Fleet";
  const vehicleReg = booking.vehicleSnapshot?.reg_no || booking.reg_no || "Solapur Verified RTO (MH-13)";
  const pickupHub = booking.pickupLocation || "Solapur Railway Station (Main Hub)";

  const isCar = booking.bookingType !== "bike";
  const pickupDateStr = booking.pickupDate ? new Date(booking.pickupDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : (booking.bikeDate ? new Date(booking.bikeDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "N/A");
  const returnDateStr = booking.returnDate ? new Date(booking.returnDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : (booking.bikeSlot ? `${booking.bikeSlot} Slot` : pickupDateStr);
  const totalDays = booking.totalDays || 1;

  const totalPrice = Number(booking.totalPrice || 0);
  const advancePaid = Number(booking.advancePaid || (booking.payment?.status === "paid" ? totalPrice : 500));
  const balanceDue = Math.max(0, totalPrice - advancePaid);
  const paymentStatus = booking.payment?.status === "paid" || booking.status === "completed" || balanceDue === 0 ? "PAID IN FULL" : (advancePaid > 0 ? "ADVANCE PAID" : "PENDING");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Journey Rentals Invoice · ${invNumber}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@400;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Urbanist', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: #F6F5FA; color: #212121; padding: 24px; }
    .no-print { display: flex; justify-content: space-between; align-items: center; max-width: 820px; margin: 0 auto 20px auto; }
    .btn-action { background: #212121; color: #FFFFFF; font-weight: 700; font-size: 12px; padding: 10px 20px; border-radius: 9999px; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .btn-action:hover { background: #000000; }
    .btn-outline { background: #FFFFFF; color: #212121; border: 1px solid #DFDCE8; margin-right: 8px; }
    .btn-outline:hover { background: #F6F5FA; }

    .invoice-card { background: #FFFFFF; max-width: 820px; margin: 0 auto; border-radius: 28px; border: 1px solid #DFDCE8; padding: 48px; box-shadow: 0 10px 30px rgba(0,0,0,0.04); }
    
    .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 28px; border-bottom: 2px solid #DFDCE8; }
    .brand-logo { display: flex; align-items: center; gap: 14px; }
    .brand-logo-img { width: 46px; height: 46px; object-fit: contain; flex-shrink: 0; }
    .brand-name { font-size: 22px; font-weight: 900; letter-spacing: -0.5px; color: #212121; }
    .brand-name span { color: #3F5F8C; }
    .brand-address { font-size: 11px; color: #6F6E73; margin-top: 6px; line-height: 1.5; }
    
    .inv-tag { text-align: right; }
    .inv-title { font-size: 26px; font-weight: 900; color: #212121; letter-spacing: 0.5px; }
    .inv-meta { margin-top: 6px; font-size: 11px; color: #6F6E73; font-family: 'JetBrains Mono', monospace; }
    .inv-meta strong { color: #212121; }

    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 28px; padding-bottom: 28px; border-bottom: 1px solid #DFDCE8; }
    .section-title { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #6F6E73; margin-bottom: 8px; }
    .customer-name { font-size: 16px; font-weight: 800; color: #212121; margin-bottom: 4px; }
    .detail-item { font-size: 12px; color: #4B4A50; line-height: 1.6; }
    .detail-item span { font-weight: 600; color: #212121; }

    .rental-badge { display: inline-block; background: #e1b808; color: #212121; font-weight: 800; font-size: 11px; padding: 4px 12px; border-radius: 20px; margin-top: 6px; }

    table { width: 100%; border-collapse: collapse; margin-top: 28px; }
    th { text-align: left; background: #F6F5FA; padding: 12px 14px; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #6F6E73; border-radius: 8px; }
    td { padding: 14px; font-size: 12px; border-bottom: 1px solid #DFDCE8; }
    .text-right { text-align: right; }
    .font-mono { font-family: 'JetBrains Mono', monospace; font-weight: 700; }

    .summary-section { display: flex; justify-content: space-between; align-items: flex-start; margin-top: 24px; }
    .notes-box { max-width: 380px; background: #F6F5FA; border: 1px solid #DFDCE8; border-radius: 16px; padding: 16px; font-size: 11px; color: #6F6E73; line-height: 1.5; }
    .notes-box strong { color: #212121; }

    .totals-box { width: 300px; }
    .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 12px; color: #6F6E73; }
    .total-row.grand { border-top: 2px solid #212121; margin-top: 8px; padding-top: 10px; font-size: 16px; font-weight: 900; color: #212121; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-weight: 800; font-size: 11px; }
    .status-paid { background: #CFDECA; color: #4B8039; }
    .status-pending { background: #e1b808; color: #212121; }

    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px dashed #DFDCE8; display: flex; justify-content: space-between; align-items: flex-end; }
    .sign-box { text-align: right; }
    .sign-line { width: 160px; border-top: 1px solid #212121; margin-top: 40px; margin-left: auto; }
    .sign-text { font-size: 11px; font-weight: 700; color: #212121; margin-top: 6px; }

    @media print {
      body { background: #FFFFFF; padding: 0; }
      .no-print { display: none; }
      .invoice-card { border: none; box-shadow: none; padding: 0; max-width: 100%; }
      @page { margin: 15mm; }
    }
  </style>
</head>
<body>

  <!-- Top Action Bar -->
  <div class="no-print">
    <div style="font-size: 13px; font-weight: 800;">
      Journey Rentals Solapur &nbsp;&middot;&nbsp; <span style="font-family: monospace; color: #6F6E73;">#${invNumber}</span>
    </div>
    <div>
      <button class="btn-action btn-outline" onclick="window.close()">Close Window</button>
      <button class="btn-action" onclick="window.print()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        Print / Save PDF
      </button>
    </div>
  </div>

  <!-- Invoice Container -->
  <div class="invoice-card">
    
    <!-- 1. Header -->
    <div class="header">
      <div class="brand-left">
        <div class="brand-logo">
          <img src="/logo.png" alt="Journey Rentals Solapur Logo" class="brand-logo-img" />
          <div>
            <div class="brand-name">JOURNEY<span>RENTALS</span></div>
            <div style="font-size: 11px; font-weight: 700; color: #6F6E73; text-transform: uppercase; letter-spacing: 0.5px;">Self-Drive Cars &amp; Bikes Solapur</div>
          </div>
        </div>
        <div class="brand-address">
          Main Station Hub &amp; Operations Center, Railway Lines, Solapur 413001<br>
          Dispatch Hotline: +91 96044 37794 &nbsp;&middot;&nbsp; +91 90213 11033<br>
          Email: rental.journeycars@gmail.com &nbsp;&middot;&nbsp; Web: www.journeyrentals.in
        </div>
      </div>

      <div class="inv-tag">
        <div class="inv-title">TAX INVOICE</div>
        <div class="inv-meta">
          Invoice No: <strong>#${invNumber}</strong><br>
          Booking Ref: <strong>#${refId}</strong><br>
          Date: <strong>${invDate}</strong>
        </div>
      </div>
    </div>

    <!-- 2. Customer & Rental Information -->
    <div class="grid-2">
      <!-- Billed To -->
      <div>
        <div class="section-title">Billed To (Customer Details)</div>
        <div class="customer-name">${customerName}</div>
        <div class="detail-item">Contact Phone: <span>${customerPhone}</span></div>
        <div class="detail-item">Email Address: <span>${customerEmail}</span></div>
        <div class="detail-item">Driving Licence: <span>${customerDl}</span></div>
        <div class="detail-item">Aadhaar Card: <span>${customerAadhaar}</span></div>
      </div>

      <!-- Rental Spec -->
      <div>
        <div class="section-title">Reservation &amp; Dispatch Details</div>
        <div class="customer-name">${vehicleName}</div>
        <div class="detail-item">Class / Category: <span>${vehicleCategory} · ${vehicleReg}</span></div>
        <div class="detail-item">Pickup Hub: <span>${pickupHub}</span></div>
        <div class="detail-item">Pickup Time: <span>${pickupDateStr}</span></div>
        <div class="detail-item">Return Time: <span>${returnDateStr} (${totalDays} ${totalDays === 1 ? 'Day' : 'Days'})</span></div>
        <span class="rental-badge">Zero Security Deposit Verified</span>
      </div>
    </div>

    <!-- 3. Line Items Table -->
    <table>
      <thead>
        <tr>
          <th>Description &amp; Services</th>
          <th>Rate / Day</th>
          <th>Duration</th>
          <th class="text-right">Amount (₹)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>Self-Drive Rental — ${vehicleName}</strong><br>
            <span style="font-size: 10px; color: #6F6E73;">Full sanitized vehicle delivery with 300 KM / Day limit.</span>
          </td>
          <td class="font-mono">₹${Math.round(totalPrice / Math.max(1, totalDays)).toLocaleString('en-IN')}</td>
          <td>${totalDays} ${totalDays === 1 ? 'Day' : 'Days'}</td>
          <td class="text-right font-mono">₹${totalPrice.toLocaleString('en-IN')}</td>
        </tr>
        <tr>
          <td>
            <strong>Solapur Railway Station Express Handover</strong><br>
            <span style="font-size: 10px; color: #6F6E73;">Platform 1 doorstep delivery &amp; return concierge</span>
          </td>
          <td>₹0</td>
          <td>1 Service</td>
          <td class="text-right font-mono">₹0</td>
        </tr>
        <tr>
          <td>
            <strong>Roadside Assistance &amp; Comprehensive Insurance</strong><br>
            <span style="font-size: 10px; color: #6F6E73;">24/7 Pilgrimage emergency breakdown coverage</span>
          </td>
          <td>₹0</td>
          <td>Included</td>
          <td class="text-right font-mono">₹0</td>
        </tr>
      </tbody>
    </table>

    <!-- 4. Summary & Payment Status -->
    <div class="summary-section">
      <div class="notes-box">
        <strong>Terms &amp; Important Instructions:</strong><br>
        1. Fuel policy: Same to Same (Return vehicle with the same fuel level as handed over).<br>
        2. Valid original Driving License &amp; Aadhaar must be presented during handover.<br>
        3. Fastag toll charges, parking fees, and state border permits are payable by customer.<br>
        4. For extensions or roadside assistance, contact: <strong>+91 96044 37794</strong>.
      </div>

      <div class="totals-box">
        <div class="total-row">
          <span>Rental Subtotal:</span>
          <span class="font-mono">₹${totalPrice.toLocaleString('en-IN')}</span>
        </div>
        <div class="total-row">
          <span>Security Deposit:</span>
          <span class="font-mono" style="color: #4B8039;">₹0 (Waived)</span>
        </div>
        <div class="total-row">
          <span>Advance Paid:</span>
          <span class="font-mono">₹${advancePaid.toLocaleString('en-IN')}</span>
        </div>
        <div class="total-row grand">
          <span>Balance Due:</span>
          <span class="font-mono">₹${balanceDue.toLocaleString('en-IN')}</span>
        </div>
        <div style="margin-top: 10px; text-align: right;">
          <span class="status-badge ${balanceDue === 0 ? 'status-paid' : 'status-pending'}">
            ● ${paymentStatus}
          </span>
        </div>
      </div>
    </div>

    <!-- 5. Footer & Signatures -->
    <div class="footer">
      <div style="font-size: 11px; color: #99989E;">
        This is a computer-generated tax invoice issued by Journey Rentals Solapur.<br>
        GSTIN: 27AABCT1234F1Z5 &nbsp;&middot;&nbsp; SAC Code: 996601
      </div>
      <div class="sign-box">
        <div class="sign-line"></div>
        <div class="sign-text">Authorized Signatory<br><span style="font-size: 10px; color: #6F6E73; font-weight: normal;">Journey Rentals Solapur</span></div>
      </div>
    </div>

  </div>

</body>
</html>`;
}

export function openBookingInvoiceInNewTab(booking) {
  if (!booking) return;
  const htmlContent = generateInvoiceHTML(booking);
  const win = window.open("", "_blank");
  if (!win) {
    alert("Please allow popups to view and download your invoice.");
    return;
  }
  win.document.open();
  win.document.write(htmlContent);
  win.document.close();
}
