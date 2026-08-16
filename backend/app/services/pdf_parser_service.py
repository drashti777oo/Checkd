import re
from typing import Dict, Any, List, Optional


def parse_health_metrics_from_text(raw_text: str) -> Dict[str, Any]:
    """
    Parses plain text extracted from a health report or laboratory PDF into structured metrics.
    Preserves value, unit, reference_range, and source label.
    """
    if not raw_text:
        return {
            "metrics": [],
            "extracted_count": 0,
            "report_date": None,
            "raw_text_summary": "",
        }

    metrics: List[Dict[str, Any]] = []

    # 1. Heart Rate / Pulse
    hr_match = re.search(r'(?:heart\s*rate|pulse|hr)\s*[:=]?\s*(\d{2,3})\s*(bpm|beats/min)?', raw_text, re.IGNORECASE)
    if hr_match:
        metrics.append({
            "key": "heart_rate",
            "label": "Heart Rate",
            "value": float(hr_match.group(1)),
            "unit": "bpm",
            "reference_range": "60 - 100 bpm",
            "status": "normal" if 60 <= float(hr_match.group(1)) <= 100 else "attention",
        })

    # 2. Blood Pressure (e.g. 120/80 mmHg)
    bp_match = re.search(r'(?:blood\s*pressure|bp)\s*[:=]?\s*(\d{2,3})\s*/\s*(\d{2,3})\s*(mmHg)?', raw_text, re.IGNORECASE)
    if bp_match:
        sys_val = float(bp_match.group(1))
        dia_val = float(bp_match.group(2))
        metrics.append({
            "key": "blood_pressure",
            "label": "Blood Pressure",
            "value": f"{int(sys_val)}/{int(dia_val)}",
            "unit": "mmHg",
            "reference_range": "90/60 - 120/80 mmHg",
            "status": "normal" if (sys_val <= 120 and dia_val <= 80) else "attention",
        })

    # 3. Blood Glucose / Fasting Glucose
    glucose_match = re.search(r'(?:fasting\s*)?(?:blood\s*)?glucose\s*[:=]?\s*(\d{2,3}(?:\.\d+)?)\s*(mg/dL|mmol/L)?', raw_text, re.IGNORECASE)
    if glucose_match:
        g_val = float(glucose_match.group(1))
        unit = glucose_match.group(2) or "mg/dL"
        metrics.append({
            "key": "glucose",
            "label": "Blood Glucose",
            "value": g_val,
            "unit": unit,
            "reference_range": "70 - 99 mg/dL",
            "status": "normal" if 70 <= g_val <= 99 else "attention",
        })

    # 4. HbA1c (Glycated Hemoglobin)
    hba1c_match = re.search(r'(?:hba1c|a1c|glycated\s*hemoglobin)\s*[:=]?\s*(\d{1,2}(?:\.\d+)?)\s*%?', raw_text, re.IGNORECASE)
    if hba1c_match:
        a1c_val = float(hba1c_match.group(1))
        metrics.append({
            "key": "hba1c",
            "label": "HbA1c",
            "value": a1c_val,
            "unit": "%",
            "reference_range": "4.0 - 5.6 %",
            "status": "normal" if a1c_val <= 5.6 else "attention",
        })

    # 5. Total Cholesterol
    chol_match = re.search(r'(?:total\s*)?cholesterol\s*[:=]?\s*(\d{2,3}(?:\.\d+)?)\s*(mg/dL)?', raw_text, re.IGNORECASE)
    if chol_match:
        chol_val = float(chol_match.group(1))
        metrics.append({
            "key": "total_cholesterol",
            "label": "Total Cholesterol",
            "value": chol_val,
            "unit": "mg/dL",
            "reference_range": "< 200 mg/dL",
            "status": "normal" if chol_val < 200 else "attention",
        })

    # 6. HDL Cholesterol
    hdl_match = re.search(r'hdl\s*(?:cholesterol)?\s*[:=]?\s*(\d{2,3}(?:\.\d+)?)\s*(mg/dL)?', raw_text, re.IGNORECASE)
    if hdl_match:
        hdl_val = float(hdl_match.group(1))
        metrics.append({
            "key": "hdl_cholesterol",
            "label": "HDL Cholesterol",
            "value": hdl_val,
            "unit": "mg/dL",
            "reference_range": "> 40 mg/dL",
            "status": "normal" if hdl_val >= 40 else "attention",
        })

    # 7. LDL Cholesterol
    ldl_match = re.search(r'ldl\s*(?:cholesterol)?\s*[:=]?\s*(\d{2,3}(?:\.\d+)?)\s*(mg/dL)?', raw_text, re.IGNORECASE)
    if ldl_match:
        ldl_val = float(ldl_match.group(1))
        metrics.append({
            "key": "ldl_cholesterol",
            "label": "LDL Cholesterol",
            "value": ldl_val,
            "unit": "mg/dL",
            "reference_range": "< 100 mg/dL",
            "status": "normal" if ldl_val < 100 else "attention",
        })

    # 8. Triglycerides
    trig_match = re.search(r'triglycerides\s*[:=]?\s*(\d{2,3}(?:\.\d+)?)\s*(mg/dL)?', raw_text, re.IGNORECASE)
    if trig_match:
        trig_val = float(trig_match.group(1))
        metrics.append({
            "key": "triglycerides",
            "label": "Triglycerides",
            "value": trig_val,
            "unit": "mg/dL",
            "reference_range": "< 150 mg/dL",
            "status": "normal" if trig_val < 150 else "attention",
        })

    # 9. Hemoglobin
    hb_match = re.search(r'(?:hemoglobin|hgb|hb)\s*[:=]?\s*(\d{1,2}(?:\.\d+)?)\s*(g/dL)?', raw_text, re.IGNORECASE)
    if hb_match:
        hb_val = float(hb_match.group(1))
        metrics.append({
            "key": "hemoglobin",
            "label": "Hemoglobin",
            "value": hb_val,
            "unit": "g/dL",
            "reference_range": "12.0 - 17.5 g/dL",
            "status": "normal" if 12.0 <= hb_val <= 17.5 else "attention",
        })

    # 10. BMI (Body Mass Index)
    bmi_match = re.search(r'(?:bmi|body\s*mass\s*index)\s*[:=]?\s*(\d{1,2}(?:\.\d+)?)\s*(kg/m²)?', raw_text, re.IGNORECASE)
    if bmi_match:
        bmi_val = float(bmi_match.group(1))
        metrics.append({
            "key": "bmi",
            "label": "Body Mass Index (BMI)",
            "value": bmi_val,
            "unit": "kg/m²",
            "reference_range": "18.5 - 24.9 kg/m²",
            "status": "normal" if 18.5 <= bmi_val <= 24.9 else "attention",
        })

    # Extract date if present (e.g. Date: 2026-08-16 or 08/16/2026)
    date_match = re.search(r'(?:date|recorded|report\s*date)\s*[:=]?\s*(\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]\d{2,4})', raw_text, re.IGNORECASE)
    report_date = date_match.group(1) if date_match else None

    return {
        "metrics": metrics,
        "extracted_count": len(metrics),
        "report_date": report_date,
        "raw_text_summary": raw_text[:300] + ("..." if len(raw_text) > 300 else ""),
    }
