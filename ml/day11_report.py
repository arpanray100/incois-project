# day11_report.py
import os
import pandas as pd
import datetime
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet

# Paths
OUTPUT_DIR = "analytics_outputs"
CSV_FILE = os.path.join(OUTPUT_DIR, "all_requests_with_predictions.csv")
BAR_CHART = os.path.join(OUTPUT_DIR, "hazard_bar.html.png")   # converted to PNG
PIE_CHART = os.path.join(OUTPUT_DIR, "hazard_pie.html.png")   # converted to PNG
PDF_FILE = os.path.join(OUTPUT_DIR, "hazard_report.pdf")

# -----------------------------
# Step 1: Load analytics data
# -----------------------------
if not os.path.exists(CSV_FILE):
    print("⚠️ No analytics CSV found. Run day10_analytics.py first.")
    exit()

df = pd.read_csv(CSV_FILE)

hazard_counts = df["predicted_hazard"].value_counts().reset_index()
hazard_counts.columns = ["Hazard", "Count"]

# -----------------------------
# Step 2: Prepare PDF document
# -----------------------------
styles = getSampleStyleSheet()
doc = SimpleDocTemplate(PDF_FILE, pagesize=A4)
elements = []

# Title
title = Paragraph("<b>Disaster Management Hazard Report</b>", styles['Title'])
elements.append(title)
elements.append(Spacer(1, 12))

# Metadata
timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
meta_text = f"Generated on: {timestamp}<br/>Total Requests Analyzed: {len(df)}"
elements.append(Paragraph(meta_text, styles['Normal']))
elements.append(Spacer(1, 12))

# -----------------------------
# Step 3: Add hazard counts table
# -----------------------------
table_data = [["Hazard", "Count"]] + hazard_counts.values.tolist()
table = Table(table_data)
table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
    ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
    ('GRID', (0, 0), (-1, -1), 1, colors.black),
]))
elements.append(table)
elements.append(Spacer(1, 20))

# -----------------------------
# Step 4: Add charts (convert HTML → PNG manually before running)
# -----------------------------
if os.path.exists(BAR_CHART):
    elements.append(Paragraph("<b>Hazard Request Counts</b>", styles['Heading2']))
    elements.append(Image(BAR_CHART, width=400, height=250))
    elements.append(Spacer(1, 12))

if os.path.exists(PIE_CHART):
    elements.append(Paragraph("<b>Hazard Distribution</b>", styles['Heading2']))
    elements.append(Image(PIE_CHART, width=400, height=250))
    elements.append(Spacer(1, 12))

# -----------------------------
# Step 5: Build PDF
# -----------------------------
doc.build(elements)
print(f"✅ PDF Report generated: {PDF_FILE}")
