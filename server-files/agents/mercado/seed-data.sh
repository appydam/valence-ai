#!/bin/bash
# ============================================================================
# RacknSell Test Data — Google Sheets Seed Script
# ============================================================================
# Prerequisites:
#   npm install -g @googleworkspace/cli
#   gws auth setup   (authenticate with Google account)
#
# Usage:
#   chmod +x seed-data.sh
#   ./seed-data.sh
#
# Output: Prints the spreadsheet ID — paste this into SOUL.md
# ============================================================================

set -euo pipefail

echo "🏪 Creating RacknSell test spreadsheet..."

# --- Step 1: Create the spreadsheet ---
CREATE_RESPONSE=$(gws sheets spreadsheets create --json '{
  "properties": { "title": "RacknSell - Test Data" },
  "sheets": [
    { "properties": { "title": "Products", "index": 0 } },
    { "properties": { "title": "Customers", "index": 1 } },
    { "properties": { "title": "Orders", "index": 2 } },
    { "properties": { "title": "Quotation Log", "index": 3 } }
  ]
}')

SPREADSHEET_ID=$(echo "$CREATE_RESPONSE" | jq -r '.spreadsheetId')

if [ -z "$SPREADSHEET_ID" ] || [ "$SPREADSHEET_ID" = "null" ]; then
  echo "❌ Failed to create spreadsheet. Response:"
  echo "$CREATE_RESPONSE"
  exit 1
fi

echo "✅ Spreadsheet created: $SPREADSHEET_ID"
echo "   URL: https://docs.google.com/spreadsheets/d/$SPREADSHEET_ID/edit"

# --- Step 2: Seed Products tab (50 products) ---
echo "📦 Seeding Products tab..."

gws sheets spreadsheets values update \
  --params "{\"spreadsheetId\": \"$SPREADSHEET_ID\", \"range\": \"Products!A1:K51\", \"valueInputOption\": \"USER_ENTERED\"}" \
  --json '{
  "values": [
    ["SKU", "product_name", "brand", "category", "description", "unit", "unit_cost_inr", "min_order_qty", "stock_status", "gst_percent", "alternate_names"],
    ["SAF-001", "3M N95 Respirator Mask 8210", "3M", "Safety Equipment", "NIOSH-approved N95 FFP2 respirator, 20 per box", "piece", 38, 20, "in_stock", 18, "N95 mask, respirator, dust mask"],
    ["SAF-002", "Karam Safety Helmet IS certified", "Karam", "Safety Equipment", "HDPE safety helmet, ISI marked, white", "piece", 180, 10, "in_stock", 18, "hard hat, helmet, safety helmet"],
    ["SAF-003", "Mallcom Safety Shoe PVC Sole", "Mallcom", "Safety Equipment", "Steel toe cap, PVC sole, ISI marked", "pair", 650, 5, "in_stock", 12, "safety boots, steel toe, safety shoes"],
    ["SAF-004", "JK Safety Goggles Clear", "JK", "Safety Equipment", "Anti-fog, anti-scratch, EN166 certified", "piece", 95, 5, "in_stock", 18, "safety goggles, eye protection"],
    ["SAF-005", "Karam Full Body Safety Harness", "Karam", "Safety Equipment", "Class A, EN361, polyester webbing", "piece", 3200, 1, "low_stock", 18, "safety harness, fall arrest, fall protection"],
    ["SAF-006", "Portwest Ear Plugs Foam 50 pairs", "Portwest", "Safety Equipment", "EN352 certified, 37dB SNR", "pack", 220, 5, "in_stock", 18, "ear plugs, hearing protection, ear safety"],
    ["SAF-007", "Lakeland Chemical Resistant Gloves L", "Lakeland", "Safety Equipment", "Nitrile, 12 inch, EN374", "pair", 185, 10, "in_stock", 18, "chemical gloves, nitrile gloves, rubber gloves"],
    ["SAF-008", "3M Welding Shield DIN5", "3M", "Safety Equipment", "Auto-darkening, DIN 5-13, face shield", "piece", 1450, 1, "in_stock", 18, "welding mask, welding shield, face shield"],
    ["ELE-001", "Havells MCB 32A Double Pole", "Havells", "Electrical", "C-curve MCB, 10kA breaking capacity", "piece", 420, 1, "in_stock", 18, "circuit breaker, MCB, miniature circuit breaker"],
    ["ELE-002", "Havells MCB 16A Single Pole", "Havells", "Electrical", "C-curve MCB, 6kA", "piece", 145, 1, "in_stock", 18, "MCB, circuit breaker, single pole"],
    ["ELE-003", "Finolex FR Wire 2.5mm 90m", "Finolex", "Electrical", "PVC insulated FR wire, red/green/blue", "coil", 1250, 1, "in_stock", 18, "electrical wire, FR cable, 2.5mm wire"],
    ["ELE-004", "Finolex FR Wire 1.5mm 90m", "Finolex", "Electrical", "PVC insulated FR wire", "coil", 820, 1, "in_stock", 18, "electrical wire, 1.5mm wire, FR wire"],
    ["ELE-005", "Anchor Roma Switch 6A", "Anchor", "Electrical", "Modular 6A switch, white", "piece", 52, 10, "in_stock", 18, "light switch, modular switch, 6A switch"],
    ["ELE-006", "Anchor Roma 16A Socket", "Anchor", "Electrical", "Modular 16A 3-pin socket", "piece", 85, 10, "in_stock", 18, "power socket, 3-pin socket, 16A socket"],
    ["ELE-007", "Havells 4-way Extension Board 2m", "Havells", "Electrical", "10A sockets, surge protection", "piece", 380, 3, "in_stock", 18, "extension board, power strip"],
    ["ELE-008", "Legrand MCB 63A 4P", "Legrand", "Electrical", "4-pole MCB, 10kA", "piece", 980, 1, "in_stock", 18, "4 pole MCB, main switch, 63A MCB"],
    ["ELE-009", "Havells Cable Gland M20", "Havells", "Electrical", "Nickel-plated brass, IP68", "piece", 65, 10, "in_stock", 18, "cable gland, cable entry, M20 gland"],
    ["ELE-010", "Polycab FR PVC Wire 4mm 90m", "Polycab", "Electrical", "FR grade, ISI marked", "coil", 2100, 1, "in_stock", 18, "electrical wire, 4mm cable, 4mm wire"],
    ["ELE-011", "Schneider Earth Leakage CB 40A", "Schneider", "Electrical", "ELCB, 30mA sensitivity, 2P", "piece", 1850, 1, "in_stock", 18, "ELCB, earth leakage, RCD, RCCB"],
    ["PWR-001", "Bosch GSB 500 RE Drill Machine", "Bosch", "Power Tools", "500W impact drill, 13mm chuck, 0-2800 RPM", "piece", 2800, 1, "in_stock", 18, "drill machine, impact drill, bosch drill"],
    ["PWR-002", "Bosch GBM 350 RE Drill", "Bosch", "Power Tools", "350W rotary drill, 10mm chuck", "piece", 1800, 1, "in_stock", 18, "drill machine, rotary drill"],
    ["PWR-003", "Stanley Angle Grinder 4 inch", "Stanley", "Power Tools", "800W, 4-inch grinding wheel", "piece", 1200, 1, "in_stock", 18, "grinder, angle grinder, cutting machine"],
    ["PWR-004", "Hitachi SV13YA Jigsaw", "Hitachi", "Power Tools", "450W, 0-2800 spm", "piece", 3200, 1, "in_stock", 18, "jig saw, electric saw, jigsaw machine"],
    ["HND-001", "Stanley Combination Plier 8 inch", "Stanley", "Hand Tools", "Chrome vanadium steel, bi-material handle", "piece", 280, 1, "in_stock", 18, "plier, combination plier, lineman plier"],
    ["HND-002", "Taparia Screwdriver Set 6pc", "Taparia", "Hand Tools", "Phillips and flathead, CRV steel", "set", 320, 1, "in_stock", 18, "screwdriver set, screwdriver kit"],
    ["HND-003", "Ambika Adjustable Wrench 12 inch", "Ambika", "Hand Tools", "Drop forged steel", "piece", 220, 1, "in_stock", 18, "spanner, wrench, adjustable wrench"],
    ["HND-004", "Gedore Open End Spanner Set 8pc", "Gedore", "Hand Tools", "Chrome vanadium, 8-24mm", "set", 1850, 1, "in_stock", 18, "spanner set, wrench set, open end"],
    ["HND-005", "Cumi Abrasive Disc 4 inch 100 grit", "Cumi", "Hand Tools", "Aluminium oxide, 10 per pack", "pack", 180, 5, "in_stock", 18, "grinding disc, flap disc, abrasive wheel"],
    ["CLN-001", "3M Cable Tie Black 200mm", "3M", "Consumables", "Nylon 66, UV resistant, 100 per pack", "pack", 95, 5, "in_stock", 18, "cable tie, zip tie, nylon tie, tie wrap"],
    ["CLN-002", "Tesa Masking Tape 24mm", "Tesa", "Consumables", "General purpose masking, 25m roll", "roll", 38, 12, "in_stock", 18, "masking tape, painter tape"],
    ["CLN-003", "3M Electrical Tape Black", "3M", "Consumables", "PVC insulation tape, 18mm x 20m", "roll", 28, 10, "in_stock", 18, "insulation tape, electrical tape, PVC tape"],
    ["CLN-004", "Scotch-Brite Heavy Duty Pad", "3M", "Cleaning Supplies", "Industrial grade scrubbing, pack of 10", "pack", 180, 5, "in_stock", 18, "scrubbing pad, scotch brite, scouring pad"],
    ["CLN-005", "Colin Glass Cleaner 500ml", "Colin", "Cleaning Supplies", "Ammonia-free formula, trigger spray", "bottle", 85, 12, "in_stock", 18, "glass cleaner, window cleaner"],
    ["CLN-006", "Dettol Surface Cleaner 500ml", "Dettol", "Cleaning Supplies", "Hospital grade disinfectant", "bottle", 95, 12, "in_stock", 5, "disinfectant, surface cleaner, sanitizer"],
    ["LIT-001", "Philips LED Tube 20W", "Philips", "Lighting", "T8 LED, 4000K neutral white, 1200mm", "piece", 280, 5, "in_stock", 18, "LED tube, tubelight, T8 tube"],
    ["LIT-002", "Syska LED Bulb 9W", "Syska", "Lighting", "E27 base, 6500K cool white", "piece", 65, 10, "in_stock", 18, "LED bulb, CFL replacement, light bulb"],
    ["LIT-003", "Havells LED Batten 20W", "Havells", "Lighting", "2-feet batten, 4000K, IP20", "piece", 320, 5, "in_stock", 18, "batten light, surface light, LED batten"],
    ["LIT-004", "Eveready Industrial Torch", "Eveready", "Lighting", "3D cell, weather resistant", "piece", 290, 5, "in_stock", 12, "torch, flashlight, hand torch"],
    ["OFF-001", "Camlin Ball Pen Blue 10pk", "Camlin", "Office Supplies", "0.7mm tip, smooth write", "pack", 45, 10, "in_stock", 12, "ball pen, ballpoint pen, blue pen"],
    ["OFF-002", "Classmate A4 Ruled Register 200pg", "Classmate", "Office Supplies", "Hard cover, 200 pages ruled", "piece", 110, 5, "in_stock", 12, "register, notebook, A4 register"],
    ["OFF-003", "3M Post-It Notes 76x76mm", "3M", "Office Supplies", "Canary yellow, 100 sheets per pad", "pad", 95, 5, "in_stock", 12, "post it, sticky notes"],
    ["OFF-004", "HP A4 Paper 75gsm 500 sheets", "HP", "Office Supplies", "Bright white, laser/inkjet compatible", "ream", 285, 5, "in_stock", 12, "A4 paper, copier paper, printer paper"],
    ["OFF-005", "Leitz Stapler Heavy Duty 50 sheet", "Leitz", "Office Supplies", "Metal body, 50 sheet capacity", "piece", 680, 3, "in_stock", 12, "stapler, heavy duty stapler"],
    ["PLU-001", "Astral CPVC Pipe 1 inch 3m", "Astral", "Plumbing", "Schedule 40 CPVC, hot/cold water", "piece", 320, 5, "in_stock", 18, "CPVC pipe, water pipe, plumbing pipe"],
    ["PLU-002", "Supreme UPVC Ball Valve 0.5 inch", "Supreme", "Plumbing", "Lead-free UPVC, full bore", "piece", 95, 5, "in_stock", 18, "ball valve, stop cock, water valve"],
    ["PLU-003", "Jaquar CP Bib Cock 0.5 inch", "Jaquar", "Plumbing", "Chrome plated brass", "piece", 380, 5, "in_stock", 18, "tap, bib cock, water tap"],
    ["ADH-001", "Fevicol SH 1kg", "Pidilite", "Adhesives", "White wood adhesive", "kg", 180, 5, "in_stock", 18, "fevicol, wood glue, white glue"],
    ["ADH-002", "Araldite Standard Epoxy 50g", "Huntsman", "Adhesives", "2-component epoxy, 50g pack", "pack", 75, 10, "in_stock", 18, "epoxy, araldite, 2-part adhesive"],
    ["ADH-003", "Pidilite M-seal Epoxy 25g", "Pidilite", "Adhesives", "Waterproof epoxy putty", "pack", 42, 20, "in_stock", 18, "m-seal, epoxy putty, plumber epoxy"],
    ["ADH-004", "Pidilite Feviquick 20g", "Pidilite", "Adhesives", "Instant cyanoacrylate adhesive", "piece", 28, 20, "in_stock", 18, "super glue, CA glue, instant glue"]
  ]
}'

echo "✅ Products seeded (50 items)"

# --- Step 3: Seed Customers tab (12 customers) ---
echo "👥 Seeding Customers tab..."

gws sheets spreadsheets values update \
  --params "{\"spreadsheetId\": \"$SPREADSHEET_ID\", \"range\": \"Customers!A1:J13\", \"valueInputOption\": \"USER_ENTERED\"}" \
  --json '{
  "values": [
    ["customer_id", "name", "company", "phone", "email", "tier", "payment_terms", "outstanding_dues_inr", "location", "notes"],
    ["CUST-001", "Rajesh Kumar", "Bharat Engineering Works", "+919811123456", "rajesh@bharateng.in", "premium", "30_days", 0, "Manesar, Haryana", "Regular buyer of electrical and power tools"],
    ["CUST-002", "Anita Sharma", "SkyTech Facility Services", "+919888234567", "anita@skytechfm.com", "regular", "15_days", 15000, "Noida, UP", "Facility management, bulk cleaning supplies"],
    ["CUST-003", "Manoj Patel", "Patel Construction", "+919922345678", "", "regular", "advance", 0, "Ahmedabad, Gujarat", "Construction — safety equipment and hand tools"],
    ["CUST-004", "Srinivas Rao", "HydroTech Industries", "+918800456789", "s.rao@hydrotech.co.in", "vip", "30_days", 0, "Hyderabad, TS", "Large orders, contracted rates on Havells and 3M"],
    ["CUST-005", "Pankaj Verma", "Office Depot (Reseller)", "+919711567890", "pverma@officedepot.in", "premium", "15_days", 0, "Delhi", "Resells to corporate offices"],
    ["CUST-006", "Fatima Sheikh", "Crescent Hospital", "+919600678901", "fatima@crescenthospital.org", "vip", "30_days", 0, "Mumbai, MH", "Medical facility — safety, cleaning, electrical"],
    ["CUST-007", "Arvind Singh", "Singh Metal Works", "+919555789012", "arvind@singhmetal.in", "regular", "advance", 8000, "Ludhiana, Punjab", "Small manufacturer, power tools and consumables"],
    ["CUST-008", "Deepika Nair", "CleanPro Housekeeping", "+919444890123", "deepika@cleanpro.in", "regular", "15_days", 0, "Bengaluru, KA", "Commercial cleaning company"],
    ["CUST-009", "Ramesh Gupta", "Gupta Electricals", "+919333901234", "rgupta@guptaelectricals.com", "premium", "30_days", 45000, "Jaipur, RJ", "Electrical contractor, large project orders"],
    ["CUST-010", "Nisha Trivedi", "National Paper Mills", "+919222012345", "nisha@nationalpapers.in", "vip", "30_days", 0, "Pune, MH", "Industrial — safety equipment, PPE, tools"],
    ["CUST-011", "Aarav Mehta", "Mehta Builders", "+919111123456", "aarav@mehtabuilders.com", "regular", "15_days", 0, "Surat, Gujarat", "Construction company"],
    ["CUST-012", "Suresh Pillai", "Southern Textiles", "+918999234567", "spillai@southerntex.in", "regular", "advance", 0, "Coimbatore, TN", "Textile factory — safety PPE"]
  ]
}'

echo "✅ Customers seeded (12 records)"

# --- Step 4: Seed Orders tab (30 records) ---
echo "📋 Seeding Orders tab..."

gws sheets spreadsheets values update \
  --params "{\"spreadsheetId\": \"$SPREADSHEET_ID\", \"range\": \"Orders!A1:I31\", \"valueInputOption\": \"USER_ENTERED\"}" \
  --json '{
  "values": [
    ["order_id", "customer_id", "order_date", "sku", "product_name", "quantity", "unit_price_inr", "total_inr", "status"],
    ["ORD-001", "CUST-001", "2026-01-15", "PWR-001", "Bosch GSB 500 RE Drill Machine", 3, 3350, 10050, "delivered"],
    ["ORD-001", "CUST-001", "2026-01-15", "ELE-001", "Havells MCB 32A Double Pole", 10, 510, 5100, "delivered"],
    ["ORD-002", "CUST-001", "2026-02-08", "ELE-003", "Finolex FR Wire 2.5mm 90m", 20, 1490, 29800, "delivered"],
    ["ORD-003", "CUST-002", "2026-01-20", "CLN-006", "Dettol Surface Cleaner 500ml", 50, 100, 5000, "delivered"],
    ["ORD-003", "CUST-002", "2026-01-20", "CLN-004", "Scotch-Brite Heavy Duty Pad", 20, 215, 4300, "delivered"],
    ["ORD-004", "CUST-004", "2026-01-10", "SAF-001", "3M N95 Respirator Mask 8210", 500, 42, 21000, "delivered"],
    ["ORD-004", "CUST-004", "2026-01-10", "ELE-001", "Havells MCB 32A Double Pole", 50, 460, 23000, "delivered"],
    ["ORD-005", "CUST-004", "2026-02-18", "ELE-010", "Polycab FR PVC Wire 4mm 90m", 30, 2310, 69300, "delivered"],
    ["ORD-006", "CUST-005", "2026-01-25", "OFF-004", "HP A4 Paper 75gsm 500 sheets", 100, 300, 30000, "delivered"],
    ["ORD-006", "CUST-005", "2026-01-25", "OFF-001", "Camlin Ball Pen Blue 10pk", 50, 50, 2500, "delivered"],
    ["ORD-007", "CUST-006", "2026-02-01", "SAF-001", "3M N95 Respirator Mask 8210", 200, 44, 8800, "delivered"],
    ["ORD-007", "CUST-006", "2026-02-01", "CLN-006", "Dettol Surface Cleaner 500ml", 100, 98, 9800, "delivered"],
    ["ORD-007", "CUST-006", "2026-02-01", "SAF-004", "JK Safety Goggles Clear", 30, 110, 3300, "delivered"],
    ["ORD-008", "CUST-007", "2026-01-12", "PWR-003", "Stanley Angle Grinder 4 inch", 5, 1440, 7200, "delivered"],
    ["ORD-008", "CUST-007", "2026-01-12", "HND-005", "Cumi Abrasive Disc 4 inch", 10, 215, 2150, "delivered"],
    ["ORD-009", "CUST-008", "2026-02-10", "CLN-004", "Scotch-Brite Heavy Duty Pad", 30, 210, 6300, "delivered"],
    ["ORD-009", "CUST-008", "2026-02-10", "CLN-005", "Colin Glass Cleaner 500ml", 24, 95, 2280, "delivered"],
    ["ORD-010", "CUST-009", "2026-01-08", "ELE-001", "Havells MCB 32A Double Pole", 100, 480, 48000, "delivered"],
    ["ORD-010", "CUST-009", "2026-01-08", "ELE-011", "Schneider Earth Leakage CB 40A", 20, 2100, 42000, "delivered"],
    ["ORD-011", "CUST-010", "2026-02-22", "SAF-005", "Karam Full Body Safety Harness", 10, 3650, 36500, "delivered"],
    ["ORD-011", "CUST-010", "2026-02-22", "SAF-006", "Portwest Ear Plugs 50 pairs", 20, 260, 5200, "delivered"],
    ["ORD-011", "CUST-010", "2026-02-22", "SAF-007", "Lakeland Chemical Resistant Gloves", 50, 215, 10750, "delivered"],
    ["ORD-012", "CUST-003", "2026-02-05", "SAF-002", "Karam Safety Helmet", 50, 210, 10500, "delivered"],
    ["ORD-012", "CUST-003", "2026-02-05", "SAF-003", "Mallcom Safety Shoe PVC Sole", 25, 780, 19500, "delivered"],
    ["ORD-013", "CUST-001", "2026-03-01", "SAF-001", "3M N95 Respirator Mask 8210", 100, 46, 4600, "pending"],
    ["ORD-014", "CUST-004", "2026-03-05", "ELE-001", "Havells MCB 32A Double Pole", 200, 450, 90000, "pending"],
    ["ORD-015", "CUST-009", "2025-12-15", "ELE-003", "Finolex FR Wire 2.5mm 90m", 40, 1450, 58000, "delivered"],
    ["ORD-016", "CUST-005", "2026-02-28", "OFF-002", "Classmate A4 Register 200pg", 100, 120, 12000, "delivered"],
    ["ORD-017", "CUST-006", "2026-03-08", "SAF-001", "3M N95 Respirator Mask 8210", 300, 43, 12900, "pending"]
  ]
}'

echo "✅ Orders seeded (30 records)"

# --- Step 5: Seed Quotation Log headers ---
echo "📝 Seeding Quotation Log headers..."

gws sheets spreadsheets values update \
  --params "{\"spreadsheetId\": \"$SPREADSHEET_ID\", \"range\": \"Quotation Log!A1:H1\", \"valueInputOption\": \"USER_ENTERED\"}" \
  --json '{
  "values": [
    ["quotation_no", "customer_id", "customer_name", "date", "total_ex_gst", "margin_pct", "sent_via", "status"]
  ]
}'

echo "✅ Quotation Log headers set"

# --- Done ---
echo ""
echo "============================================"
echo "🎉 RacknSell test data ready!"
echo ""
echo "Spreadsheet ID: $SPREADSHEET_ID"
echo "URL: https://docs.google.com/spreadsheets/d/$SPREADSHEET_ID/edit"
echo ""
echo "👉 Paste this ID into SOUL.md where it says SPREADSHEET_ID"
echo "============================================"
