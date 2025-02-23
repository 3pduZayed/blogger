// قائمة بالمواقع المحظورة
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

// دالة لتحديث مصدر الإطار
function updateIframeSource(pageUrl) {
    var iframe = document.querySelector('iframe');
    // التحقق مما إذا كان الرابط يشير إلى موقع محظور
    const currentDomain = getDomain(pageUrl);
    const isBlocked = blockedSites.some(site => currentDomain.includes(site));
    if (isBlocked) {
        // الموقع محظور: إظهار المؤقت والإعلانات
        showTimerPage(iframe, pageUrl);
    } else {
        // الموقع غير محظور: إخفاء المؤقت والإعلانات وإظهار الإطار فقط
        hideTimerAndAds();
        iframe.src = pageUrl; // تحديث مصدر الإطار
        iframe.style.display = 'block'; // إظهار الإطار
        iframe.style.width = '100%'; // ملء الشاشة أفقيًا
        iframe.style.height = '100vh'; // ملء الشاشة راسيًا
    }
}

// دالة لإظهار صفحة المؤقت
function showTimerPage(iframe, pageUrl) {
    iframe.classList.add('hidden-iframe'); // إخفاء الإطار
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
                    window.location.href = pageUrl; // إعادة التوجيه بعد انتهاء الوقت
                }
            }, 1000);
        }
    }
}

// دالة لإخفاء المؤقت والإعلانات
function hideTimerAndAds() {
    const redirectMessage = document.getElementById('redirect-message');
    const adsAboveCountdown = document.getElementById('ads-above-countdown');
    const adsBelowCountdown = document.getElementById('ads-below-countdown');
    if (redirectMessage) {
        redirectMessage.style.display = 'none'; // إخفاء المؤقت
    }
    if (adsAboveCountdown) {
        adsAboveCountdown.style.display = 'none'; // إخفاء الإعلان العلوي
    }
    if (adsBelowCountdown) {
        adsBelowCountdown.style.display = 'none'; // إخفاء الإعلان السفلي
    }
}

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

// إدارة عرض الزر العائم
function showCtaBox() {
    const ctaBox = document.getElementById('cta-box');
    if (ctaBox) {
        ctaBox.style.opacity = '1';
        ctaBox.style.transform = 'translateY(0)';
        ctaBox.classList.add('slide-in');
    }
}

// إدارة حركة الإعلان المنبثق
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const adPopup = document.getElementById('ad-popup');
        if (adPopup) {
            // تحديث محتوى الإعلان المنبثق باستخدام المتغيرات المخصصة
            const customization = getPostCustomization();
            const popupContent = customization['popupContent'] || '<p>هذا مثال لإعلان منبثق.</p>';
            const popupCtaText = customization['popupCtaText'] || 'فتح';
            const popupCtaUrl = customization['popupCtaUrl'] || '#';

            const popupContentElement = adPopup.querySelector('.popup-content');
            const popupOpenButton = adPopup.querySelector('.popup-open');

            if (popupContentElement) {
                popupContentElement.innerHTML = popupContent;
            }

            if (popupOpenButton) {
                popupOpenButton.textContent = popupCtaText;
                popupOpenButton.href = popupCtaUrl;
                popupOpenButton.target = "_blank";
            }

            // إظهار الإعلان المنبثق بعد 15 ثانية
            adPopup.style.display = 'flex';
        }
    }, 15000);

    // إضافة وظائف للأزرار (فتح وإغلاق)
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

// دالة رئيسية للقالب
document.addEventListener("DOMContentLoaded", () => {
    try {
        const customization = getPostCustomization();
        const pageUrl = customization['page'] || 'https://www.example.com';

        // تحديث مصدر الإطار بناءً على الرابط
        updateIframeSource(pageUrl);

        // تحديث الزر والنص
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

        // تحديث العناصر
        const logoUrlElement = document.getElementById('logo-url');
        if (logoUrlElement) {
            logoUrlElement.innerHTML = `<img src="${logoUrl}" alt="Logo" />`;
        }

        const ctaElement = document.getElementById('cta-text');
        if (ctaElement) {
            ctaElement.href = ctaTarget;
            ctaElement.target = "_blank";
            ctaElement.textContent = ctaText;
            ctaElement.style.backgroundColor = buttonBgColor;
        }

        const brandTextElement = document.getElementById('brand-text');
        if (brandTextElement) {
            brandTextElement.textContent = brandText;
            brandTextElement.style.color = textColor;
        }

        const messageTextElement = document.getElementById('message-text');
        if (messageTextElement) {
            messageTextElement.textContent = messageText;
            messageTextElement.style.color = textColor;
        }

        const ctaBoxElement = document.getElementById('cta-box');
        if (ctaBoxElement) {
            ctaBoxElement.classList.remove('ltr', 'rtl');
            ctaBoxElement.classList.add(direction);
            ctaBoxElement.style.left = position === 'right' ? 'auto' : '20px';
            ctaBoxElement.style.right = position === 'right' ? '20px' : 'auto';
            ctaBoxElement.style.backgroundColor = buttonBoxBgColor;
        }

        // مؤقت لظهور الزر العائم
        setTimeout(showCtaBox, showAfter);

        // إدارة زر الإغلاق
        document.querySelectorAll('.close').forEach(button => {
            button.addEventListener('click', () => {
                const ctaBoxElement = document.getElementById('cta-box');
                if (ctaBoxElement) {
                    ctaBoxElement.style.display = 'none';
                }

                // إظهار الإعلان أسفل الصفحة
                const adBottom = document.getElementById('ad-bottom');
                if (adBottom) {
                    adBottom.style.display = 'block';

                    // إعادة إخفاء الإعلان بعد 10 ثوانٍ
                    setTimeout(() => {
                        adBottom.style.display = 'none';
                    }, 10000);
                }
            });
        });
    } catch (error) {
        console.error('An error occurred:', error);
    }
});
