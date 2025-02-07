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

            // فحص إذا كان الرابط يشير إلى موقع محظور (من القائمة اليدوية)
            var isBlocked = false;
            for (var site of blockedSites) {
                if (pageUrl.includes(site)) {
                    isBlocked = true;
                    break;
                }
            }

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

            var redirectMessage = document.getElementById('redirect-message');
            if (redirectMessage) {
                redirectMessage.style.display = 'block';
                redirectMessage.innerHTML = `
                    <p style="font-size: 16px; color: #333;">جاري نقلك إلى الموقع...</p>
                    <p id="countdown" style="font-size: 24px; color: #ff4500;">30</p>
                `;

                var countdown = 30; // المؤقت التنازلي لمدة 30 ثانية
                var countdownElement = document.getElementById('countdown');
                if (countdownElement) {
                    var countdownInterval = setInterval(function() {
                        countdown--;
                        countdownElement.textContent = countdown;

                        if (countdown <= 0) { // المؤقت التنازلي
                            clearInterval(countdownInterval);
                            window.location.href = pageUrl; // إعادة التوجيه بعد انتهاء الوقت
                        }
                    }, 1000);
                }

                // إظهار الإعلانات الثلاثة فقط في صفحة المؤقت
                var adRight = document.getElementById('ad-right');
                if (adRight) adRight.style.display = 'block';
                var adLeft = document.getElementById('ad-left');
                if (adLeft) adLeft.style.display = 'block';
                var adBelowMessage = document.getElementById('ad-below-message');
                if (adBelowMessage) adBelowMessage.style.display = 'block';

                // عرض الإعلان أسفل الصفحة
                var adBottom = document.getElementById('ad-bottom');
                if (adBottom) {
                    adBottom.style.display = 'block';
                }
            }
        }
        function showCtaBox() {
    var ctaBox = document.getElementById('cta-box');
    if (ctaBox) {
        ctaBox.style.opacity = '1'; // جعل الزر مرئيًا
        ctaBox.style.transform = 'translateY(0)'; // رفع الزر إلى مكانه
        ctaBox.classList.add('slide-in'); // بدء الأنميشن الدوري
    }
}
        // عرض الإعلان المنبثق بعد 15 ثانية
        setTimeout(function() {
            var adPopup = document.getElementById('ad-popup');
            if (adPopup) {
                adPopup.style.display = 'flex'; // عرض الإعلان
            }
        }, 15000);

        // إضافة وظائف للأزرار (فتح وإغلاق)
        document.addEventListener('DOMContentLoaded', function() {
            var adPopup = document.getElementById('ad-popup');
            if (adPopup) {
                var openButton = adPopup.querySelector('.popup-open');
                var closeButton = adPopup.querySelector('.popup-close');

                if (openButton) {
                    openButton.addEventListener('click', function() {
                        // يمكنك إضافة رابط لفتح الإعلان هنا
                        window.open(popupCtaUrl, '_blank');
                    });
                }

                if (closeButton) {
                    closeButton.addEventListener('click', function() {
                        adPopup.style.display = 'none'; // إخفاء الإعلان
                    });
                }
            }
        });

        // قراءة بيانات التخصيص من محتوى التدوينة
        function getPostCustomization() {
            var postBody = document.querySelector('.post-body');
            if (!postBody) return {};

            // البحث عن الكود المخصص داخل التدوينة
            var customizationElement = postBody.querySelector('pre.custom-data');
            if (!customizationElement) return {};

            // تحويل النص إلى أزواج مفتاح-قيمة
            var customization = {};
            try { // إضافة try...catch
                customizationElement.textContent.split(',').forEach(function(item) {
                    var parts = item.split('*');
                    if (parts.length === 2) {
                        customization[parts[0].trim()] = decodeURIComponent(parts[1].trim());
                    }
                });
            } catch (error) {
                console.error('Error parsing customization data:', error);
                return {}; // إرجاع كائن فارغ في حالة حدوث خطأ
            }

            // فحص وجود بيانات أساسية
            if (!customization['page'] || !customization['brandText']) {
                console.error('Missing required customization data!');
            }

            // فحص وجود بيانات الإعلان الإضافية
            if (!customization['popupContent'] || !customization['popupCtaText'] || !customization['popupCtaUrl']) {
                console.warn('Missing required popup customization data!');
            }

            return customization;
        }

  // تعديل دالة DOMContentLoaded
        document.addEventListener("DOMContentLoaded", function() {
            try { // إضافة try...catch
                var customization = getPostCustomization();

                // تحديث مصدر الإطار
                var iframe = document.querySelector('iframe');
                var pageUrl = customization['page'] || 'https://www.example.com';

                // استدعاء دالة تحديث مصدر الإطار
                updateIframeSource(pageUrl);

                // إخفاء الإعلان أسفل الصفحة
                var adBottom = document.getElementById('ad-bottom');
                if (adBottom) {
                    adBottom.style.display = 'none';
                }
        // تحديث cta
                var ctaTarget = customization['target'] || 'https://www.example.com';
                   // قم بتعيين href لـ cta-text
                   var ctaElement = document.getElementById('cta-text');
                if (ctaElement) {
                    ctaElement.href = ctaTarget;
                }

                   // تحديث محتوى الإعلان المنبثق
                var popupContent = customization['popupContent'] || '<p>This is an example popup ad.</p>';
                var popupCtaText = customization['popupCtaText'] || 'Open';
                var popupCtaUrl = customization['popupCtaUrl'] || '#';
                 // Get URL
                var popupOpenUrlElement = document.getElementById('popup-open-url');
                if (popupOpenUrlElement) {
                   popupOpenUrlElement.href = popupCtaUrl
                  // popupOpenUrlElement.setAttribute('href',popupCtaUrl)
                   popupOpenUrlElement.target = "_blank";
                }

                try {
                  var popupContentElement = document.querySelector('#ad-popup .popup-content');
                  if (popupContentElement) popupContentElement.innerHTML = popupContent;

                  var popupCtaElement = document.querySelector('#ad-popup .popup-open');
                  if (popupCtaElement) {
                      popupCtaElement.textContent = popupCtaText;
                      //popupCtaElement.href = popupCtaUrl;
                      //popupCtaElement.setAttribute('href',popupCtaUrl)
                  }
                } catch(e) {
                  console.log('error')
                }

                // مؤقت لظهور الزر العائم
                    var ctaBox = document.getElementById('cta-box');
                    if (ctaBox) {
                        var showAfter = parseInt(customization['showAfter'] || 5000); // القيمة الافتراضية 5 ثوانٍ

                        setTimeout(showCtaBox, showAfter);
                    }

                // إضافة اتجاه العرض
                var direction = customization['direction'] || 'ltr'; // القيمة الافتراضية هي ltr
                var ctaBoxElement = document.getElementById('cta-box');

                if (ctaBoxElement) {
                    ctaBoxElement.classList.remove('ltr', 'rtl'); // إزالة أي كلاسات موجودة
                    ctaBoxElement.classList.add(direction);
                }

                // تحديث الزر والنص
                var brandText = customization['brandText'] || 'Your Brand Name';
                var messageText = customization['messageText'] || 'Your product and services';
                var ctaText = customization['ctaText'] || 'Click Here';

                try { // إضافة try...catch
                    var brandTextElement = document.getElementById('brand-text');
                    if (brandTextElement) brandTextElement.textContent = brandText;
                } catch (e) {
                    console.error("Error setting brand text:", e);
                }

                try { // إضافة try...catch
                    var messageTextElement = document.getElementById('message-text');
                    if (messageTextElement) messageTextElement.textContent = messageText;
                } catch (e) {
                    console.error("Error setting message text:", e);
                }

                try { // إضافة try...catch
                    var ctaTextElement = document.getElementById('cta-text');
                    if (ctaTextElement) ctaTextElement.textContent = ctaText;
                } catch (e) {
                    console.error("Error setting cta text:", e);
                }

                // إضافة الألوان
                var buttonBgColor = customization['buttonBgColor'] || '#5db5fa'; // لون خلفية الزر الفرعي
                var textColor = customization['textColor'] || '#333'; // لون النصوص
                var buttonBoxBgColor = customization['buttonBoxBgColor'] || '#f0f0f0'; // لون خلفية الزر الرئيسي

                try { // إضافة try...catch
                    var ctaTextElement = document.getElementById('cta-text');
                    if (ctaTextElement) ctaTextElement.style.backgroundColor = buttonBgColor;
                } catch (e) {
                    console.error("Error setting button background color:", e);
                }

                try { // إضافة try...catch
                    var brandTextElement = document.getElementById('brand-text');
                    var messageTextElement = document.getElementById('message-text');

                    if (brandTextElement) brandTextElement.style.color = textColor;
                    if (messageTextElement) messageTextElement.style.color = textColor;
                } catch (e) {
                    console.error("Error setting text color:", e);
                }

                try { // إضافة try...catch
                    var ctaBoxElement = document.getElementById('cta-box');
                    if (ctaBoxElement) ctaBoxElement.style.backgroundColor = buttonBoxBgColor;
                } catch (e) {
                    console.error("Error setting button box background color:", e);
                }

                // تحديد مكان العرض (يمين أو يسار)
                var position = customization['position'] || 'left';
                try { // إضافة try...catch
                    var ctaBoxElement = document.getElementById('cta-box');
                    if (position === 'right' && ctaBoxElement) {
                        ctaBoxElement.style.left = 'auto';
                        ctaBoxElement.style.right = '20px';
                    } else if (ctaBoxElement) {
                        ctaBoxElement.style.right = 'auto';
                        ctaBoxElement.style.left = '20px';
                    }
                } catch (e) {
                    console.error("Error setting CTA position:", e);
                }

                // إضافة شعار اختياري
                var logoUrl = customization['logoUrl'];
                try { // إضافة try...catch
                    var logoUrlElement = document.getElementById('logo-url');

                    if (logoUrl && logoUrlElement) {
                        logoUrlElement.innerHTML = '<img src="' + logoUrl + '" alt="Logo" />';
                        logoUrlElement.style.display = 'block';
                    } else if (logoUrlElement) {
                        logoUrlElement.style.display = 'none';
                    }
                } catch (e) {
                    console.error("Error setting logo:", e);
                }

                // وظيفة لإغلاق الزر العائم وإظهار الإعلان أسفل الصفحة
                var closeButtons = document.querySelectorAll('.close');
                closeButtons.forEach(function(button) {
                    button.addEventListener('click', function() {
                        try {
                            var ctaBoxElement = document.getElementById('cta-box');
                            if (ctaBoxElement) {
                                ctaBoxElement.style.display = 'none';

                                // إظهار الإعلان أسفل الصفحة
                                var adBottom = document.getElementById('ad-bottom');
                                if (adBottom) {
                                    adBottom.style.display = 'block';

                                    // إعادة إخفاء الإعلان بعد 10 ثوانٍ
                                    setTimeout(function() {
                                        adBottom.style.display = 'none';
                                    }, 10000);
                                }
                            }
                        } catch (e) {
                            console.error("Error closing CTA:", e);
                        }
                    });
                });

                // تعديل رمز الإغلاق إلى X باستخدام JavaScript
                closeButtons.forEach(function(button) {
                    button.innerHTML = 'X'; // استخدام النص "X" بدلاً من ×
                });

            function toggleAdBottom() {
            var adBottom = document.getElementById('ad-bottom');
            if (adBottom) {
                adBottom.classList.toggle('collapsed');
                var buttonText = adBottom.classList.contains('collapsed') ? 'إظهار' : 'إخفاء';
                adBottom.querySelector('.collapse-button').textContent = buttonText;
            }
        }
        });
