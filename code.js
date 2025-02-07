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
                    if (poweredByElement) poweredByElement.style.color = textColor;
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
