document.addEventListener('DOMContentLoaded', function() {
    // Function to update the navigation bar based on login state
    function updateNavBar() {
        const navItems = document.getElementById('navItems');
        if (!navItems) return;

        const email = localStorage.getItem('lastLoggedInEmail');
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email);

        // Remove any existing login/register or dropdown items
        const existingLoginItems = navItems.querySelectorAll('.nav-item.login-item');
        existingLoginItems.forEach(item => item.remove());

        if (user) {
            const username = user.username || email.split('@')[0];
            const dropdownHTML = `
                <li class="nav-item dropdown login-item">
                    <a class="nav-link dropdown-toggle active" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="fas fa-user-circle me-1"></i> ${username}
                    </a>
                    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                        <li><a class="dropdown-item" href="account.html">My Account</a></li>
                        ${email === '2108237@stockport.tcg.ac.uk' ? '<li><a class="dropdown-item" href="admin.html">Admin Dashboard</a></li>' : ''}
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item" href="#" id="logoutLink">Logout</a></li>
                    </ul>
                </li>
            `;
            navItems.insertAdjacentHTML('beforeend', dropdownHTML);

            // Add logout functionality
            const logoutLink = document.getElementById('logoutLink');
            if (logoutLink) {
                logoutLink.addEventListener('click', function(event) {
                    event.preventDefault();
                    localStorage.removeItem('lastLoggedInEmail');
                    window.location.href = 'index.html';
                });
            }
        } else {
            const loginRegisterHTML = `
                <li class="nav-item login-item">
                    <a class="nav-link" href="login.html">
                        <i class="fas fa-sign-in-alt me-1"></i> Login
                    </a>
                </li>
                <li class="nav-item login-item">
                    <a class="nav-link" href="register.html">
                        <i class="fas fa-user-plus me-1"></i> Register
                    </a>
                </li>
            `;
            navItems.insertAdjacentHTML('beforeend', loginRegisterHTML);
        }

        // Highlight the current page in the nav bar
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = navItems.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Call the function to update the nav bar on page load
    updateNavBar();

    // Simple hash function for password (for demo purposes only, not secure for production)
    function simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }

    // Login Form Logic
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const hashedPassword = simpleHash(password); // Hash the password
            
            // Hardcoded admin credentials
            const adminEmail = '2108237@stockport.tcg.ac.uk';
            const adminPassword = simpleHash('UnlockPotential25'); // Hash the admin password
            
            // Get registered users from localStorage
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            
            // Check admin credentials or registered users
            const user = users.find(u => u.email === email && u.password === hashedPassword) ||
                        (email === adminEmail && hashedPassword === adminPassword);
            
            if (user) {
                localStorage.setItem('lastLoggedInEmail', email);
                window.location.href = 'account.html';
            } else {
                alert('Invalid email or password. Please use the correct credentials or register.');
            }
            
            this.classList.add('was-validated');
        });
    }

    // Register Form Logic
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;
            const hashedPassword = simpleHash(password); // Hash the password
            
            // Validate email
            const emailPattern = /[a-z0-9._%+-]+@[a-z0-9.-]+\.(com|co\.uk)$/;
            if (!emailPattern.test(email)) {
                alert('Please enter a valid email ending with .com or .co.uk.');
                return;
            }
            
            // Validate password
            const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
            if (!passwordPattern.test(password)) {
                alert('Password must be at least 6 characters long, including uppercase, lowercase, a number, and a symbol.');
                return;
            }
            
            // Get existing users from localStorage
            let users = JSON.parse(localStorage.getItem('users') || '[]');
            
            // Check if email already exists
            if (users.some(u => u.email === email)) {
                alert('This email is already registered. Please use a different email.');
                return;
            }
            
            // Add new user
            users.push({ email, password: hashedPassword, username: email.split('@')[0] });
            localStorage.setItem('users', JSON.stringify(users));
            
            alert('Registration successful! Please log in with your new credentials.');
            window.location.href = 'login.html';
        });
    }

    // Function to save data to localStorage
    function saveToLocalStorage(key, data) {
        let existingData = JSON.parse(localStorage.getItem(key)) || [];
        existingData.push(data);
        localStorage.setItem(key, JSON.stringify(existingData));
    }

    // Function to update data in localStorage (for deletions)
    function updateLocalStorage(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    // Handle "Send Us a Message" form submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        // Restore form data from localStorage if available
        const savedContactData = JSON.parse(localStorage.getItem('contactFormDraft')) || {};
        document.getElementById('name').value = savedContactData.name || '';
        document.getElementById('email').value = savedContactData.email || '';
        document.getElementById('phone').value = savedContactData.phone || '';
        document.getElementById('subject').value = savedContactData.subject || 'membership';
        document.getElementById('message').value = savedContactData.message || '';

        // Save form data as the user types
        contactForm.querySelectorAll('input, select, textarea').forEach(input => {
            input.addEventListener('input', function() {
                const formData = {
                    name: document.getElementById('name').value,
                    email: document.getElementById('email').value,
                    phone: document.getElementById('phone').value,
                    subject: document.getElementById('subject').value,
                    message: document.getElementById('message').value
                };
                localStorage.setItem('contactFormDraft', JSON.stringify(formData));
            });
        });

        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();

            if (this.checkValidity()) {
                const formData = {
                    name: document.getElementById('name').value,
                    email: document.getElementById('email').value,
                    phone: document.getElementById('phone').value,
                    subject: document.getElementById('subject').value,
                    message: document.getElementById('message').value,
                    timestamp: new Date().toISOString()
                };

                // Save email and message to localStorage
                saveToLocalStorage('contactMessages', formData);

                // Display success message
                const alertsDiv = document.getElementById('formAlerts');
                alertsDiv.innerHTML = `
                    <div class="alert alert-success alert-dismissible fade show" role="alert">
                        Thank you, ${formData.name}! Your message has been sent successfully.
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
                `;
                this.reset();
                this.classList.remove('was-validated');
                localStorage.removeItem('contactFormDraft'); // Clear draft after submission
            }
        });
    }

    // Handle "Subscribe to Our Newsletter" form submission
    const subscribeButton = document.querySelector('#button-subscribe');
    if (subscribeButton) {
        const emailInput = document.querySelector('.input-group input[type="email"]');
        
        // Restore email input from localStorage if available
        emailInput.value = localStorage.getItem('newsletterDraft') || '';

        // Save email input as the user types
        emailInput.addEventListener('input', function() {
            localStorage.setItem('newsletterDraft', this.value);
        });

        subscribeButton.addEventListener('click', function(event) {
            const newsletterAlerts = document.createElement('div');
            newsletterAlerts.id = 'newsletterAlerts';
            newsletterAlerts.className = 'mt-3';

            if (emailInput.value && emailInput.checkValidity()) {
                const subscriptionData = {
                    email: emailInput.value,
                    timestamp: new Date().toISOString()
                };

                // Save email to localStorage
                saveToLocalStorage('newsletterSubscriptions', subscriptionData);

                // Display success message
                newsletterAlerts.innerHTML = `
                    <div class="alert alert-success alert-dismissible fade show" role="alert">
                        Thank you! You have subscribed with ${emailInput.value}.
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
                `;
                emailInput.value = '';
                localStorage.removeItem('newsletterDraft'); // Clear draft after subscription
            } else {
                newsletterAlerts.innerHTML = `
                    <div class="alert alert-danger alert-dismissible fade show" role="alert">
                        Please enter a valid email address.
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
                `;
            }

            const newsletterCard = this.closest('.card.bg-dark').parentNode;
            newsletterCard.parentNode.insertBefore(newsletterAlerts, newsletterCard.nextSibling);
        });
    }

    // Handle Membership Plan Signup
    const membershipForms = document.querySelectorAll('[id^="membershipForm"]');
    membershipForms.forEach(form => {
        const plan = form.id.replace('membershipForm', '');
        const nameInput = document.getElementById(`membershipName${plan}`);
        const emailInput = document.getElementById(`membershipEmail${plan}`);
        const alertsDiv = document.getElementById(`membershipAlerts${plan}`);

        // Restore form data from localStorage if available
        const savedData = JSON.parse(localStorage.getItem(`membershipDraft${plan}`)) || {};
        nameInput.value = savedData.name || '';
        emailInput.value = savedData.email || '';

        // Save form data as the user types
        [nameInput, emailInput].forEach(input => {
            input.addEventListener('input', function() {
                const formData = {
                    name: nameInput.value,
                    email: emailInput.value,
                    plan: plan
                };
                localStorage.setItem(`membershipDraft${plan}`, JSON.stringify(formData));
            });
        });

        form.addEventListener('submit', function(event) {
            event.preventDefault();

            if (this.checkValidity()) {
                const formData = {
                    name: nameInput.value,
                    email: emailInput.value,
                    plan: plan,
                    price: {
                        'Basic': '£25.00', 'Intermediate': '£35.00', 'Advanced': '£45.00', 'Elite': '£60.00'
                    }[plan] || 'N/A',
                    timestamp: new Date().toISOString()
                };

                // Save membership signup to localStorage
                saveToLocalStorage('membershipSignups', formData);

                // Display success message
                alertsDiv.innerHTML = `
                    <div class="alert alert-success alert-dismissible fade show" role="alert">
                        Thank you, ${formData.name}! Your ${formData.plan} membership (£${formData.price.replace('£', '')}/month) signup has been recorded. We will contact you soon.
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
                `;
                this.reset();
                this.classList.remove('was-validated');
                localStorage.removeItem(`membershipDraft${plan}`); // Clear draft after submission
            }
        });
    });

    // Admin Dashboard Logic (Only on admin.html)
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    if (currentPage === 'admin.html') {
        const adminContent = document.getElementById('adminContent');
        const accessDenied = document.getElementById('accessDenied');
        const email = localStorage.getItem('lastLoggedInEmail');

        if (email === '2108237@stockport.tcg.ac.uk' && adminContent) {
            adminContent.classList.remove('d-none');
            if (accessDenied) accessDenied.classList.add('d-none');

            // Load submission data
            const contactMessages = JSON.parse(localStorage.getItem('contactMessages')) || [];
            const newsletterSubscriptions = JSON.parse(localStorage.getItem('newsletterSubscriptions')) || [];
            const membershipSignups = JSON.parse(localStorage.getItem('membershipSignups')) || [];

            // Update summary cards
            document.getElementById('contactMessagesCount').textContent = contactMessages.length;
            document.getElementById('newsletterSubscriptionsCount').textContent = newsletterSubscriptions.length;
            document.getElementById('membershipSignupsCount').textContent = membershipSignups.length;

            // Membership Signups Chart Data
            const planCounts = { Basic: 0, Intermediate: 0, Advanced: 0, Elite: 0 };
            membershipSignups.forEach(signup => {
                if (planCounts[signup.plan] !== undefined) {
                    planCounts[signup.plan]++;
                }
            });

            // Create the chart for membership signups
            const chartConfig = {
                type: 'bar',
                data: {
                    labels: ['Basic', 'Intermediate', 'Advanced', 'Elite'],
                    datasets: [{
                        label: 'Membership Signups',
                        data: [planCounts.Basic, planCounts.Intermediate, planCounts.Advanced, planCounts.Elite],
                        backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
                        borderColor: ['#FF4C4C', '#3AB8B0', '#339AB5', '#7AB89F'],
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Number of Signups'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Membership Plan'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            };

            document.getElementById('membershipChart').innerHTML = '<canvas id="membershipChartCanvas"></canvas>';
            const canvas = document.getElementById('membershipChartCanvas');
            canvas.chartConfig = chartConfig; // Attach the config to the canvas for rendering

            // Populate Contact Messages Table
            const contactMessagesTableBody = document.querySelector('#contactMessagesTable tbody');
            contactMessages.forEach((msg, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${msg.name}</td>
                    <td>${msg.email}</td>
                    <td>${msg.phone || 'N/A'}</td>
                    <td>${msg.subject}</td>
                    <td>${msg.message}</td>
                    <td>${new Date(msg.timestamp).toLocaleString()}</td>
                    <td>
                        <button class="btn btn-danger btn-sm" onclick="deleteSubmission('contactMessages', ${index})">Delete</button>
                    </td>
                `;
                contactMessagesTableBody.appendChild(row);
            });

            // Populate Newsletter Subscriptions Table
            const newsletterSubscriptionsTableBody = document.querySelector('#newsletterSubscriptionsTable tbody');
            newsletterSubscriptions.forEach((sub, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${sub.email}</td>
                    <td>${new Date(sub.timestamp).toLocaleString()}</td>
                    <td>
                        <button class="btn btn-danger btn-sm" onclick="deleteSubmission('newsletterSubscriptions', ${index})">Delete</button>
                    </td>
                `;
                newsletterSubscriptionsTableBody.appendChild(row);
            });

            // Populate Membership Signups Table
            const membershipSignupsTableBody = document.querySelector('#membershipSignupsTable tbody');
            membershipSignups.forEach((signup, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${signup.name}</td>
                    <td>${signup.email}</td>
                    <td>${signup.plan}</td>
                    <td>${signup.price}</td>
                    <td>${new Date(signup.timestamp).toLocaleString()}</td>
                    <td>
                        <button class="btn btn-danger btn-sm" onclick="deleteSubmission('membershipSignups', ${index})">Delete</button>
                    </td>
                `;
                membershipSignupsTableBody.appendChild(row);
            });
        } else if (adminContent && accessDenied) {
            adminContent.classList.add('d-none');
            accessDenied.classList.remove('d-none');
        }
    }

    // Delete Submission Function
    window.deleteSubmission = function(key, index) {
        const data = JSON.parse(localStorage.getItem(key)) || [];
        data.splice(index, 1);
        updateLocalStorage(key, data);
        window.location.reload(); // Refresh to update the tables
    };

    // Clear Form History
    window.clearFormHistory = function() {
        localStorage.removeItem('contactMessages');
        localStorage.removeItem('newsletterSubscriptions');
        localStorage.removeItem('membershipSignups');
        localStorage.removeItem('contactFormDraft');
        localStorage.removeItem('newsletterDraft');
        ['Basic', 'Intermediate', 'Advanced', 'Elite'].forEach(plan => {
            localStorage.removeItem(`membershipDraft${plan}`);
        });
        window.location.reload(); // Refresh to update the dashboard
    };

    // Gallery Filter Logic
    const filterButtons = document.querySelectorAll('.btn-group button');
    const galleryItems = document.querySelectorAll('.gallery-item');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');

            galleryItems.forEach(item => {
                const category = item.getAttribute('data-category');
                if (filterValue === 'all' || filterValue === category) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
});