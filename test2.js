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
                        alert('سيتم فتح الإعلان في نافذة جديدة.');
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

                // تحديث الزر والنص
                var brandText = customization['brandText'] || 'Your Brand Name';
                var poweredByText = customization['poweredBy'] || 'Powered by YourBrand';
                var messageText = customization['messageText'] || 'Your product and services';
                var ctaText = customization['ctaText'] || 'Click Here';

                try { // إضافة try...catch
                    var brandTextElement = document.getElementById('brand-text');
                    if (brandTextElement) brandTextElement.textContent = brandText;
                } catch (e) {
                    console.error("Error setting brand text:", e);
                }

                try { // إضافة try...catch
                    var poweredByElement = document.getElementById('powered-by');
                    if (poweredByElement) poweredByElement.textContent = poweredByText;
                } catch (e) {
                    console.error("Error setting powered by text:", e);
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
                var buttonBgColor = customization['buttonBgColor'] || '#FF0000'; // لون خلفية الزر الفرعي
                var textColor = customization['textColor'] || '#333'; // لون النصوص
                var buttonBoxBgColor = customization['buttonBoxBgColor'] || '#ffffff'; // لون خلفية الزر الرئيسي

                try { // إضافة try...catch
                    var ctaTextElement = document.getElementById('cta-text');
                    if (ctaTextElement) ctaTextElement.style.backgroundColor = buttonBgColor;
                } catch (e) {
                    console.error("Error setting button background color:", e);
                }

                try { // إضافة try...catch
                    var brandTextElement = document.getElementById('brand-text');
                    var messageTextElement = document.getElementById('message-text');
                    var poweredByElement = document.getElementById('powered-by');

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

            } catch (error) {
                console.error('An error occurred:', error);
            }
        });

        function toggleAdBottom() {
            var adBottom = document.getElementById('ad-bottom');
            if (adBottom) {
                adBottom.classList.toggle('collapsed');
                var buttonText = adBottom.classList.contains('collapsed') ? 'إظهار' : 'إخفاء';
                adBottom.querySelector('.collapse-button').textContent = buttonText;
            }
        }
