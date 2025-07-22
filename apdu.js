// Ensure the DOM is fully loaded before running scripts
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const clearButton = document.getElementById('clearButton');
    const resultsContainer = document.getElementById('resultsContainer');
    const searchHistoryList = document.getElementById('searchHistoryList');
    const clearHistoryButton = document.getElementById('clearHistoryButton');
    const noHistoryMessage = document.getElementById('noHistoryMessage');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const loadingIndicator = document.getElementById('loadingIndicator');

    // Modal elements
    const studentModal = document.getElementById('studentModal');
    const closeModalButton = document.getElementById('closeModalButton');
    const modalContent = document.getElementById('modalContent');
    const shareModalResultButton = document.getElementById('shareModalResultButton');

    // IMPORTANT: Replace with your actual API endpoint URL
    // Example: const API_ENDPOINT = 'https://your-ngrok-url.ngrok.io/search';
    const API_ENDPOINT = 'https://a65aa95cbf52.ngrok-free.app/search'; 

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

            // Handle different API response structures based on the provided API documentation
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
                } else if (data.error) {
                    // Case: General error response from API
                    return { success: false, message: data.error };
                }
                else {
                    // Fallback for unexpected successful response structure
                    return { success: false, message: "استجابة API غير متوقعة." };
                }
            } else {
                // Handle HTTP errors (e.g., 400 Bad Request, 500 Internal Server Error)
                return { success: false, message: data.error || `خطأ في الاتصال بالـ API: ${response.status} ${response.statusText}` };
            }
        } catch (error) {
            console.error('Error fetching student data:', error);
            loadingIndicator.classList.add('hidden');
            searchButton.disabled = false;
            return { success: false, message: "حدث خطأ في الشبكة أو الاتصال بالـ API." };
        }
    }

    // --- Display Results (Names Only) ---
    const displayResults = (data) => {
        resultsContainer.innerHTML = ''; // Clear previous results
        // shareButtonContainer.classList.add('hidden'); // No longer needed here

        if (!data || data.length === 0) {
            resultsContainer.innerHTML = `
                <div class="bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 p-4 rounded-lg text-center font-semibold">
                    <i class="fas fa-exclamation-triangle ml-2"></i> لا توجد نتائج مطابقة لمدخلاتك. يرجى التحقق والمحاولة مرة أخرى.
                </div>
            `;
            return;
        }

        data.forEach(student => {
            const studentNameCard = document.createElement('div');
            studentNameCard.className = 'p-4 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 text-gray-800 dark:text-gray-100 font-bold text-lg text-center';
            studentNameCard.textContent = student.Name;
            // Store full student data as a stringified JSON in a data attribute
            studentNameCard.dataset.student = JSON.stringify(student);
            
            studentNameCard.addEventListener('click', () => {
                showStudentDetailsModal(student);
            });
            resultsContainer.appendChild(studentNameCard);
        });
    };

    // --- Show Student Details in Modal ---
    const showStudentDetailsModal = (student) => {
        modalContent.innerHTML = ''; // Clear previous modal content

        // Map API 'case' status to simple 'ناجح' or 'راسب'
        const studentStatus = student.case && student.case.includes('ناجح') ? 'ناجح' : 'راسب';
        const statusBadgeClass = studentStatus === 'ناجح' ? 'success' : 'failed';

        let detailsHtml = `
            <div class="sharable-image-content">
                <h3 class="text-3xl font-bold mb-3">${student.Name}</h3>
                <p><strong>رقم الجلوس:</strong> ${student.Nom}</p>
                <p><strong>إجمالي الدرجات:</strong> ${student.Deg}</p>
                <p><strong>الحالة:</strong> <span class="status-badge ${statusBadgeClass}">${studentStatus}</span></p>
        `;

        // Special message for successful students
        if (studentStatus === 'ناجح') {
            detailsHtml += `
                <div class="success-message mt-4">
                    <p class="text-2xl mb-2">🎉 ${student.Name} 🎉</p>
                    <p class="text-xl">🎉 ألف مبروك يا نجم 🎓
 رفعت راسنا وبيضت وش العيلة👏
دي فرحة كبيرة وتستاهل لها زغروطة من اللي بترن في السما 💃🎊</p>
                    <p class="text-lg mt-2">بس فين حلاوة النجاح؟ 😄
</p>
                    <p class="text-2xl mb-2">لو ناوي تفرّحنا معاك ابعتلي على فودافون كاش:01091653984</p>
                    <p class="text-2xl mb-2">وعقبال فرحتك الكبيرة إن شاء الله 🎉</p>


                </div>
            `;
        }
        detailsHtml += `</div>`; // Close sharable-image-content

        modalContent.innerHTML = detailsHtml;
        studentModal.classList.add('show'); // Show modal with animation
        studentModal.classList.remove('hidden'); // Ensure it's not hidden by display:none
    };

    // --- Modal Close Functionality ---
    const closeModal = () => {
        studentModal.classList.remove('show'); // Hide modal with animation
        // Use a timeout to ensure animation completes before setting display: none
        setTimeout(() => {
            studentModal.classList.add('hidden');
            modalContent.innerHTML = ''; // Clear content after hiding
        }, 300); // Match CSS transition duration
    };

    closeModalButton.addEventListener('click', closeModal);
    // Close modal if clicking outside the content (on the overlay)
    studentModal.addEventListener('click', (e) => {
        if (e.target === studentModal) {
            closeModal();
        }
    });

    // --- Search Functionality ---
    const performSearch = async () => {
        const query = searchInput.value.trim();
        resultsContainer.innerHTML = ''; // Clear previous results
        // shareButtonContainer.classList.add('hidden'); // No longer needed here

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
        // shareButtonContainer.classList.add('hidden'); // No longer needed here
        searchInput.focus();
    });

    // --- Share Results as Image (from Modal) ---
    shareModalResultButton.addEventListener('click', () => {
        const contentToCapture = modalContent.querySelector('.sharable-image-content'); // Target the specific content div

        if (!contentToCapture) {
            console.error("Content for screenshot not found in modal.");
            // Optionally display an error message in the modal
            return;
        }

        // Temporarily adjust modal for screenshot if needed (e.g., remove scrollbars)
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden'; // Prevent scrollbars from appearing in screenshot

        html2canvas(contentToCapture, {
            scale: 2, // Increase scale for better quality
            useCORS: true, // Important if you have external images/resources
            backgroundColor: document.documentElement.classList.contains('dark') ? '#2d3748' : '#ffffff' // Set background color based on theme
        }).then(canvas => {
            document.body.style.overflow = originalOverflow; // Restore original overflow

            const image = canvas.toDataURL('image/png');

            // Create a temporary link to download the image
            const link = document.createElement('a');
            link.href = image;
            link.download = 'نتيجة-الطالب.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Optional: Provide a message to the user inside the modal
            const messageDiv = document.createElement('div');
            messageDiv.className = 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 p-3 rounded-lg text-center font-semibold mt-4';
            messageDiv.innerHTML = `<i class="fas fa-check-circle ml-2"></i> تم حفظ النتيجة كصورة! يمكنك الآن مشاركتها يدويًا.`;
            modalContent.appendChild(messageDiv);

            setTimeout(() => {
                if (messageDiv) messageDiv.remove();
            }, 5000); // Remove message after 5 seconds
        }).catch(error => {
            console.error('Error generating image:', error);
            document.body.style.overflow = originalOverflow; // Restore original overflow

            const errorMessageDiv = document.createElement('div');
            errorMessageDiv.className = 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 p-3 rounded-lg text-center font-semibold mt-4';
            errorMessageDiv.innerHTML = `<i class="fas fa-exclamation-circle ml-2"></i> حدث خطأ أثناء إنشاء الصورة.`;
            modalContent.appendChild(errorMessageDiv);

            setTimeout(() => {
                if (errorMessageDiv) errorMessageDiv.remove();
            }, 3000);
        });
    });
});
