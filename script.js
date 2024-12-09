const arabicQuotes = [
  { arabic: "اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ", thai: "อัลลอฮ์คือแสงสว่างแห่งชั้นฟ้าทั้งหลายและแผ่นดิน" },
  { arabic: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ", thai: "แท้จริงอัลลอฮ์ทรงอยู่กับผู้มีความอดทน" },
  // ... เพิ่มเติมข้อความอัลกุรอ่านหรือหะดีษที่ต้องการ
];

function displayRandomQuote() {
  const randomIndex = Math.floor(Math.random() * arabicQuotes.length);
  const quote = arabicQuotes[randomIndex];

  document.getElementById('arabic-text').innerText = quote.arabic;
  document.getElementById('thai-translation').innerText = quote.thai;
}

displayRandomQuote();

function calculateZakat() {
  // ดึงข้อมูลจาก input
  const goldPrice = parseFloat(document.getElementById('gold-price').value);
  const cashTHB = parseFloat(document.getElementById('cash-thb').value);
  const cashForeign1 = parseFloat(document.getElementById('cash-foreign-1').value);
  const exchangeRate1 = parseFloat(document.getElementById('exchange-rate-1').value);
  let gold = parseFloat(document.getElementById('gold').value);
  const goldUnit = document.getElementById('gold-unit').value;

  // แปลงหน่วยทองคำเป็นบาททองคำ
  if (goldUnit === 'gram') {
    gold = gold / 15.16;
  }

  // คำนวณเงินสดทั้งหมดเป็นเงินบาท
  const totalCash = cashTHB + (cashForeign1 * exchangeRate1);

  // คำนวณมูลค่าทรัพย์สินทั้งหมด (เงินสด + ทองคำ)
  const totalAssets = totalCash + (gold * goldPrice);

  // ตรวจสอบเงื่อนไข nisab (ทองคำ 85 กรัม หรือ 5.576 บาททองคำ)
  const nisab = 5.576 * goldPrice;

  // แสดงผลลัพธ์
  let resultHTML = "";

  if (totalAssets >= nisab) {
    // คำนวณซะกาต
    const zakat = totalAssets * 0.025;
    resultHTML += `<p class="zakat-amount">จำนวนซะกาตที่ต้องจ่าย: ${zakat.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}</p>`;
  } else {
    resultHTML += `<p class="not-eligible">"ท่านยังไม่ถึงเกณฑ์ที่จะต้องจ่ายซะกาต" เราขอดุอาร์ขอให้ท่านร่ำรวย เพื่อจะได้ช่วยเหลือคนอื่นต่อไป</p>`;
  }

  // แสดงจำนวนทรัพย์สินทั้งหมด (อยู่ใต้จำนวนซะกาตที่ต้องจ่าย)
  resultHTML += `<p class="total-assets">จำนวนทรัพย์สินทั้งหมด: ${totalAssets.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}</p>`;

  document.getElementById('result').innerHTML = resultHTML;
}

// ฟังก์ชันสำหรับอัพเดทค่าเงินเริ่มต้น
function updateExchangeRate(selectElement) {
  const selectedCurrency = selectElement.value;
  const exchangeRateInput = selectElement.nextElementSibling.nextElementSibling;
  if (selectedCurrency === 'MYR') {
    exchangeRateInput.value = 7.77;
  } else if (selectedCurrency === 'USD') {
    exchangeRateInput.value = 33.99;
  }
}

// Event Listener สำหรับ select สกุลเงิน
document.getElementById('currency-1').addEventListener('change', function () {
  updateExchangeRate(this);
});

// ฟังก์ชันดึงราคาทองคำจาก API
function fetchGoldPrice() {
  // ลองดึงข้อมูลจาก goldapi.io ก่อน
  fetch('https://www.goldapi.io/api/XAU/THB', {
    headers: {
      'x-access-token': 'GOLDAPI_KEY' // **ต้องใส่ API Key ของคุณเอง**
    }
  })
    .then(response => response.json())
    .then(data => {
      document.getElementById('gold-price').value = data.price_gram * 15.16;
    })
    .catch(error => {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลจาก goldapi.io:', error);

      // ถ้าดึงจาก goldapi.io ไม่ได้ ให้ลองดึงจาก API ของสมาคมค้าทองคำ
      fetch('https://www.goldtraders.or.th/api/goldprice/today')
        .then(response => response.json())
        .then(data => {
          //  ดึงข้อมูลราคาทองคำจาก response (ต้องดูรูปแบบข้อมูลจาก API จริง)
          const goldPrice = data.gold_price; //  ปรับแต่งตามรูปแบบข้อมูลจริง
          document.getElementById('gold-price').value = goldPrice;
        })
        .catch(error => {
          console.error('เกิดข้อผิดพลาดในการดึงข้อมูลจาก API สมาคมค้าทองคำ:', error);

          // ถ้าดึงจาก API สมาคมค้าทองคำไม่ได้ ให้ลองดึงจาก Data API (WebSocket)
          const socket = new WebSocket('wss://ws.finanzen.net/ws/stream');
          socket.onopen = function(event) {
            const msg = {
              "m": "sub",
              "i": "218477338", // ID ของทองคำใน Data API
              "n": "ticker"
            };
            socket.send(JSON.stringify(msg));
          };

          socket.onmessage = function(event) {
            const data = JSON.parse(event.data);
            const goldPrice = data.v.lp; //  ปรับแต่งตามรูปแบบข้อมูลจริง
            document.getElementById('gold-price').value = goldPrice;
            socket.close(); // ปิด WebSocket connection
          };

          socket.onerror = function(error) {
            console.error('เกิดข้อผิดพลาดในการเชื่อมต่อ WebSocket:', error);
            // ถ้าดึงจาก Data API ไม่ได้อีก ให้แสดงข้อความแจ้งเตือน
            alert("ดึงข้อมูลราคาทองไม่สำเร็จ");
            // กลับไปใช้ค่าเริ่มต้น (43000.00)
            document.getElementById('gold-price').value = 43000.00;
          };
        });
    });
}

// Event Listener สำหรับปุ่ม "อัพเดทราคาทองคำ"
document.getElementById('fetch-gold-price').addEventListener('click', fetchGoldPrice);

// ฟังก์ชันสำหรับ toggle การแสดงผล foreign currency inputs
function toggleForeignCurrency() {
  const foreignCurrencyInputs = document.getElementById('foreign-currency-inputs');
  if (foreignCurrencyInputs.style.display === 'none') {
    foreignCurrencyInputs.style.display = 'block';
  } else {
    foreignCurrencyInputs.style.display = 'none';
  }
}

// ฟังก์ชันสำหรับอัพเดทอัตราแลกเปลี่ยนจาก API
function fetchExchangeRate(currencyId, exchangeRateId) {
  const selectedCurrency = document.getElementById(currencyId).value;

  // ดึงข้อมูลจาก CoinGecko API
  fetch(`https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,tether,kub&vs_currencies=thb`)
    .then(response => response.json())
    .then(data => {
      let rate;
      if (selectedCurrency === 'BTC') {
        rate = data.bitcoin.thb;
      } else if (selectedCurrency === 'USDT') {
        rate = data.tether.thb;
      } else if (selectedCurrency === 'KUB') {
        rate = data.kub.thb;
      } else {
        //  สำหรับ  MYR  และ  USD  ใช้  API  เดิม
        return fetch(`https://api.exchangerate-api.com/v4/latest/THB`);
      }
      document.getElementById(exchangeRateId).value = rate;
    })
    .then(response => {
      if (response) {
        return response.json();
      }
    })
    .then(data => {
      if (data) {
        let rate = data.rates[selectedCurrency];
        rate = 1 / rate;
        document.getElementById(exchangeRateId).value = rate;
      }
    })
    .catch(error => {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', error);
      alert("ไม่สามารถดึงอัตราแลกเปลี่ยนได้");
    });
}

// เพิ่ม Event Listener ให้กับ input fields ทั้งหมด
const inputFields = document.querySelectorAll('#zakat-form input[type="number"], #zakat-form select');
inputFields.forEach(input => {
  input.addEventListener('input', () => validateInput(input));
  input.addEventListener('input', calculateZakat);
});

// ฟังก์ชันสำหรับตรวจสอบและแก้ไขค่า input
function validateInput(inputElement) {
  const value = parseFloat(inputElement.value);
  if (value < 0) {
    inputElement.value = 0; //  แก้ไขค่าเป็น  0  ถ้าติดลบ
  }
}

// ฟังก์ชันสำหรับเปลี่ยนภาษา
function changeLanguage(lang) {
  document.title = translations[lang].title;
  document.getElementById('page-title').innerText = translations[lang].title;
  document.getElementById('tagline-text').innerText = translations[lang].tagline;
  document.getElementById('calculator-heading').innerText = translations[lang].calculator;
  document.getElementById('gold-price-label').innerText = translations[lang].goldPrice;
  document.getElementById('cash-thb-label').innerText = translations[lang].cashTHB;
  document.getElementById('gold-label').innerText = translations[lang].gold;
  document.querySelector('.foreign-currency > h3').innerText = translations[lang].foreignCurrency;
  document.querySelectorAll('.foreign-currency label[for^="cash-foreign-"]').forEach(label => {
    label.innerText = translations[lang].cash;
  });
  document.querySelectorAll('.foreign-currency label[for^="exchange-rate-"]').forEach(label => {
    label.innerText = translations[lang].exchangeRate;
  });
  document.querySelector('.calculator button').innerText = translations[lang].calculate;
  document.getElementById('zakat-meaning').innerText = translations[lang].zakatMeaning;
  document.getElementById('zakat-desc').innerText = translations[lang].zakatDesc;
  document.getElementById('about-us').innerText = translations[lang].aboutUs;
  document.getElementById('faq').innerText = translations[lang].faq;
  document.getElementById('contact-us').innerText = translations[lang].contactUs;
  document.getElementById('zakat-org').innerText = translations[lang].zakatOrg;
  document.getElementById('register-receive').innerText = translations[lang].registerReceive;
  document.getElementById('register-request').innerText = translations[lang].registerRequest;
}

// เพิ่ม Event Listener ให้กับปุ่มเลือกภาษา
document.getElementById('lang-th').addEventListener('click', function () {
  changeLanguage('th');
});

document.getElementById('lang-ms-jawi').addEventListener('click', function () {
  changeLanguage('ms-jawi');
});

const translations = {
  th: {
    title: "คำนวณและจ่ายซะกาต",
    tagline: "คำนวณซะกาตของคุณอย่างง่ายดาย และถูกต้องตามหลักศาสนา",
    calculator: "คำนวณซะกาต",
    goldPrice: "ราคาทองคำ (บาท):",
    cashTHB: "เงินสด (บาท):",
    gold: "ทองคำ (บาท/กรัม):",
    foreignCurrency: "▼ คลิกเพื่อคำนวนทรัพย์สินอื่นๆ ▼",
    cash: "เงินสด:",
    exchangeRate: "อัตราแลกเปลี่ยน:",
    calculate: "คำนวณ",
    zakatMeaning: "ซะกาตคืออะไร?",
    zakatDesc: "ซะกาต คือ การบริจาคทรัพย์สินส่วนหนึ่งตามที่ศาสนาอิสลามกำหนดให้แก่ผู้มีสิทธิ์ได้รับ เพื่อเป็นการชำระล้างทรัพย์สินและจิตใจ",
    aboutUs: "เกี่ยวกับเรา",
    faq: "คำถามที่พบบ่อย",
    contactUs: "ติดต่อเรา",
    zakatOrg: "องค์กรที่รับจ่ายซะกาต",
    registerReceive: "ลงทะเบียนรับซะกาต",
    registerRequest: "รายชื่อท่านลงทะเบียนขอรับซะกาต"
  },
  "ms-jawi": {
    title: "Kira dan Bayar Zakat",
    tagline: "Kira zakat anda dengan mudah dan tepat mengikut hukum syarak",
    calculator: "Kira Zakat",
    goldPrice: "Harga Emas (Baht):",
    cashTHB: "Tunai (Baht):",
    gold: "Emas (Baht/gram):",
    foreignCurrency: "▼ Klik untuk mengira aset lain ▼",
    cash: "Tunai:",
    exchangeRate: "Kadar Pertukaran:",
    calculate: "Kira",
    zakatMeaning: "Apakah Zakat?",
    zakatDesc: "Zakat ialah pemberian sebahagian harta yang ditetapkan oleh agama Islam kepada mereka yang berhak menerimanya, sebagai pembersihan harta dan jiwa",
    aboutUs: "Tentang Kami",
    faq: "Soalan Lazim",
    contactUs: "Hubungi Kami",
    zakatOrg: "Organisasi Zakat",
    registerReceive: "Daftar Penerima Zakat",
    registerRequest: "Senarai Pemohon Zakat"
  }
};
