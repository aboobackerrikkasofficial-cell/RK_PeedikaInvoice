import { formatCurrency, formatDate } from "../utils/calculations";

/**
 * InvoiceTemplate — THE single invoice component.
 * Used for both preview AND PNG export.
 * DO NOT hardcode any customer/product data here.
 *
 * All inline styles are intentional — they ensure
 * consistent rendering for both screen and PNG export
 * via html-to-image (no Tailwind class stripping).
 */
export default function InvoiceTemplate({
  shop,
  customer,
  product,
  paymentMode,
  quantity,
  pricing,
  invoiceNumber,
  orderDate,
  deliveryPeriod,
  estimatedDelivery,
}) {
  const isCOD = paymentMode === "COD";

  // Build address lines for BILL TO section
  const addressLines = [];
  if (customer.houseName) addressLines.push(customer.houseName);

  // Combine place + landmark
  const placeAndLandmark = [customer.place, customer.landmark]
    .filter(Boolean)
    .join(", ");
  if (placeAndLandmark) addressLines.push(placeAndLandmark);

  // Pincode line
  if (customer.pincode) {
    addressLines.push(`PIN ${customer.pincode}`);
  }

  // Phone line
  if (customer.mobile) {
    addressLines.push(`Phone: ${customer.mobile}`);
  }

  // Colors matching the sample
  const darkBlue = "#1b3a5c";
  const borderGray = "#d0d5dd";
  const lightBorder = "#e5e7eb";
  const textDark = "#1a1a1a";
  const textMid = "#444444";
  const textLight = "#666666";
  const textMuted = "#888888";
  const codOrange = "#e8941a";
  const prepaidGreen = "#27ae60";

  return (
    <div
      style={{
        width: "794px",
        minHeight: "1123px",
        fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
        backgroundColor: "#ffffff",
        color: textDark,
        padding: "40px 44px 30px 44px",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      {/* ═══════ HEADER ═══════ */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "6px",
        }}
      >
        {/* Left: Shop Name + Location */}
        <div>
          <div
            style={{
              fontSize: "28px",
              fontWeight: "800",
              color: darkBlue,
              lineHeight: 1.15,
              letterSpacing: "0.3px",
            }}
          >
            {shop.name}
          </div>
          <div
            style={{
              fontSize: "13px",
              color: textLight,
              marginTop: "2px",
            }}
          >
            {shop.location}
          </div>
        </div>

        {/* Right: INVOICE + meta */}
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: "30px",
              fontWeight: "800",
              color: darkBlue,
              lineHeight: 1.15,
            }}
          >
            INVOICE
          </div>
          <div
            style={{
              fontSize: "11px",
              color: textLight,
              marginTop: "4px",
            }}
          >
            Invoice No. {invoiceNumber}
          </div>
          <div
            style={{
              fontSize: "11px",
              color: textLight,
              marginTop: "1px",
            }}
          >
            {formatDate(orderDate)}
          </div>
        </div>
      </div>

      {/* ═══════ HORIZONTAL DIVIDER ═══════ */}
      <div
        style={{
          height: "3px",
          backgroundColor: darkBlue,
          marginBottom: "22px",
        }}
      />

      {/* ═══════ BILL TO + ORDER DETAILS ═══════ */}
      <div
        style={{
          display: "flex",
          gap: "18px",
          marginBottom: "22px",
        }}
      >
        {/* BILL TO / SHIP TO */}
        <div
          style={{
            flex: "1 1 50%",
            border: `1.5px solid ${borderGray}`,
            borderRadius: "4px",
            overflow: "hidden",
            minHeight: "120px",
          }}
        >
          <div
            style={{
              backgroundColor: darkBlue,
              color: "#ffffff",
              padding: "7px 14px",
              fontSize: "11px",
              fontWeight: "700",
              letterSpacing: "1px",
            }}
          >
            BILL TO / SHIP TO
          </div>
          <div
            style={{
              padding: "10px 14px",
              fontSize: "13px",
              lineHeight: 1.65,
              wordWrap: "break-word",
              overflowWrap: "break-word",
              minHeight: "80px",
            }}
          >
            {/* Customer name — bold */}
            {customer.name && (
              <div style={{ fontWeight: "700", color: textDark }}>
                {customer.name}
              </div>
            )}
            {/* Address lines — normal weight */}
            {addressLines.map((line, i) => (
              <div
                key={i}
                style={{
                  fontWeight: "400",
                  color: textMid,
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                }}
              >
                {line}
              </div>
            ))}
          </div>
        </div>

        {/* ORDER DETAILS */}
        <div
          style={{
            flex: "1 1 50%",
            border: `1.5px solid ${borderGray}`,
            borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              backgroundColor: darkBlue,
              color: "#ffffff",
              padding: "7px 14px",
              fontSize: "11px",
              fontWeight: "700",
              letterSpacing: "1px",
            }}
          >
            ORDER DETAILS
          </div>
          <div>
            {[
              { label: "ORDER DATE", value: formatDate(orderDate) },
              { label: "PAYMENT MODE", value: isCOD ? "COD" : "GPay" },
              { label: "DELIVERY", value: deliveryPeriod },
            ].map((row, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "9px 14px",
                  borderBottom: idx < 2 ? `1px solid ${lightBorder}` : "none",
                  fontSize: "12px",
                }}
              >
                <span style={{ color: textLight, fontWeight: "500" }}>
                  {row.label}
                </span>
                <span style={{ fontWeight: "700", color: textDark }}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════ PRODUCT TABLE ═══════ */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          tableLayout: "fixed",
          borderBottom: `1px solid ${lightBorder}`,
        }}
      >
        <colgroup>
          <col style={{ width: "6%" }} />
          <col style={{ width: "46%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "18%" }} />
          <col style={{ width: "18%" }} />
        </colgroup>
        <thead>
          <tr>
            {["#", "PRODUCT DETAILS", "QTY", "UNIT PRICE", "AMOUNT"].map(
              (h, i) => (
                <th
                  key={h}
                  style={{
                    backgroundColor: darkBlue,
                    color: "#ffffff",
                    padding: "9px 8px",
                    fontSize: "11px",
                    fontWeight: "700",
                    textAlign: i === 1 ? "left" : "center",
                    borderRight:
                      i < 4 ? "1px solid rgba(255,255,255,0.15)" : "none",
                    letterSpacing: "0.5px",
                  }}
                >
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {/* Product Row */}
          <tr>
            <td
              style={{
                padding: "14px 8px",
                textAlign: "center",
                verticalAlign: "top",
                fontSize: "13px",
                borderRight: `1px solid ${lightBorder}`,
                borderBottom: `1px solid ${lightBorder}`,
                color: textMid,
              }}
            >
              1
            </td>
            <td
              style={{
                padding: "14px 10px",
                verticalAlign: "top",
                borderRight: `1px solid ${lightBorder}`,
                borderBottom: `1px solid ${lightBorder}`,
                wordWrap: "break-word",
                overflowWrap: "break-word",
              }}
            >
              <div
                style={{
                  fontWeight: "700",
                  fontSize: "13px",
                  color: textDark,
                  marginBottom: "3px",
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                }}
              >
                {product.name}
              </div>
              <div
                style={{
                  fontSize: "11.5px",
                  color: textLight,
                  lineHeight: 1.55,
                }}
              >
                {product.size && <div>Size: {product.size}</div>}
                {product.material && <div>Material: {product.material}</div>}
                {product.description && <div>{product.description}</div>}
              </div>
            </td>
            <td
              style={{
                padding: "14px 8px",
                textAlign: "center",
                verticalAlign: "top",
                fontSize: "13px",
                borderRight: `1px solid ${lightBorder}`,
                borderBottom: `1px solid ${lightBorder}`,
                color: textDark,
              }}
            >
              {quantity}
            </td>
            <td
              style={{
                padding: "14px 8px",
                textAlign: "center",
                verticalAlign: "top",
                fontSize: "13px",
                fontWeight: "600",
                borderRight: `1px solid ${lightBorder}`,
                borderBottom: `1px solid ${lightBorder}`,
                color: textDark,
              }}
            >
              {formatCurrency(pricing.unitPrice)}
            </td>
            <td
              style={{
                padding: "14px 8px",
                textAlign: "center",
                verticalAlign: "top",
                fontSize: "13px",
                fontWeight: "600",
                borderBottom: `1px solid ${lightBorder}`,
                color: textDark,
              }}
            >
              {formatCurrency(pricing.subtotal)}
            </td>
          </tr>

          {/* Discount Row (only if discount > 0) */}
          {pricing.discount > 0 && (
            <tr>
              <td style={{ borderRight: `1px solid ${lightBorder}` }} />
              <td style={{ borderRight: `1px solid ${lightBorder}` }} />
              <td style={{ borderRight: `1px solid ${lightBorder}` }} />
              <td
                style={{
                  padding: "8px 8px",
                  textAlign: "center",
                  fontSize: "11px",
                  fontWeight: "700",
                  color: darkBlue,
                  borderRight: `1px solid ${lightBorder}`,
                  letterSpacing: "0.3px",
                }}
              >
                DISCOUNT
              </td>
              <td
                style={{
                  padding: "8px 8px",
                  textAlign: "center",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#c0392b",
                }}
              >
                −{formatCurrency(pricing.discount)}
              </td>
            </tr>
          )}

          {/* Subtotal Row */}
          <tr>
            <td style={{ borderRight: `1px solid ${lightBorder}` }} />
            <td style={{ borderRight: `1px solid ${lightBorder}` }} />
            <td style={{ borderRight: `1px solid ${lightBorder}` }} />
            <td
              style={{
                padding: "10px 8px",
                textAlign: "center",
                fontSize: "11px",
                fontWeight: "700",
                color: darkBlue,
                borderRight: `1px solid ${lightBorder}`,
                letterSpacing: "0.3px",
              }}
            >
              SUBTOTAL
            </td>
            <td
              style={{
                padding: "10px 8px",
                textAlign: "center",
                fontSize: "13px",
                fontWeight: "700",
                color: textDark,
              }}
            >
              {formatCurrency(pricing.grandTotal)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* ═══════ GRAND TOTAL BAR ═══════ */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: darkBlue,
          color: "#ffffff",
          padding: "13px 18px",
          marginTop: "20px",
          borderRadius: "4px",
        }}
      >
        <span
          style={{
            fontSize: "15px",
            fontWeight: "700",
            letterSpacing: "1.2px",
          }}
        >
          GRAND TOTAL
        </span>
        <span
          style={{
            fontSize: "20px",
            fontWeight: "800",
          }}
        >
          {formatCurrency(pricing.grandTotal)}
        </span>
      </div>

      {/* ═══════ PAYMENT MODE SECTION ═══════ */}
      <div
        style={{
          display: "flex",
          border: `1.5px solid ${borderGray}`,
          borderRadius: "4px",
          marginTop: "18px",
          overflow: "hidden",
          minHeight: "82px",
        }}
      >
        {/* Left half: payment info */}
        <div
          style={{
            flex: "1 1 50%",
            padding: "14px 18px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              fontWeight: "700",
              color: darkBlue,
              letterSpacing: "1px",
              marginBottom: "5px",
            }}
          >
            PAYMENT MODE
          </div>
          <div
            style={{
              fontSize: "18px",
              fontWeight: "800",
              color: textDark,
              marginBottom: "2px",
            }}
          >
            {isCOD ? "COD" : "GPay"}
          </div>
          <div style={{ fontSize: "12px", color: textMuted }}>
            {isCOD ? "Cash on Delivery" : "Paid via GPay"}
          </div>
        </div>

        {/* Right half: colored badge */}
        <div
          style={{
            flex: "1 1 50%",
            backgroundColor: isCOD ? codOrange : prepaidGreen,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "14px 18px",
            textAlign: "center",
          }}
        >
          {isCOD ? (
            <>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "#ffffff",
                  letterSpacing: "0.6px",
                  marginBottom: "5px",
                }}
              >
                CASH ON DELIVERY
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#ffffff",
                  opacity: 0.95,
                }}
              >
                Pay {formatCurrency(pricing.grandTotal)} to the delivery person
              </div>
            </>
          ) : (
            <>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "#ffffff",
                  letterSpacing: "0.6px",
                  marginBottom: "3px",
                }}
              >
                PAID
              </div>
              <div
                style={{
                  fontSize: "17px",
                  fontWeight: "800",
                  color: "#ffffff",
                }}
              >
                {formatCurrency(pricing.grandTotal)}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ═══════ DELIVERY SECTION ═══════ */}
      <div
        style={{
          display: "flex",
          border: `1.5px solid ${borderGray}`,
          borderRadius: "4px",
          marginTop: "18px",
          overflow: "hidden",
        }}
      >
        {/* Delivery Period */}
        <div
          style={{
            flex: "1 1 50%",
            padding: "14px 18px",
            borderRight: `1px solid ${lightBorder}`,
          }}
        >
          <div
            style={{
              fontSize: "10px",
              fontWeight: "700",
              color: darkBlue,
              letterSpacing: "1px",
              marginBottom: "5px",
            }}
          >
            DELIVERY PERIOD
          </div>
          <div
            style={{
              fontSize: "18px",
              fontWeight: "800",
              color: textDark,
              marginBottom: "2px",
            }}
          >
            {deliveryPeriod}
          </div>
          <div style={{ fontSize: "12px", color: textMuted }}>After Order</div>
        </div>

        {/* Estimated Delivery */}
        <div
          style={{
            flex: "1 1 50%",
            padding: "14px 18px",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              fontWeight: "700",
              color: darkBlue,
              letterSpacing: "1px",
              marginBottom: "5px",
            }}
          >
            ESTIMATED DELIVERY
          </div>
          <div
            style={{
              fontSize: "18px",
              fontWeight: "800",
              color: textDark,
            }}
          >
            {formatDate(estimatedDelivery)}
          </div>
        </div>
      </div>

      {/* ═══════ FOOTER ═══════ */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          border: `1.5px solid ${borderGray}`,
          borderRadius: "4px",
          marginTop: "18px",
          padding: "16px 18px",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "13px",
              fontWeight: "700",
              color: darkBlue,
              marginBottom: "3px",
            }}
          >
            {shop.name}
          </div>
          <div
            style={{
              fontSize: "11.5px",
              color: "#555",
              lineHeight: 1.65,
            }}
          >
            <div>
              {shop.location} | {shop.ownerName}
            </div>
            <div>
              {shop.phone} | {shop.email}
            </div>
          </div>
        </div>
        <div
          style={{
            fontSize: "14px",
            fontWeight: "700",
            color: darkBlue,
            textAlign: "right",
            fontStyle: "italic",
          }}
        >
          Thank you for your order!
        </div>
      </div>
    </div>
  );
}
