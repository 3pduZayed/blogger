        // قائمة بالمواقع المحظورة (سيتم تحديثها تلقائيًا)
        const blockedSites = [];
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

        // دالة للتحقق مما إذا كان يمكن عرض موقع داخل iframe
        function isSiteAllowedInIframe(url, callback) {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none'; // إخفاء الإطار

            iframe.onload = function() {
                // تم تحميل الموقع بنجاح، لذلك فهو مسموح به
                document.body.removeChild(iframe); // إزالة الإطار
                callback(true); // استدعاء الدالة مع القيمة true
            };

            iframe.onerror = function() {
                // حدث خطأ، لذلك الموقع غير مسموح به
                document.body.removeChild(iframe); // إزالة الإطار
                blockedSites.push(url); // إضافة الموقع إلى القائمة المحظورة
                callback(false); // استدعاء الدالة مع القيمة false
            };

            iframe.src = url; // تعيين مصدر الإطار
            document.body.appendChild(iframe); // إضافة الإطار إلى الصفحة
        }

        // تعديل دالة تحديث مصدر الإطار
        function updateIframeSource(pageUrl) {
            var iframe = document.querySelector('iframe');

            // فحص إذا كان الرابط يشير إلى موقع محظور (تم اكتشافه تلقائيًا)
            var isBlocked = blockedSites.includes(pageUrl);

            if (isBlocked) {
                // إخفاء الإطار وإظهار رسالة الإعادة التوجيه مع المؤقت التنازلي
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

                    // إظهار الإعلانات الثلاثة فقط في صفحة المؤ
