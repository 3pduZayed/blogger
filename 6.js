// قائمة بالمواقع المحظورة (يجب تحديثها يدويًا)
const blockedSites = ['facebook.com', 'youtube.com', 'google.com'];

// دالة لاستخراج النطاق من عنوان URL
function getDomain(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname;
    } catch (e) {
        console.error("Invalid URL", url);
        return '';
    }
}

// تعديل دالة تحديث مصدر الإطار
function updateIframeSource(pageUrl) {
    var iframe = document.querySelector('iframe');

    // فحص إذا كان الرابط يشير إلى موقع محظور (من القائمة اليدوية)
    const currentDomain = getDomain(pageUrl);
    const isBlocked = blockedSites.some(site => currentDomain.includes(site));

    if (isBlocked) {
        // الموقع محظور، اعرض صفحة المؤقت
        console.log('Site blocked (manual list):', pageUrl);
        showTimerPage(iframe, pageUrl);
    } else {
        // الموقع ليس محظورًا، حاول تحميله
        console.log('Attempting to load site:', pageUrl);
        try {
            iframe.src = pageUrl;
        } catch (e) {
            console.error("Error setting iframe source:", e);
        }
    }
}

// دالة لعرض صفحة المؤقت
function showTimerPage(iframe, pageUrl) {
    iframe.classList.add('hidden-iframe');

    const redirectMessage = document.getElementById('redirect-message');
    const adsAboveCountdown = document.getElementById('ads-above-countdown');
    const adsBelowCountdown = document.getElementById('ads-below-countdown');

    if (redirectMessage && adsAboveCountdown && adsBelowCountdown) {
        redirectMessage.style.display = 'block'; // إظهار الرسالة الإشعارية
        adsAboveCountdown.style.display = 'block'; // إظهار الإعلان العلوي
        adsBelowCountdown.style.display = 'block'; // إظهار الإعلان السفلي

        redirectMessage.innerHTML = `
            <p style="font-size: 16px; color: #333;">جاري نقلك إلى الموقع...</p>
            <p id="countdown" style="font-size: 24px; color: #ff4500;">30</p>
        `;

        let countdown = 30;
        const countdownElement = document.getElementById('countdown');
        if (countdownElement) {
            const countdownInterval = setInterval(() => {
                countdown--;
                countdownElement.textContent = countdown;

                if (countdown <= 0) {
                    clearInterval(countdownInterval);
                    window.location.href = pageUrl;
                }
            }, 1000);
        }
    }
}

function showCtaBox() {
    const ctaBox = document.getElementById('cta-box');
    if (ctaBox) {
        ctaBox.style.opacity = '1';
        ctaBox.style.transform = 'translateY(0)';
        ctaBox.classList.add('slide-in');
    }
}

// عرض الإعلان المنبثق بعد 15 ثانية
setTimeout(() => {
    const adPopup = document.getElementById('ad-popup');
    if (adPopup) {
        adPopup.style.display = 'flex';
    }
}, 15000);

// إضافة وظائف للأزرار (فتح وإغلاق)
document.addEventListener('DOMContentLoaded', () => {
    const adPopup = document.getElementById('ad-popup');
    if (adPopup) {
        const openButton = adPopup.querySelector('.popup-open');
        const closeButton = adPopup.querySelector('.popup-close');

        if (openButton) {
            openButton.addEventListener('click', () => {
                window.open(popupCtaUrl, '_blank');
            });
        }
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                adPopup.style.display = 'none';
            });
        }
    }
});

// قراءة بيانات التخصيص من محتوى التدوينة
function getPostCustomization() {
    const postBody = document.querySelector('.post-body');
    if (!postBody) return {};

    const customizationElement = postBody.querySelector('pre.custom-data');
    if (!customizationElement) return {};

    const customization = {};
    try {
        customizationElement.textContent.split(',').forEach(item => {
            const [key, value] = item.split('*').map(s => s.trim());
            if (key && value) {
                customization[key] = decodeURIComponent(value);
            }
        });
    } catch (error) {
        console.error('Error parsing customization data:', error);
        return {};
    }

    // التحقق من البيانات الأساسية
    if (!customization['page'] || !customization['brandText']) {
        console.error('Missing required customization data!');
    }

    return customization;
}

// تعديل دالة DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
    try {
        const customization = getPostCustomization();
        const pageUrl = customization['page'] || 'https://www.example.com';

        // تحديث مصدر الإطار
        updateIframeSource(pageUrl);

        // تحديد المتغيرات
        const brandText = customization['brandText'] || 'Your Brand Name';
        const messageText = customization['messageText'] || 'Your product and services';
        const ctaText = customization['ctaText'] || 'Click Here';
        const ctaTarget = customization['target'] || '#';
        const logoUrl = customization['logoUrl'] || '#';
        const buttonBgColor = customization['buttonBgColor'] || '#5db5fa';
        const textColor = customization['textColor'] || '#333';
        const buttonBoxBgColor = customization['buttonBoxBgColor'] || '#f0f0f0';
         const position = customization['position'] || 'left';
            const direction = customization['direction'] || 'ltr';
        const showAfter = Math.max(1000, parseInt(customization['showAfter'] || 5000, 10));
        const popupContent = customization['popupContent'] || '<p>This is an example popup ad.</p>';
        const popupCtaText = customization['popupCtaText'] || 'Open';
        const popupCtaUrl = customization['popupCtaUrl'] || '#';

        // تحديث العناصر
        const logoUrlElement = document.getElementById('logo-url');
          if (logoUrlElement) {
             logoUrlElement.innerHTML = `<img src="${logoUrl}" alt="Logo" style="width: 50px; height: 50px; object-fit: contain; margin-right: 10px; display: block;" />`;
        }

        const ctaElement = document.getElementById('cta-text');
        if (ctaElement) {
            ctaElement.href = ctaTarget;
                 ctaElement.target = "_blank";
            ctaElement.textContent = ctaText;
            ctaElement.style.backgroundColor = buttonBgColor;
        }

        const brandTextElement = document.getElementById('brand-text');
       if (brandTextElement)     brandTextElement.textContent = brandText;
          const messageTextElement = document.getElementById('message-text');
      if (messageTextElement)        messageTextElement.textContent = messageText;

        const popupOpenUrlElement = document.getElementById('popup-open-url');
        if (popupOpenUrlElement && popupCtaUrl) {
            popupOpenUrlElement.href = popupCtaUrl;
            popupOpenUrlElement.target = "_blank";
        }
             // set box style

             const ctaBoxElement = document.getElementById('cta-box');
           if (ctaBoxElement){
                ctaBoxElement.classList.remove('ltr', 'rtl');
                                 ctaBoxElement.classList.add( direction );
                    ctaBoxElement.style.left = position === 'right' ? 'auto' : '20px';
             ctaBoxElement.style.right = position === 'right' ? '20px' : 'auto';
           ctaBoxElement.style.backgroundColor = buttonBoxBgColor
          brandTextElement.style.color = textColor;
                messageTextElement.style.color = textColor;
         }
        // مؤقت لظهور الزر العائم
        setTimeout(showCtaBox, showAfter);

        // إدارة الإغلاق
        document.querySelectorAll('.close').forEach(button => {
            button.addEventListener('click', () => {
                const ctaBoxElement = document.getElementById('cta-box');
                if (ctaBoxElement) ctaBoxElement.style.display = 'none';
            });
        });
    } catch (error) {
        console.error('An error occurred:', error);
    }
});
