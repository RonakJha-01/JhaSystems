import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useDashboard } from "../context/DashboardContext";

/* ---------- CITY LIST ---------- */
const cities = [
  "Ahmedabad", "Amritsar", "Bengaluru", "Bhopal", "Bhiwandi",
  "Chennai", "Delhi", "Hyderabad", "Indore", "Jaipur",
  "Kolkata", "Mumbai", "Nagpur", "Pune", "Rajkot",
  "Surat", "Vadodara"
];

const GRCreate = () => {
  /* ================= ROUTE ================= */
  const { loadLRs } = useDashboard();
  const [grInfo, setGrInfo] = useState({
    fromCity: "",
    toCity: "",
    grNo: "",
    grId: "",
    date: "",
    manualGrNo: "",
    billNumber: "",
    ewayBill: "",
    billPayment: "",
  });

  /* ================= PARTIES ================= */
  const [partyInfo, setPartyInfo] = useState({
    consignor: "",
    consignee: "",
  });

  /* ================= GOODS ================= */
  const [items, setItems] = useState([
    {
      itemName: "",
      packing: "",
      packages: "",
      actualWeight: "",
      chargeableWeight: "",
      rate: "",
      amount: 0,
    },
  ]);

  /* ================= TRANSPORT ================= */
  const [transport, setTransport] = useState({
    vehicleNo: "",
    deliveryType: "Godown",
  });

  /* ================= PAYMENT ================= */
  const [payment, setPayment] = useState({
    mode: "To Pay",
    paymentReceived: "",
  });

  /* ================= CHARGES ================= */
  const [charges, setCharges] = useState({
    labour: "",
    cartage: "",
    doorDelivery: "",
    insurance: "",
    other: "",
    freight: "",
    advance: "",
    lorryFreight: "",
    transporterCharge: "",
    gstPercent: "",
    gstAmount: 0,
    grandTotal: 0,
  });

  /* ================= REFS FOR KEYBOARD NAVIGATION ================= */
  const fieldRefs = useRef([]);

  /* ================= INIT DATE ================= */
  useEffect(() => {
    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
    setGrInfo(prev => ({
      ...prev,
      date: formattedDate,
    }));
  }, []);

  /* ================= KEYBOARD NAVIGATION ================= */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        const activeElement = document.activeElement;
        const currentIndex = fieldRefs.current.findIndex(ref => ref === activeElement);
        
        if (currentIndex !== -1) {
          e.preventDefault();
          const nextIndex = e.key === 'ArrowDown' ? currentIndex + 1 : currentIndex - 1;
          
          if (fieldRefs.current[nextIndex]) {
            fieldRefs.current[nextIndex].focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  /* ================= GOODS CALC ================= */
  const updateItem = (i, field, value) => {
    const copy = [...items];
    copy[i][field] = value;

    const wt = Number(copy[i].chargeableWeight || 0);
    const rate = Number(copy[i].rate || 0);
    copy[i].amount = wt * rate;

    setItems(copy);
  };

  const addRow = () => {
    setItems([
      ...items,
      {
        itemName: "",
        packing: "",
        packages: "",
        actualWeight: "",
        chargeableWeight: "",
        rate: "",
        amount: 0,
      },
    ]);
  };

  const removeRow = (i) => {
    if (items.length === 1) return;
    setItems(items.filter((_, idx) => idx !== i));
  };

  /* ================= TOTAL + GST ================= */
  useEffect(() => {
    const goodsTotal = items.reduce((s, i) => s + Number(i.amount || 0), 0);
    
    const labour = Number(charges.labour || 0);
    const cartage = Number(charges.cartage || 0);
    const doorDelivery = Number(charges.doorDelivery || 0);
    const insurance = Number(charges.insurance || 0);
    const other = Number(charges.other || 0);
    const freight = Number(charges.freight || 0);
    const advance = Number(charges.advance || 0);
    const lorryFreight = Number(charges.lorryFreight || 0);
    const transporterCharge = Number(charges.transporterCharge || 0);
    const gstPercent = Number(charges.gstPercent || 0);

    const subTotal =
      labour +
      cartage +
      doorDelivery +
      insurance +
      other +
      freight +
      lorryFreight +
      transporterCharge -
      advance;

    const gstAmount = (subTotal * gstPercent) / 100;
    const grandTotal = subTotal + gstAmount;

    setCharges((p) =>
      p.gstAmount === gstAmount && p.grandTotal === grandTotal
        ? p
        : { ...p, gstAmount, grandTotal }
    );
  }, [
    items,
    charges.labour,
    charges.cartage,
    charges.doorDelivery,
    charges.insurance,
    charges.other,
    charges.freight,
    charges.advance,
    charges.lorryFreight,
    charges.transporterCharge,
    charges.gstPercent,
  ]);

  /* ================= SAVE GR ================= */
const handleSaveGR = async () => {
  try {
    // Validate required fields
    if (!grInfo.fromCity.trim()) return alert("Please select From City");
    if (!grInfo.toCity.trim()) return alert("Please select To City");
    if (!partyInfo.consignor.trim()) return alert("Please enter Consignor");
    if (!partyInfo.consignee.trim()) return alert("Please enter Consignee");

    const invalidItems = items.some(item => !item.itemName.trim());
    if (invalidItems) return alert("Please fill item name in all rows.");

    const token = localStorage.getItem("token");
    if (!token) return alert("Please login again.");

    const payload = {
      fromCity: grInfo.fromCity,
      toCity: grInfo.toCity,
      consignor: partyInfo.consignor,
      consignee: partyInfo.consignee,

      items: items.map((i) => ({
        itemName: i.itemName.trim(),
        packing: i.packing || "",
        packages: Number(i.packages || 0),
        actualWeight: Number(i.actualWeight || 0),
        chargeableWeight: Number(i.chargeableWeight || 0),
        rate: Number(i.rate || 0),
        amount: Number(i.amount || 0),
      })),

      vehicleNo: transport.vehicleNo || "",
      deliveryType: transport.deliveryType,
      billNumber: grInfo.billNumber || "",
      ewayBill: grInfo.ewayBill || "",
      billPayment: grInfo.billPayment || "",
      paymentMode: payment.mode,
      paymentReceived: Number(payment.paymentReceived || 0),

      charges: {
        ...charges,
        gstAmount: Number(charges.gstAmount || 0),
        grandTotal: Number(charges.grandTotal || 0),
      },

      grDate: formatDateToISO(grInfo.date),
      manualGrNo: grInfo.manualGrNo ? Number(grInfo.manualGrNo) : undefined,
    };

    const res = await axios.post(
      "https://jhasystems-backend.onrender.com/api/gr",
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setGrInfo((p) => ({
      ...p,
      grNo: res.data.gr.grNo,
      grId: res.data.gr._id,
    }));

    // ⭐ IMPORTANT — Update dashboard automatically
    loadLRs();

    alert(`GR saved successfully (GR No: ${res.data.gr.grNo})`);

  } catch (err) {
    console.error("Save GR Error:", err);
    alert(err.response?.data?.message || "Failed to save GR");
  }
};


  /* ================= DOWNLOAD PDF ================= */
  const handleDownloadPDF = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `https://jhasystems-backend.onrender.com/api/gr/${grInfo.grId}/pdf`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!response.ok) return alert("PDF download failed");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `GR-${grInfo.grNo}.pdf`;
    document.body.appendChild(a);
    a.click();

    a.remove();
    window.URL.revokeObjectURL(url);

  } catch (err) {
    console.error(err);
    alert("PDF download failed");
  }
};


  /* ================= HELPER FUNCTIONS ================= */
  const formatDateToISO = (dateStr) => {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    return new Date().toISOString().split('T')[0];
  };

  const handleDateChange = (e) => {
    const value = e.target.value;
    const formatted = value.replace(/[^0-9/]/g, '');
    if (formatted.length <= 10) {
      setGrInfo({ ...grInfo, date: formatted });
    }
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Create Goods Receipt</h1>
          <p className="text-gray-600 mt-2">Create a new goods receipt document</p>
        </div>

        {/* Main Form */}
        <div className="space-y-6">
          {/* ROUTE & GR INFO */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <span className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  📍
                </span>
                Route & GR Information
              </h2>
              <span className="text-sm text-gray-500">* Required fields</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

      {/* From City */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          From City <span className="text-red-500">*</span>
        </label>
        <input
          list="fromCities"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
          value={grInfo.fromCity}
          onChange={(e) => setGrInfo({ ...grInfo, fromCity: e.target.value })}
          ref={el => fieldRefs.current[0] = el}
          required
          placeholder="From City"
        />
        <datalist id="fromCities">
          {cities.map((city) => (
            <option key={city} value={city} />
          ))}
        </datalist>
      </div>
      
      {/* To City */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          To City <span className="text-red-500">*</span>
        </label>
        <input
          list="toCities"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
          value={grInfo.toCity}
          onChange={(e) => setGrInfo({ ...grInfo, toCity: e.target.value })}
          ref={el => fieldRefs.current[1] = el}
          required
          placeholder="To City"
        />
        <datalist id="toCities">
          {cities.map((city) => (
            <option key={city} value={city} />
          ))}
        </datalist>
      </div>


              {/* Manual GR Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Manual GR Number
                </label>
                <input
                  type="number"
                  placeholder="Enter GR No"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  value={grInfo.manualGrNo}
                  onChange={(e) => setGrInfo({ ...grInfo, manualGrNo: e.target.value })}
                  ref={el => fieldRefs.current[2] = el}
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="dd/mm/yyyy"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  value={grInfo.date}
                  onChange={handleDateChange}
                  ref={el => fieldRefs.current[3] = el}
                  required
                />
              </div>
            </div>
          </div>

        {/* PARTIES */}
<div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
  <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
    <span className="p-2 bg-green-100 text-green-600 rounded-lg">👥</span>
    Parties Information
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Consignor */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Consignor <span className="text-red-500">*</span>
      </label>
      <textarea
        placeholder="Enter consignor name & address"
        rows={3}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 resize-none"
        value={partyInfo.consignor}
        onChange={(e) => setPartyInfo({ ...partyInfo, consignor: e.target.value })}
        ref={el => fieldRefs.current[4] = el}
        required
      />
    </div>

    {/* Consignee */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Consignee <span className="text-red-500">*</span>
      </label>
      <textarea
        placeholder="Enter consignee name & address"
        rows={3}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 resize-none"
        value={partyInfo.consignee}
        onChange={(e) => setPartyInfo({ ...partyInfo, consignee: e.target.value })}
        ref={el => fieldRefs.current[5] = el}
        required
      />
    </div>
  </div>
</div>


          {/* BILLING INFO */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <span className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                📄
              </span>
              Billing Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bill Number
                </label>
                <input
                  placeholder="Enter bill number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                  value={grInfo.billNumber}
                  onChange={(e) => setGrInfo({ ...grInfo, billNumber: e.target.value })}
                  ref={el => fieldRefs.current[6] = el}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-way Bill
                </label>
                <input
                  placeholder="Enter E-way bill number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                  value={grInfo.ewayBill}
                  onChange={(e) => setGrInfo({ ...grInfo, ewayBill: e.target.value })}
                  ref={el => fieldRefs.current[7] = el}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bill Payment
                </label>
                <input
                  placeholder="Enter bill payment"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                  value={grInfo.billPayment}
                  onChange={(e) => setGrInfo({ ...grInfo, billPayment: e.target.value })}
                  ref={el => fieldRefs.current[8] = el}
                />
              </div>
            </div>
          </div>

          {/* GOODS */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <span className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
                  📦
                </span>
                Goods Details
              </h2>
              <button
                onClick={addRow}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
              >
                <span>+</span> Add Item
              </button>
            </div>
            
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Item</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Packing</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Pkgs</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Act Wt</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Chg Wt</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Rate</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-4 py-3">
                        <input
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                          value={r.itemName}
                          onChange={e => updateItem(i, "itemName", e.target.value)}
                          ref={el => fieldRefs.current[9 + (i * 7)] = el}
                          placeholder="Item name"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                          value={r.packing}
                          onChange={e => updateItem(i, "packing", e.target.value)}
                          ref={el => fieldRefs.current[10 + (i * 7)] = el}
                          placeholder="Packing type"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                          value={r.packages}
                          onChange={e => updateItem(i, "packages", e.target.value)}
                          ref={el => fieldRefs.current[11 + (i * 7)] = el}
                          placeholder="Number"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                          value={r.actualWeight}
                          onChange={e => updateItem(i, "actualWeight", e.target.value)}
                          ref={el => fieldRefs.current[12 + (i * 7)] = el}
                          placeholder="Weight"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                          value={r.chargeableWeight}
                          onChange={e => updateItem(i, "chargeableWeight", e.target.value)}
                          ref={el => fieldRefs.current[13 + (i * 7)] = el}
                          placeholder="Weight"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                          value={r.rate}
                          onChange={e => updateItem(i, "rate", e.target.value)}
                          ref={el => fieldRefs.current[14 + (i * 7)] = el}
                          placeholder="Rate"
                        />
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        ₹{r.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => removeRow(i)}
                          className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors duration-150"
                          disabled={items.length === 1}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* TRANSPORT */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <span className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                🚚
              </span>
              Transport & Delivery
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Number
                </label>
                <input
                  placeholder="Enter vehicle number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  value={transport.vehicleNo}
                  onChange={e => setTransport({ ...transport, vehicleNo: e.target.value })}
                  ref={el => fieldRefs.current[100] = el}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Type
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  value={transport.deliveryType}
                  onChange={e => setTransport({ ...transport, deliveryType: e.target.value })}
                  ref={el => fieldRefs.current[101] = el}
                >
                  <option>Godown</option>
                  <option>Door</option>
                  <option>Transit</option>
                </select>
              </div>
            </div>
          </div>

          {/* PAYMENT */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <span className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                💳
              </span>
              Payment Details
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Payment Mode
                </label>
                <div className="flex flex-wrap gap-4">
                  {["To Pay", "Paid", "TBB", "FOC"].map(m => (
                    <label key={m} className="flex items-center gap-2 cursor-pointer">
                      <div className="relative">
                        <input
                          type="radio"
                          name="paymentMode"
                          checked={payment.mode === m}
                          onChange={() => setPayment({ ...payment, mode: m })}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${payment.mode === m ? 'border-emerald-500' : 'border-gray-300'}`}>
                          {payment.mode === m && <div className="w-3 h-3 rounded-full bg-emerald-500"></div>}
                        </div>
                      </div>
                      <span className="text-gray-700">{m}</span>
                    </label>
                  ))}
                </div>
              </div>

              {payment.mode === "Paid" && (
                <div className="max-w-xs">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Received
                  </label>
                  <input
                    placeholder="Enter amount received"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                    value={payment.paymentReceived}
                    onChange={e => setPayment({ ...payment, paymentReceived: e.target.value })}
                    ref={el => fieldRefs.current[103] = el}
                  />
                </div>
              )}
            </div>
          </div>

          {/* CHARGES & GST */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <span className="p-2 bg-red-100 text-red-600 rounded-lg">
                💰
              </span>
              Charges & GST Calculation
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { key: "labour", label: "Labour Charge" },
                { key: "cartage", label: "Cartage" },
                { key: "doorDelivery", label: "Door Delivery" },
                { key: "insurance", label: "Insurance" },
                { key: "other", label: "Other Charges" },
                { key: "freight", label: "Freight" },
                { key: "advance", label: "Advance" },
                { key: "lorryFreight", label: "Lorry Freight" },
                { key: "transporterCharge", label: "Transporter Charge" },
              ].map((field, i) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label}
                  </label>
                  <input
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                    value={charges[field.key]}
                    onChange={e => setCharges({ ...charges, [field.key]: e.target.value })}
                    ref={el => fieldRefs.current[104 + i] = el}
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GST Percentage
                </label>
                <input
                  placeholder="Enter GST %"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                  value={charges.gstPercent}
                  onChange={e => setCharges({ ...charges, gstPercent: e.target.value })}
                  ref={el => fieldRefs.current[113] = el}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GST Amount
                </label>
                <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 font-semibold text-gray-700">
                  ₹{charges.gstAmount.toFixed(2)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grand Total
                </label>
                <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-900 text-white font-bold text-lg">
                  ₹{charges.grandTotal.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex flex-col sm:flex-row justify-end gap-4">
              <button
                onClick={handleSaveGR}
                className="px-8 py-3 bg-linear-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save GR
              </button>

              {grInfo.grId && (
                <button
                  onClick={handleDownloadPDF}
                  className="px-8 py-3 bg-linear-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF
                </button>
              )}
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Required fields marked with *</span>
                  </div>
                </div>
                <div className="text-gray-400">
                  Use ↑ ↓ arrow keys to navigate between fields
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GRCreate;