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

// دالة تحديث مصدر الإطار
function updateIframeSource(pageUrl) {
    var iframe = document.querySelector('iframe');

    const currentDomain = getDomain(pageUrl);
    const isBlocked = blockedSites.some(site => currentDomain.includes(site));

    // إخفاء جميع عناصر الواجهة المؤقتة مبدئيًا
    const redirectMessage = document.getElementById('redirect-message');
    const adsAboveCountdown = document.getElementById('ads-above-countdown');
    const adsBelowCountdown = document.getElementById('ads-below-countdown');
    const ctaBox = document.getElementById('cta-box');

    if (redirectMessage) redirectMessage.style.display = 'none';
    if (adsAboveCountdown) adsAboveCountdown.style.display = 'none';
    if (adsBelowCountdown) adsBelowCountdown.style.display = 'none';
    if (ctaBox) ctaBox.style.display = 'block'; // تأكد من ظهور الزر العائم

    if (isBlocked) {
        console.log('Site blocked (manual list):', pageUrl);
        iframe.classList.add('hidden-iframe');
        showTimerPage(iframe, pageUrl);
    } else {
        console.log('Attempting to load site:', pageUrl);
        try {
            // إظهار الـ iframe بحجم كامل
            iframe.classList.remove('hidden-iframe');
            iframe.style.width = '100%';  // تأكد من أن الـ iframe يملأ الشاشة
            iframe.style.height = '100%'; // تأكد من أن الـ iframe يملأ الشاشة
            iframe.src = pageUrl;

        } catch (e) {
            console.error("Error setting iframe source:", e);
        }
    }
}

// دالة لعرض صفحة المؤقت
function showTimerPage(iframe, pageUrl) {
    // إظهار العناصر المؤقتة
    const redirectMessage = document.getElementById('redirect-message');
    const adsAboveCountdown = document.getElementById('ads-above-countdown');
    const adsBelowCountdown = document.getElementById('ads-below-countdown');
    const ctaBox = document.getElementById('cta-box');

    if (redirectMessage) redirectMessage.style.display = 'block';
    if (adsAboveCountdown) adsAboveCountdown.style.display = 'block';
    if (adsBelowCountdown) adsBelowCountdown.style.display = 'block';
     if (ctaBox) ctaBox.style.display = 'none'; // إخفاء الزر العائم
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

    if (!customization['page'] || !customization['brandText']) {
        console.error('Missing required customization data!');
    }

    return customization;
}

// تهيئة الصفحة عند التحميل
document.addEventListener("DOMContentLoaded", () => {
    try {
        // إخفاء العناصر المؤقتة مبدئيًا
        const redirectMessage = document.getElementById('redirect-message');
        const adsAboveCountdown = document.getElementById('ads-above-countdown');
        const adsBelowCountdown = document.getElementById('ads-below-countdown');
        const ctaBox = document.getElementById('cta-box');

         if (redirectMessage) redirectMessage.style.display = 'none';
          if (adsAboveCountdown) adsAboveCountdown.style.display = 'none';
           if (adsBelowCountdown) adsBelowCountdown.style.display = 'none';
           if (ctaBox) ctaBox.style.display = 'block';

        const customization = getPostCustomization();
        const pageUrl = customization['page'] || 'https://www.example.com';

        updateIframeSource(pageUrl);

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
        if (brandTextElement) brandTextElement.textContent = brandText;

        const messageTextElement = document.getElementById('message-text');
        if (messageTextElement) messageTextElement.textContent = messageText;

        const popupOpenUrlElement = document.getElementById('popup-open-url');
        if (popupOpenUrlElement && popupCtaUrl) {
            popupOpenUrlElement.href = popupCtaUrl;
            popupOpenUrlElement.target = "_blank";
        }

        const ctaBoxElement = document.getElementById('cta-box');
        if (ctaBoxElement){
            ctaBoxElement.classList.remove('ltr', 'rtl');
            ctaBoxElement.classList.add(direction);
            ctaBoxElement.style.left = position === 'right' ? 'auto' : '20px';
            ctaBoxElement.style.right = position === 'right' ? '20px' : 'auto';
            ctaBoxElement.style.backgroundColor = buttonBoxBgColor;
            brandTextElement.style.color = textColor;
            messageTextElement.style.color = textColor;
        }

        setTimeout(showCtaBox, showAfter);

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
