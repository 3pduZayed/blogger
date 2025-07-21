// Ensure the DOM is fully loaded before running scripts
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const clearButton = document.getElementById('clearButton');
    const resultsContainer = document.getElementById('resultsContainer');
    const shareButtonContainer = document.getElementById('shareButtonContainer');
    const shareResultButton = document.getElementById('shareResultButton');
    const searchHistoryList = document.getElementById('searchHistoryList');
    const clearHistoryButton = document.getElementById('clearHistoryButton');
    const noHistoryMessage = document.getElementById('noHistoryMessage');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const loadingIndicator = document.getElementById('loadingIndicator');

    // IMPORTANT: Replace with your actual API endpoint URL
    // Example: const API_ENDPOINT = 'https://your-ngrok-url.ngrok.io/search';
    const API_ENDPOINT = 'https://465b68ea058a.ngrok-free.app/search'; 

    // --- Dark Mode Logic ---
    const applyDarkMode = (isDark) => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        applyDarkMode(true);
    } else {
        applyDarkMode(false); // Default to light if no preference or 'light'
    }

    // Toggle dark mode on button click
    darkModeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.classList.contains('dark');
        applyDarkMode(!isDark);
    });

    // --- Search History Logic ---
    const MAX_HISTORY_ITEMS = 5; // Limit history to 5 items

    const getSearchHistory = () => {
        try {
            const history = localStorage.getItem('searchHistory');
            return history ? JSON.parse(history) : [];
        } catch (e) {
            console.error("Error parsing search history from localStorage:", e);
            return [];
        }
    };

    const saveSearchHistory = (query) => {
        let history = getSearchHistory();
        // Remove existing entry if it's already in history to move it to top
        history = history.filter(item => item !== query);
        history.unshift(query); // Add to the beginning
        history = history.slice(0, MAX_HISTORY_ITEMS); // Keep only the latest N items
        localStorage.setItem('searchHistory', JSON.stringify(history));
        renderSearchHistory();
    };

    const renderSearchHistory = () => {
        const history = getSearchHistory();
        searchHistoryList.innerHTML = ''; // Clear current list

        if (history.length === 0) {
            noHistoryMessage.style.display = 'block';
            clearHistoryButton.classList.add('hidden');
        } else {
            noHistoryMessage.style.display = 'none';
            clearHistoryButton.classList.remove('hidden');
            history.forEach(query => {
                const historyItem = document.createElement('div');
                historyItem.className = 'p-3 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 text-gray-700 dark:text-gray-200';
                historyItem.textContent = query;
                historyItem.addEventListener('click', () => {
                    searchInput.value = query;
                    performSearch();
                });
                searchHistoryList.appendChild(historyItem);
            });
        }
    };

    const clearSearchHistory = () => {
        localStorage.removeItem('searchHistory');
        renderSearchHistory();
    };

    clearHistoryButton.addEventListener('click', clearSearchHistory);

    // Initial render of search history
    renderSearchHistory();

    // --- Fetch Student Data from API ---
    async function fetchStudentData(query) {
        loadingIndicator.classList.remove('hidden');
        searchButton.disabled = true;

        const isRollNumber = /^\d+$/.test(query); // Check if query is purely numeric

        let url = '';
        if (isRollNumber) {
            url = `${API_ENDPOINT}?id=${encodeURIComponent(query)}`;
        } else {
            url = `${API_ENDPOINT}?name=${encodeURIComponent(query)}`;
        }

    try {
        const response = await fetch(url, {
            // إضافة هذا الجزء لتجاوز تحذير ngrok
            headers: {
                "ngrok-skip-browser-warning": "true"
            }
        });
        const data = await response.json();

            loadingIndicator.classList.add('hidden');
            searchButton.disabled = false;

            // Handle different API response structures
            if (response.ok) {
                if (data.results && Array.isArray(data.results)) {
                    // Case: Multiple results (from name search) or no results (results: [])
                    if (data.results.length > 0) {
                        return { success: true, data: data.results };
                    } else {
                        return { success: false, message: data.message || "لم يتم العثور على نتائج." };
                    }
                } else if (data.Nom && data.Name && data.Deg !== undefined && data.case) {
                    // Case: Single student object (from ID search)
                    return { success: true, data: [data] }; // Wrap in array for consistent display
                } else if (data.message && data.results && data.results.length === 0) {
                    // Case: No results found (e.g., {"message": "لم يتم العثور على نتائج", "results": []})
                    return { success: false, message: data.message };
                } else {
                    // Fallback for unexpected successful response structure
                    return { success: false, message: "استجابة API غير متوقعة." };
                }
            } else {
                // Handle API errors (e.g., 400 Bad Request for missing params)
                return { success: false, message: data.error || "خطأ في الاتصال بالـ API." };
            }
        } catch (error) {
            console.error('Error fetching student data:', error);
            loadingIndicator.classList.add('hidden');
            searchButton.disabled = false;
            return { success: false, message: "حدث خطأ في الشبكة أو الاتصال بالـ API." };
        }
    }

    // --- Display Results ---
    const displayResults = (data) => {
        resultsContainer.innerHTML = ''; // Clear previous results
        shareButtonContainer.classList.add('hidden'); // Hide share button initially

        if (!data || data.length === 0) {
            resultsContainer.innerHTML = `
                <div class="bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 p-4 rounded-lg text-center font-semibold">
                    <i class="fas fa-exclamation-triangle ml-2"></i> لا توجد نتائج مطابقة لمدخلاتك. يرجى التحقق والمحاولة مرة أخرى.
                </div>
            `;
            return;
        }

        data.forEach(student => {
            // Map API 'case' status to simple 'ناجح' or 'راسب'
            const studentStatus = student.case && student.case.includes('ناجح') ? 'ناجح' : 'راسب';
            const statusClass = studentStatus === 'ناجح' ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100';

            const studentCard = document.createElement('div');
            studentCard.className = `p-6 mb-4 rounded-xl shadow-md ${statusClass}`;
            studentCard.innerHTML = `
                <h3 class="text-2xl font-bold mb-3">${student.Name}</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-lg">
                    <p><strong>رقم الجلوس:</strong> ${student.Nom}</p>
                    <p><strong>إجمالي الدرجات:</strong> ${student.Deg}</p>
                    <p><strong>الحالة:</strong> <span class="font-bold">${studentStatus}</span></p>
                </div>
            `;
            resultsContainer.appendChild(studentCard);

            // Special message for successful students
            if (studentStatus === 'ناجح') {
                const successMessage = document.createElement('div');
                successMessage.className = 'success-message mt-4';
                successMessage.innerHTML = `
                    <p class="text-2xl mb-2">🎉 تهانينا، ${student.Name}! أنت ناجح! 🎉</p>
                    <p class="text-xl">بمناسبة هذا النجاح الباهر، يسعدني جداً أن أطلب منك هدية بسيطة!</p>
                    <p class="text-lg mt-2">تواصل معي لمعرفة التفاصيل 😉</p>
                `;
                resultsContainer.appendChild(successMessage);
            }
        });

        shareButtonContainer.classList.remove('hidden'); // Show share button after results
    };

    // --- Search Functionality ---
    const performSearch = async () => {
        const query = searchInput.value.trim();
        resultsContainer.innerHTML = ''; // Clear previous results
        shareButtonContainer.classList.add('hidden'); // Hide share button

        if (!query) {
            resultsContainer.innerHTML = `
                <div class="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 p-4 rounded-lg text-center font-semibold">
                    <i class="fas fa-info-circle ml-2"></i> يرجى إدخال رقم الجلوس أو اسم الطالب للبحث.
                </div>
            `;
            return;
        }

        try {
            const response = await fetchStudentData(query);
            if (response.success && response.data) {
                displayResults(response.data);
                saveSearchHistory(query); // Save successful search to history
            } else {
                resultsContainer.innerHTML = `
                    <div class="bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 p-4 rounded-lg text-center font-semibold">
                        <i class="fas fa-exclamation-triangle ml-2"></i> ${response.message || 'حدث خطأ أثناء جلب البيانات.'}
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error during search:', error);
            resultsContainer.innerHTML = `
                <div class="bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 p-4 rounded-lg text-center font-semibold">
                    <i class="fas fa-exclamation-circle ml-2"></i> حدث خطأ غير متوقع. يرجى المحاولة لاحقًا.
                </div>
            `;
        }
    };

    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    clearButton.addEventListener('click', () => {
        searchInput.value = '';
        resultsContainer.innerHTML = '';
        shareButtonContainer.classList.add('hidden');
        searchInput.focus();
    });

    // --- Share Results as Image ---
    shareResultButton.addEventListener('click', () => {
        // Temporarily hide elements not meant for the screenshot
        const elementsToHide = [
            searchButton, clearButton, searchInput.parentNode.querySelector('p'),
            shareButtonContainer, document.getElementById('searchHistorySection'), // Target by ID directly
            document.getElementById('adSlotTop'), // Target by ID directly
            document.getElementById('adSlotBottom'), // Target by ID directly
            document.querySelector('header'), document.querySelector('footer')
        ];
        elementsToHide.forEach(el => {
            if (el) el.style.display = 'none';
        });

        // Capture the main content area (excluding header/footer/search bar itself)
        const mainContent = document.querySelector('main'); // Capture the main card

        html2canvas(mainContent, {
            scale: 2, // Increase scale for better quality
            useCORS: true, // Important if you have external images/resources (though we don't here)
            backgroundColor: document.documentElement.classList.contains('dark') ? '#1a202c' : '#ffffff' // Set background color based on theme
        }).then(canvas => {
            // Restore hidden elements
            elementsToHide.forEach(el => {
                if (el) el.style.display = ''; // Restore original display
            });
            // Specific fix for the note under search input, which might be a 'p' tag
            const searchNote = searchInput.parentNode.querySelector('p');
            if (searchNote) searchNote.style.display = 'block'; // Ensure it's block if it was initially

            const image = canvas.toDataURL('image/png');

            // Create a temporary link to download the image
            const link = document.createElement('a');
            link.href = image;
            link.download = 'نتيجة-الطالب.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Optional: Provide a message to the user
            resultsContainer.insertAdjacentHTML('afterbegin', `
                <div class="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 p-3 rounded-lg text-center font-semibold mb-4">
                    <i class="fas fa-check-circle ml-2"></i> تم حفظ النتيجة كصورة! يمكنك الآن مشاركتها يدويًا.
                </div>
            `);
            setTimeout(() => {
                const message = resultsContainer.querySelector('.bg-blue-100');
                if (message) message.remove();
            }, 5000); // Remove message after 5 seconds
        }).catch(error => {
            console.error('Error generating image:', error);
            // Restore hidden elements in case of error
            elementsToHide.forEach(el => {
                if (el) el.style.display = '';
            });
             const searchNote = searchInput.parentNode.querySelector('p');
            if (searchNote) searchNote.style.display = 'block';

            resultsContainer.insertAdjacentHTML('afterbegin', `
                <div class="bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 p-3 rounded-lg text-center font-semibold mb-4">
                    <i class="fas fa-exclamation-circle ml-2"></i> حدث خطأ أثناء إنشاء الصورة.
                </div>
            `);
            setTimeout(() => {
                const message = resultsContainer.querySelector('.bg-red-100');
                if (message) message.remove();
            }, 3000);
        });
    });
});
