#!/usr/bin/env node

/**
 * RacknSell Quotation PDF Generator — Matching Real RFQ Format
 *
 * Generates a professional PDF quotation matching the real RacknSell format
 * (see RFQ-023407.pdf) and uploads to S3.
 *
 * Usage: echo '<JSON>' | node generate-quotation-pdf.js
 *
 * Input JSON (via stdin):
 * {
 *   "quotationNo": "RNS-Q-20260315-1234",
 *   "date": "15/03/2026",
 *   "validUntil": "22/03/2026",
 *   "customerName": "Ashish Srivastava",
 *   "customerCompany": "IREP",
 *   "customerPhone": "8802563515",
 *   "customerEmail": "ashish@irepartners.com",
 *   "deliveryAddress": "Gurgaon",
 *   "items": [
 *     {
 *       "customerProductName": "Bosch angle grinder 125mm",
 *       "name": "Bosch GWS 6-125 Angle Grinder, 125 mm, 670 W",
 *       "brand": "Bosch",
 *       "specs": "",
 *       "rnsCode": "RS001011",
 *       "warranty": "N/A",
 *       "hsn": "",
 *       "qty": 2,
 *       "unit": "Nos",
 *       "unitPrice": 2860,
 *       "lineTotal": 5720,
 *       "gstPercent": 18,
 *       "gstAmount": 1029.6
 *     }
 *   ],
 *   "subtotal": 5720,
 *   "totalGst": 1029.6,
 *   "grandTotal": 6749.6,
 *   "paymentTerms": "Advance payment",
 *   "itemsNotFound": []
 * }
 */

const PDFDocument = require("pdfkit");
const https = require("https");
const http = require("http");
const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const BUCKET = process.env.S3_BUCKET || "racknsell-quotations";
const REGION = process.env.AWS_REGION || "ap-south-1";

// Fonts
const FONT_REGULAR = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf";
const FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf";

// Company info
const COMPANY = {
  name: "RacknSell Online Services Private Limited",
  address: "D34, Sector 2\nGautam Buddha Nagar, Uttar Pradesh - 201301",
  state: "State: Uttar Pradesh, Code: 09",
  gstin: "GSTIN: 09AAICR2279P1ZJ",
  regdOffice: "Regd Office :\nD34, Sector 2, Noida, Gautam Buddha Nagar, Uttar Pradesh - 201301",
};

// Column layout (A4 = 595 wide, margins 30 each side = 535 usable)
const LM = 30;
const RM = 30;
const PAGE_W = 595.28;
const USABLE_W = PAGE_W - LM - RM;

// Table column widths (total = USABLE_W ≈ 535)
const COL = {
  no: { x: LM, w: 28 },
  productName: { x: LM + 28, w: 155 },
  rnsProduct: { x: LM + 183, w: 170 },
  qty: { x: LM + 353, w: 45 },
  rate: { x: LM + 398, w: 70 },
  amount: { x: LM + 468, w: 67 },
};

function formatNum(n) {
  const num = Number(n);
  if (isNaN(num)) return "0.00";
  return num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function downloadLogo(url) {
  return new Promise((resolve) => {
    const client = url.startsWith("https") ? https : http;
    const req = client.get(url, { timeout: 5000 }, (res) => {
      if (res.statusCode !== 200) { resolve(null); return; }
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", () => resolve(null));
    });
    req.on("error", () => resolve(null));
    req.on("timeout", () => { req.destroy(); resolve(null); });
  });
}

// Measure text height for a given width
function textHeight(doc, text, font, size, width) {
  doc.font(font).fontSize(size);
  return doc.heightOfString(text || "", { width });
}

function generatePDFBuffer(data, logoBuffer) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 30, bottom: 60, left: LM, right: RM },
      bufferPages: true,
    });

    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.registerFont("Regular", FONT_REGULAR);
    doc.registerFont("Bold", FONT_BOLD);

    const items = data.items || [];
    let y = 0;
    let pageNum = 0;

    // ===================== DRAW HEADER (on every page) =====================
    function drawHeader() {
      pageNum++;

      // "Sales Quotation" title
      y = 30;
      doc.font("Bold").fontSize(14).fillColor("#333333");
      doc.text("Sales Quotation", LM, y, { width: USABLE_W, align: "center" });
      y += 25;

      // Logo + company info (left)
      const logoStartY = y;
      if (logoBuffer) {
        try {
          doc.image(logoBuffer, LM, y, { height: 40 });
        } catch (e) {
          doc.font("Bold").fontSize(16).fillColor("#F98315");
          doc.text("Rack'N'Sell", LM, y + 5);
        }
      } else {
        doc.font("Bold").fontSize(16).fillColor("#F98315");
        doc.text("Rack'N'Sell", LM, y + 5);
      }
      y += 45;

      doc.font("Regular").fontSize(7.5).fillColor("#333333");
      doc.text(COMPANY.name, LM, y, { width: 250 });
      y += 10;
      doc.text(COMPANY.address, LM, y, { width: 250 });
      y += 20;
      doc.text(COMPANY.state, LM, y, { width: 250 });
      y += 10;
      doc.text(COMPANY.gstin, LM, y, { width: 250 });

      // RFQ details (right side)
      const rfqX = 340;
      const rfqLabelW = 120;
      const rfqValX = 460;
      const rfqValW = 100;
      let ry = logoStartY + 5;

      doc.font("Bold").fontSize(8.5).fillColor("#333333");
      doc.text("RFQ No : ", rfqX, ry, { width: rfqLabelW, continued: false });
      doc.font("Bold").fontSize(8.5);
      doc.text(data.quotationNo || "", rfqValX, ry, { width: rfqValW });
      ry += 14;

      if (data.reference) {
        doc.font("Bold").fontSize(8).fillColor("#333333");
        doc.text("Reference : ", rfqX, ry, { width: rfqLabelW });
        doc.font("Bold").fontSize(8);
        doc.text(data.reference || "", rfqValX, ry, { width: rfqValW });
        ry += 14;
      }

      doc.font("Bold").fontSize(8.5).fillColor("#333333");
      doc.text("RFQ Date : ", rfqX, ry, { width: rfqLabelW });
      doc.font("Bold").fontSize(8.5);
      doc.text(data.date || "", rfqValX, ry, { width: rfqValW });
      ry += 14;

      doc.font("Bold").fontSize(8.5).fillColor("#333333");
      doc.text("RFQ Offer Date : ", rfqX, ry, { width: rfqLabelW });
      doc.font("Bold").fontSize(8.5);
      doc.text(data.date || "", rfqValX, ry, { width: rfqValW });

      y += 18;
      return y;
    }

    // ===================== DRAW CUSTOMER INFO (first page only) =====================
    function drawCustomerInfo() {
      y += 8;

      // Delivery Address (left)
      doc.font("Bold").fontSize(8.5).fillColor("#333333");
      doc.text("Delivery Address :", LM, y, { width: 200 });
      y += 12;
      doc.font("Regular").fontSize(8).fillColor("#333333");
      if (data.customerCompany) {
        doc.text(data.customerCompany, LM, y, { width: 200 });
        y += 11;
      }
      if (data.deliveryAddress) {
        doc.text(data.deliveryAddress, LM, y, { width: 200 });
      }

      // Requester (right)
      const reqX = 300;
      let reqY = y - (data.customerCompany ? 23 : 12);
      doc.font("Bold").fontSize(8.5).fillColor("#333333");
      doc.text("Requester :", reqX, reqY, { width: 200 });
      reqY += 14;
      doc.font("Regular").fontSize(8).fillColor("#333333");
      doc.text("Name : " + (data.customerName || ""), reqX, reqY, { width: 260 });
      reqY += 11;
      if (data.customerEmail) {
        doc.text("Email : " + data.customerEmail, reqX, reqY, { width: 260 });
        reqY += 11;
      }
      if (data.customerPhone) {
        doc.text("Mobile : " + data.customerPhone, reqX, reqY, { width: 260 });
        reqY += 11;
      }

      y = Math.max(y, reqY) + 12;
      return y;
    }

    // ===================== DRAW TABLE HEADER =====================
    function drawTableHeader() {
      const headerH = 38;

      // Header background
      doc.rect(LM, y, USABLE_W, headerH).lineWidth(0.5).strokeColor("#000000").stroke();

      // Vertical lines for columns
      [COL.productName, COL.rnsProduct, COL.qty, COL.rate, COL.amount].forEach((c) => {
        doc.moveTo(c.x, y).lineTo(c.x, y + headerH).stroke();
      });
      // Right edge
      doc.moveTo(LM + USABLE_W, y).lineTo(LM + USABLE_W, y + headerH).stroke();

      doc.font("Bold").fontSize(7).fillColor("#333333");

      // No.
      doc.text("No.", COL.no.x + 2, y + 14, { width: COL.no.w - 4, align: "center" });

      // Product Name / Make / Specification
      const col2CenterY = y + 4;
      doc.font("Bold").fontSize(7).fillColor("#333333");
      doc.text("Product Name", COL.productName.x + 4, col2CenterY, { width: COL.productName.w - 8, align: "center" });
      doc.text("Make", COL.productName.x + 4, col2CenterY + 12, { width: COL.productName.w - 8, align: "center" });
      doc.text("Specification", COL.productName.x + 4, col2CenterY + 24, { width: COL.productName.w - 8, align: "center" });

      // RNS Product Name / Remarks / Warranty
      doc.text("RNS Product Name", COL.rnsProduct.x + 4, col2CenterY, { width: COL.rnsProduct.w - 8, align: "center" });
      doc.text("Remarks", COL.rnsProduct.x + 4, col2CenterY + 12, { width: COL.rnsProduct.w - 8, align: "center" });
      doc.text("Warranty", COL.rnsProduct.x + 4, col2CenterY + 24, { width: COL.rnsProduct.w - 8, align: "center" });

      // Qty / UOM
      doc.text("Qty", COL.qty.x + 2, col2CenterY + 6, { width: COL.qty.w - 4, align: "center" });
      doc.text("UOM", COL.qty.x + 2, col2CenterY + 18, { width: COL.qty.w - 4, align: "center" });

      // Rate excl GST / GST / GST %
      doc.text("Rate excl", COL.rate.x + 2, col2CenterY, { width: COL.rate.w - 4, align: "center" });
      doc.text("GST", COL.rate.x + 2, col2CenterY + 12, { width: COL.rate.w - 4, align: "center" });
      doc.text("GST %", COL.rate.x + 2, col2CenterY + 24, { width: COL.rate.w - 4, align: "center" });

      // Amount
      doc.text("Amount", COL.amount.x + 2, col2CenterY + 14, { width: COL.amount.w - 4, align: "center" });

      y += headerH;
    }

    // ===================== CALCULATE ROW HEIGHT =====================
    function calcRowHeight(item) {
      const padding = 8;

      // Col 2 height: customerProductName + brand + specs
      let col2H = 0;
      col2H += textHeight(doc, item.customerProductName || item.name || "", "Regular", 7.5, COL.productName.w - 8);
      col2H += textHeight(doc, item.brand || "", "Regular", 7.5, COL.productName.w - 8);
      if (item.specs) col2H += textHeight(doc, item.specs, "Regular", 7, COL.productName.w - 8);

      // Col 3 height: rnsCode + name + HSN + warranty
      let col3H = 0;
      const rnsText = (item.rnsCode ? item.rnsCode + "\n" : "") + (item.name || "");
      col3H += textHeight(doc, rnsText, "Bold", 7.5, COL.rnsProduct.w - 8);
      if (item.hsn) col3H += textHeight(doc, "HSN: " + item.hsn, "Regular", 7, COL.rnsProduct.w - 8);
      col3H += textHeight(doc, "Warranty : " + (item.warranty || "N/A"), "Bold", 7, COL.rnsProduct.w - 8);
      col3H += 8; // spacing before warranty

      return Math.max(col2H, col3H) + padding + 8;
    }

    // ===================== DRAW TABLE ROW =====================
    function drawRow(item, index) {
      const rowH = calcRowHeight(item);

      // Check page break (leave 80px for footer)
      if (y + rowH > doc.page.height - 80) {
        doc.addPage();
        y = drawHeader();
        drawTableHeader();
      }

      // Row border
      doc.rect(LM, y, USABLE_W, rowH).lineWidth(0.5).strokeColor("#000000").stroke();

      // Column separators
      [COL.productName, COL.rnsProduct, COL.qty, COL.rate, COL.amount].forEach((c) => {
        doc.moveTo(c.x, y).lineTo(c.x, y + rowH).stroke();
      });
      doc.moveTo(LM + USABLE_W, y).lineTo(LM + USABLE_W, y + rowH).stroke();

      const cellPad = 4;
      let cellY = y + cellPad;

      // Col 1: No.
      doc.font("Regular").fontSize(7.5).fillColor("#333333");
      doc.text(String(index + 1), COL.no.x + 2, cellY, { width: COL.no.w - 4 });

      // Col 2: Product Name / Make / Spec
      let cy = cellY;
      doc.font("Regular").fontSize(7.5).fillColor("#333333");
      const custName = item.customerProductName || item.name || "";
      doc.text(custName, COL.productName.x + cellPad, cy, { width: COL.productName.w - 8 });
      cy += textHeight(doc, custName, "Regular", 7.5, COL.productName.w - 8) + 1;
      if (item.brand) {
        doc.font("Regular").fontSize(7.5).fillColor("#333333");
        doc.text(item.brand, COL.productName.x + cellPad, cy, { width: COL.productName.w - 8 });
        cy += textHeight(doc, item.brand, "Regular", 7.5, COL.productName.w - 8) + 1;
      }
      if (item.specs) {
        doc.font("Regular").fontSize(7).fillColor("#555555");
        doc.text(item.specs, COL.productName.x + cellPad, cy, { width: COL.productName.w - 8 });
      }

      // Col 3: RNS Product Name / Remarks / Warranty
      cy = cellY;
      doc.font("Bold").fontSize(7.5).fillColor("#333333");
      if (item.rnsCode) {
        doc.text(item.rnsCode, COL.rnsProduct.x + cellPad, cy, { width: COL.rnsProduct.w - 8 });
        cy += textHeight(doc, item.rnsCode, "Bold", 7.5, COL.rnsProduct.w - 8) + 1;
      }
      doc.font("Regular").fontSize(7).fillColor("#333333");
      const rnsName = item.name || "";
      doc.text(rnsName, COL.rnsProduct.x + cellPad, cy, { width: COL.rnsProduct.w - 8 });
      cy += textHeight(doc, rnsName, "Regular", 7, COL.rnsProduct.w - 8) + 1;

      if (item.hsn) {
        doc.font("Bold").fontSize(7).fillColor("#333333");
        doc.text("HSN: " + item.hsn, COL.rnsProduct.x + cellPad, cy, { width: COL.rnsProduct.w - 8 });
        cy += 10;
      }

      // Warranty at bottom of cell
      const warrantyY = y + rowH - 16;
      doc.font("Bold").fontSize(7).fillColor("#333333");
      doc.text("Warranty : " + (item.warranty || "N/A"), COL.rnsProduct.x + cellPad, warrantyY, { width: COL.rnsProduct.w - 8 });

      // Col 4: Qty / UOM
      doc.font("Regular").fontSize(8).fillColor("#333333");
      doc.text(String(item.qty || 0), COL.qty.x + 2, cellY, { width: COL.qty.w - 4, align: "right" });
      doc.text(item.unit || "Nos", COL.qty.x + 2, cellY + 12, { width: COL.qty.w - 4, align: "left" });

      // Col 5: Rate / GST %
      doc.font("Regular").fontSize(8).fillColor("#333333");
      doc.text(formatNum(item.unitPrice), COL.rate.x + 2, cellY, { width: COL.rate.w - 4, align: "right" });
      doc.text((item.gstPercent || 18) + ".00%", COL.rate.x + 2, cellY + 12, { width: COL.rate.w - 4, align: "right" });

      // Col 6: Amount
      doc.font("Regular").fontSize(8).fillColor("#333333");
      doc.text(formatNum(item.lineTotal), COL.amount.x + 2, cellY, { width: COL.amount.w - 4, align: "right" });

      y += rowH;
    }

    // ===================== DRAW TOTALS =====================
    function drawTotals() {
      y += 2;
      const totalsW = COL.rate.w + COL.amount.w;
      const totalsX = COL.rate.x;
      const labelW = COL.rate.w;
      const valX = COL.amount.x;
      const valW = COL.amount.w;

      // Total (excl GST)
      doc.rect(totalsX, y, totalsW, 18).lineWidth(0.5).strokeColor("#000000").stroke();
      doc.moveTo(valX, y).lineTo(valX, y + 18).stroke();
      doc.font("Regular").fontSize(8).fillColor("#333333");
      doc.text("Total (excl GST)", totalsX + 4, y + 4, { width: labelW - 8, align: "right" });
      doc.text(formatNum(data.subtotal), valX + 2, y + 4, { width: valW - 4, align: "right" });
      y += 18;

      // GST
      doc.rect(totalsX, y, totalsW, 18).lineWidth(0.5).strokeColor("#000000").stroke();
      doc.moveTo(valX, y).lineTo(valX, y + 18).stroke();
      doc.text("GST", totalsX + 4, y + 4, { width: labelW - 8, align: "right" });
      doc.text(formatNum(data.totalGst), valX + 2, y + 4, { width: valW - 4, align: "right" });
      y += 18;

      // Total (incl GST)
      doc.rect(totalsX, y, totalsW, 18).lineWidth(0.5).strokeColor("#000000").stroke();
      doc.moveTo(valX, y).lineTo(valX, y + 18).stroke();
      doc.font("Bold").fontSize(8).fillColor("#333333");
      doc.text("Total (incl GST)", totalsX + 4, y + 4, { width: labelW - 8, align: "right" });
      doc.text(formatNum(data.grandTotal), valX + 2, y + 4, { width: valW - 4, align: "right" });
      y += 18;
    }

    // ===================== DRAW TERMS =====================
    function drawTerms() {
      y += 12;
      doc.font("Bold").fontSize(8.5).fillColor("#333333");

      const terms = [
        ["Payment Terms -", data.paymentTerms || "Advance payment"],
        ["GST -", "Additional as indicated"],
        ["Freight -", "Inclusive"],
        ["Quote validity -", data.quoteValidity || "7 Days"],
        ["Delivery timeline -", data.deliveryTimeline || "5-10 Working Days"],
      ];

      terms.forEach(([label, value]) => {
        doc.font("Bold").fontSize(8.5).fillColor("#333333");
        doc.text(label + " ", LM, y, { width: 130, continued: true });
        doc.font("Regular").fontSize(8.5);
        doc.text(value, { width: 300 });
        y += 14;
      });

      // Items not found
      if (data.itemsNotFound && data.itemsNotFound.length > 0) {
        y += 8;
        doc.font("Bold").fontSize(8).fillColor("#CC6600");
        doc.text("Note: The following items were not found in our catalog. Our team will source pricing within 24 hours:", LM, y, { width: USABLE_W });
        y += 14;
        doc.font("Regular").fontSize(8).fillColor("#333333");
        data.itemsNotFound.forEach((nf) => {
          doc.text("\u2022  " + nf.name + " \u2014 " + nf.qty + " " + (nf.unit || "units"), LM + 5, y, { width: USABLE_W - 10 });
          y += 12;
        });
      }
    }

    // ===================== DRAW PAGE FOOTER (on every page) =====================
    function drawPageFooters() {
      const range = doc.bufferedPageRange();
      const totalPages = range.count;

      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        const footerY = doc.page.height - 55;

        doc.save();
        // Line
        doc.moveTo(LM, footerY).lineTo(LM + USABLE_W, footerY).lineWidth(0.5).strokeColor("#333333").stroke();

        // Page number
        doc.font("Regular").fontSize(7).fillColor("#666666");
        doc.text((i - range.start + 1) + " of " + totalPages, LM, footerY + 5, { width: USABLE_W, align: "right" });

        // Regd Office
        doc.font("Regular").fontSize(7).fillColor("#333333");
        doc.text("Regd Office :", LM, footerY + 18, { width: USABLE_W, align: "center" });
        doc.text("D34, Sector 2, Noida, Gautam Buddha Nagar, Uttar Pradesh - 201301", LM, footerY + 28, { width: USABLE_W, align: "center" });

        doc.restore();
      }
    }

    // ===================== BUILD PDF =====================

    // Page 1 header + customer info
    y = drawHeader();
    drawCustomerInfo();

    // Separator line
    doc.moveTo(LM, y).lineTo(LM + USABLE_W, y).lineWidth(0.5).strokeColor("#999999").stroke();
    y += 8;

    // Table
    drawTableHeader();
    items.forEach((item, i) => drawRow(item, i));

    // Totals + Terms
    drawTotals();
    drawTerms();

    // Page footers (drawn on all pages at the end)
    drawPageFooters();

    doc.end();
  });
}

async function uploadToS3(buffer, key) {
  const s3 = new S3Client({ region: REGION });

  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: "application/pdf",
    ContentDisposition: `attachment; filename="${key.split("/").pop()}"`,
  }));

  const url = await getSignedUrl(s3, new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ResponseContentDisposition: `attachment; filename="${key.split("/").pop()}"`,
  }), { expiresIn: 7 * 24 * 60 * 60 });

  return url;
}

async function main() {
  let input = "";
  process.stdin.setEncoding("utf8");
  for await (const chunk of process.stdin) {
    input += chunk;
  }

  let data;
  try {
    data = JSON.parse(input);
  } catch (e) {
    console.error("Invalid JSON input:", e.message);
    process.exit(1);
  }

  try {
    let logoBuffer = null;
    try {
      logoBuffer = await downloadLogo("https://www.racknsell.com/assetsV2/img/logo.png");
    } catch (e) { /* skip */ }

    const pdfBuffer = await generatePDFBuffer(data, logoBuffer);

    const dateFolder = data.date ? data.date.split("/").reverse().join("-") : new Date().toISOString().slice(0, 10);
    const s3Key = `quotations/${dateFolder}/${data.quotationNo}.pdf`;
    const url = await uploadToS3(pdfBuffer, s3Key);

    console.log(url);
  } catch (e) {
    console.error("Failed:", e.message);
    process.exit(1);
  }
}

main();
