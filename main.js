// Initialize Lucide Icons
lucide.createIcons();

// FAQ Accordion Logic
document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
        const faqItem = button.parentElement;

        // Close other items
        document.querySelectorAll('.faq-item').forEach(item => {
            if (item !== faqItem) {
                item.classList.remove('active');
            }
        });

        // Toggle current item
        faqItem.classList.toggle('active');
    });
});

// Navbar background change on scroll
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (window.scrollY > 50) {
        nav.style.padding = '1rem 5%';
        nav.style.background = 'rgba(5, 5, 5, 0.95)';
    } else {
        nav.style.padding = '1.5rem 5%';
        nav.style.background = 'rgba(5, 5, 5, 0.8)';
    }
});

// Smooth reveal animation for sections
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Modal Logic
const modal = document.getElementById('appointment-modal');
const openBtn = document.getElementById('open-appointment');
const startBtn = document.getElementById('start-btn');
const closeBtn = document.getElementById('close-modal');

const toggleModal = (show) => {
    modal.classList.toggle('active', show);
    document.body.style.overflow = show ? 'hidden' : '';
};

openBtn.addEventListener('click', () => toggleModal(true));
startBtn.addEventListener('click', () => toggleModal(true));
closeBtn.addEventListener('click', () => toggleModal(false));

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === modal) toggleModal(false);
});

// Form Submission to Supabase
const repairForm = document.getElementById('repair-form');
const submitBtn = document.getElementById('submit-btn');

repairForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Change button state
    const originalBtnText = submitBtn.innerText;
    submitBtn.disabled = true;
    submitBtn.innerText = '正在送出...';

    const formData = {
        name: document.getElementById('customer_name').value,
        phone: document.getElementById('mobile').value,
        issue_description: document.getElementById('description').value,
        status: '待處理',
        price: 0
    };

    try {
        const { data, error } = await supabaseClient
            .from('repair_orders')
            .insert([formData]);

        if (error) throw error;

        // 成功提示
        submitBtn.innerText = '✅ 預約成功！';
        submitBtn.style.background = '#00FF99';
        submitBtn.style.color = '#050505';

        setTimeout(() => {
            alert('預約成功！我們將盡快與您聯繫。');
            repairForm.reset();
            toggleModal(false);
            submitBtn.innerText = originalBtnText;
            submitBtn.style.background = '';
            submitBtn.style.color = '';
        }, 500);

    } catch (error) {
        console.error('Error:', error);
        alert('提交失敗：' + (error.message || '請檢查資料或稍後再試'));
    } finally {
        submitBtn.disabled = false;
        if (submitBtn.innerText !== '✅ 預約成功！') submitBtn.innerText = originalBtnText;
    }
});

document.querySelectorAll('.service-card, .pricing-table, .faq-item, .section-header').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    observer.observe(el);
});
