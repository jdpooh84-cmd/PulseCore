# AI Business Brain - Monthly Summary Output Format

Use this exact structure for your monthly summary output.

Endpoint:
- `GET /reports/monthly?month=YYYY-MM`

Example:

```json
{
  "report_month": "2026-04",
  "business_name": "Coastal Comfort HVAC",
  "business_city": "Chesapeake",
  "business_state": "Virginia",
  "offer_name": "AI Business Brain",
  "service_category": "HVAC",
  "totals": {
    "total_leads": 12,
    "new_leads": 5,
    "contacted_leads": 4,
    "won_leads": 2,
    "lost_leads": 1,
    "owner_alert_sent_count": 12,
    "customer_auto_reply_sent_count": 12
  },
  "urgency_breakdown": {
    "Emergency": 3,
    "Same-Day": 4,
    "This Week": 2,
    "Normal": 3
  },
  "service_needed_breakdown": {
    "AC Repair": 5,
    "Heating Repair": 2,
    "System Tune-Up": 3,
    "New Installation Quote": 1,
    "Indoor Air Quality": 1
  },
  "lead_source_breakdown": {
    "Coastal Comfort HVAC Website Lead Form": 12
  },
  "top_5_recent_leads": [
    {
      "created_at": "2026-04-30T19:42:10.311Z",
      "full_name": "Jordan Parker",
      "email": "jordan.parker@example.com",
      "phone": "(757) 555-0199",
      "service_needed": "AC Repair",
      "urgency": "Emergency",
      "status": "New"
    }
  ],
  "generated_at": "2026-04-30T23:59:59.999Z"
}
```
