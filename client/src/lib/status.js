export function statusVariant(status) {
  switch (status) {
    case "Active":
    case "Paid":
    case "In Stock":
    case "Valid":
    case "Revalidated":
    case "Approved":
    case "Implemented":
    case "Low":
    case "Closed":
      return "success";
    case "Pending":
    case "Low Stock":
    case "Negotiation":
    case "Medium":
    case "Escalated":
    case "Simulated":
    case "Monitoring":
    case "Mitigating":
    case "Proposed":
      return "warning";
    case "Inactive":
    case "Out of Stock":
    case "Invalidated":
    case "Blocked":
    case "Critical":
    case "Open":
      return "danger";
    case "High":
      return "violet";
    default:
      return "default";
  }
}
