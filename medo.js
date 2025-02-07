// قائمة بالمواقع المحظورة (يجب تحديثها يدويًا)
const blockedSites = ['facebook.com', 'youtube.com', 'google.com']; // مثال

let currentDomain = ''; // متغير لتخزين النطاق الحالي

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

    // التحقق من النطاق بدقة
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
    if (redirectMessage) {
        redirectMessage.style.display = 'block';
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

    // إظهار الإعلانات
    const adElements = [
        'ad-right',
        'ad-left',
        'ad-below-message',
        'ad-bottom'
    ];

    adElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.style.display = 'block';
    });
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
        const closeButton = adPopup.querySelector('.popup-close');
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

        // إخفاء الإعلان السفلي مؤقتًا
        const adBottom = document.getElementById('ad-bottom');
        if (adBottom) adBottom.style.display = 'none';

        // إعداد CTA
        const ctaElement = document.getElementById('cta-text');
        if (ctaElement) {
            ctaElement.href = customization['target'] || '#';
        }

        // إعداد الإعلان المنبثق
        const popupCtaUrl = customization['popupCtaUrl'];
        const popupOpenUrlElement = document.getElementById('popup-open-url');
        if (popupOpenUrlElement && popupCtaUrl) {
            popupOpenUrlElement.href = popupCtaUrl;
            popupOpenUrlElement.target = "_blank";
        }

        // مؤقت لظهور الزر العائم
        const showAfter = Math.max(1000, parseInt(customization['showAfter'] || 5000, 10));
        setTimeout(showCtaBox, showAfter);

        // إعداد التنسيقات
        const ctaBoxElement = document.getElementById('cta-box');
        if (ctaBoxElement) {
            // الألوان
            ctaBoxElement.style.backgroundColor = customization['buttonBoxBgColor'] || '#f0f0f0';
            document.querySelectorAll('#brand-text, #message-text').forEach(el => {
                el.style.color = customization['textColor'] || '#333';
            });
            if (ctaElement) ctaElement.style.backgroundColor = customization['buttonBgColor'] || '#5db5fa';

            // الموضع
            const position = customization['position'] || 'left';
            ctaBoxElement.style.left = position === 'right' ? 'auto' : '20px';
            ctaBoxElement.style.right = position === 'right' ? '20px' : 'auto';
        }

        // إدارة الإغلاق
        document.querySelectorAll('.close').forEach(button => {
            button.addEventListener('click', () => {
                if (ctaBoxElement) ctaBoxElement.style.display = 'none';
                if (adBottom) {
                    adBottom.style.display = 'block';
                    setTimeout(() => {
                        if (adBottom) adBottom.style.display = 'none';
                    }, 10000);
                }
            });
        });
    } catch (error) {
        console.error('An error occurred:', error);
    }
});
