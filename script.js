const arabicQuotes = [
  { arabic: "اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ", thai: "อัลลอฮ์คือแสงสว่างแห่งชั้นฟ้าทั้งหลายและแผ่นดิน" },
  { arabic: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ", thai: "แท้จริงอัลลอฮ์ทรงอยู่กับผู้มีความอดทน" },
  // ... เพิ่มข้อความอื่นๆ
];

function changeLanguage(lang) {
  // ... โค้ดสำหรับเปลี่ยนภาษา ...
}

function calculateZakat() {
  const goldPrice = parseFloat(document.getElementById("gold-price").value);
  const cashTHB = parseFloat(document.getElementById("cash-thb").value);
  const gold = parseFloat(document.getElementById("gold").value);
  const goldUnit = document.getElementById("gold-unit").value;
  const cashForeign1 = parseFloat(document.getElementById("cash-foreign-1").value);
  const exchangeRate1 = parseFloat(document.getElementById("exchange-rate-1").value);

  // ... โค้ดสำหรับคำนวณซะกาต ...

  let resultHTML = "";

  if (totalAssets >= nisab) {
      resultHTML += `<p class="zakat-amount">จำนวนซะกาตที่ต้องจ่าย: ${zakat.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}</p>`;
  } else {
      resultHTML += `<p class="not-eligible">ยังไม่ถึงเกณฑ์เสียซะกาต เราขอดุอาร์ขอให้ท่านร่ำรวย เพื่อจะได้ช่วยเหลือคนอื่นต่อไป</p>`; 
  }

  resultHTML += `<p class="total-assets">จำนวนทรัพย์สินทั้งหมด: ${totalAssets.toFixed(2)} บาท</p>`;

  document.getElementById("result").innerHTML = resultHTML;
}

// ... โค้ดอื่นๆ ...
