// Authentication and Database Service
class AuthService {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        // Mock user database - in real app, this would be server-side
        this.users = new Map();
        this.initSampleUsers();
        this.initGoogleAuth();
    }

    initSampleUsers() {
        // Add some sample users for demo
        this.users.set('demo@example.com', {
            id: 'demo_user',
            name: 'Demo User',
            email: 'demo@example.com',
            phone: '+91-9876543210',
            password: 'demo123',
            createdAt: new Date().toISOString(),
            isGoogleUser: false
        });
        
        this.users.set('john@example.com', {
            id: 'u1',
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+91-9876543210',
            password: 'password123',
            createdAt: new Date().toISOString(),
            isGoogleUser: false
        });
    }

    async initGoogleAuth() {
        // Initialize Google OAuth
        // SETUP REQUIRED: Replace with your Google OAuth Client ID
        try {
            if (window.google) {
                window.google.accounts.id.initialize({
                    client_id: "YOUR_GOOGLE_CLIENT_ID_HERE.googleusercontent.com",
                    callback: this.handleGoogleResponse.bind(this)
                });
            }
        } catch (error) {
            console.log('Google OAuth not available in demo mode');
        }
    }

    async login(email, password) {
        // Mock login - in real app, this would call your backend API
        const user = this.users.get(email);
        if (user && user.password === password) {
            this.currentUser = { ...user };
            delete this.currentUser.password; // Remove password from memory
            this.isAuthenticated = true;
            return { success: true, user: this.currentUser };
        }
        return { success: false, error: 'Invalid email or password' };
    }

    async register(userData) {
        // Mock registration - in real app, this would call your backend API
        const { name, phone, email, password } = userData;
        
        if (this.users.has(email)) {
            return { success: false, error: 'User already exists' };
        }

        const newUser = {
            id: 'user_' + Date.now(),
            name,
            phone,
            email,
            password, // In real app, this would be hashed
            createdAt: new Date().toISOString(),
            isGoogleUser: false
        };

        this.users.set(email, newUser);
        this.currentUser = { ...newUser };
        delete this.currentUser.password;
        this.isAuthenticated = true;
        
        return { success: true, user: this.currentUser };
    }

    async handleGoogleResponse(response) {
        // Handle Google OAuth response
        // SETUP REQUIRED: Process the JWT token from Google
        try {
            const payload = JSON.parse(atob(response.credential.split('.')[1]));
            const googleUser = {
                id: 'google_' + payload.sub,
                name: payload.name,
                email: payload.email,
                phone: '', // Google doesn't provide phone by default
                createdAt: new Date().toISOString(),
                isGoogleUser: true,
                googleId: payload.sub
            };

            this.users.set(payload.email, googleUser);
            this.currentUser = googleUser;
            this.isAuthenticated = true;
            
            // Trigger login success
            app.handleAuthSuccess();
        } catch (error) {
            console.error('Google auth error:', error);
            app.showToast('Google authentication failed', 'error');
        }
    }

    logout() {
        this.currentUser = null;
        this.isAuthenticated = false;
        // In real app, you would also invalidate the session on server
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isLoggedIn() {
        return this.isAuthenticated;
    }
}

// Database Service for user-specific data
class DatabaseService {
    constructor() {
        // Mock database structure - in real app, this would be server-side
        this.userDatabase = new Map(); // userId -> userData
        this.initSampleData();
    }

    initSampleData() {
        // Sample data for demonstration
        const sampleUserId = 'demo_user';
        this.userDatabase.set(sampleUserId, {
            groups: [
                {
                    id: "g1",
                    name: "Weekend Trip", 
                    description: "Beach vacation with friends",
                    members: [
                        {id: "u1", name: "John Doe", phone: "+91-9876543210", email: "john@example.com"},
                        {id: "u2", name: "Jane Smith", phone: "+91-9876543211", email: "jane@example.com"},
                        {id: "u3", name: "Mike Johnson", phone: "+91-9876543212", email: "mike@example.com"}
                    ],
                    createdAt: "2025-08-15"
                }
            ],
            expenses: [
                {
                    id: "e1",
                    groupId: "g1",
                    amount: 1200,
                    description: "Dinner at restaurant",
                    category: "Food",
                    payer: "u1",
                    participants: ["u1", "u2", "u3"],
                    tax: 120,
                    tip: 180,
                    totalAmount: 1500,
                    date: "2025-08-15"
                },
                {
                    id: "e2",
                    groupId: "g1",
                    amount: 600,
                    description: "Uber ride",
                    category: "Transport",
                    payer: "u2",
                    participants: ["u1", "u2", "u3"],
                    tax: 0,
                    tip: 0,
                    totalAmount: 600,
                    date: "2025-08-15"
                }
            ],
            messages: [
                {
                    id: "m1",
                    groupId: "g1",
                    sender: "u1",
                    message: "Hey everyone! Just added the dinner expense.",
                    timestamp: "2025-08-15T19:30:00Z"
                }
            ],
            settings: {
                hidePersonalSpending: false,
                shareContactInfo: true,
                theme: 'light'
            }
        });
    }

    getUserData(userId) {
        if (!this.userDatabase.has(userId)) {
            // Initialize empty data for new user
            this.userDatabase.set(userId, {
                groups: [],
                expenses: [],
                messages: [],
                settings: {
                    hidePersonalSpending: false,
                    shareContactInfo: true,
                    theme: 'light'
                }
            });
        }
        return this.userDatabase.get(userId);
    }

    saveUserData(userId, data) {
        this.userDatabase.set(userId, data);
        // In real app, this would save to your backend database
        console.log(`Data saved for user ${userId}:`, data);
    }

    // Real app would have these methods call your backend API
    async syncData(userId) {
        // Sync local data with server
        return Promise.resolve();
    }
}

// Payment Service with Razorpay Integration
class PaymentService {
    constructor() {
        // SETUP REQUIRED: Add your Razorpay configuration
        this.razorpayConfig = {
            key: "rzp_test_YOUR_KEY_HERE", // Replace with your Razorpay key
            currency: "INR",
            name: "SplitWise",
            description: "Group expense settlement",
            theme: {
                color: "#208dd1"
            }
        };
    }

    async initiatePayment(paymentData) {
        const { amount, recipientName, settlementId, userEmail } = paymentData;
        
        // Convert amount to paise (Razorpay expects amount in paise)
        const amountInPaise = Math.round(amount * 100);

        const options = {
            ...this.razorpayConfig,
            amount: amountInPaise,
            order_id: `order_${settlementId}_${Date.now()}`, // In real app, get this from server
            prefill: {
                email: userEmail,
                name: recipientName
            },
            handler: (response) => {
                this.handlePaymentSuccess(response, settlementId);
            },
            modal: {
                ondismiss: () => {
                    this.handlePaymentDismiss(settlementId);
                }
            }
        };

        try {
            if (window.Razorpay) {
                const rzp = new window.Razorpay(options);
                rzp.open();
            } else {
                // Fallback for demo
                this.simulatePayment(paymentData);
            }
        } catch (error) {
            console.error('Payment initialization failed:', error);
            app.showToast('Payment service unavailable', 'error');
        }
    }

    handlePaymentSuccess(response, settlementId) {
        // SETUP REQUIRED: Verify payment on your server
        console.log('Payment successful:', response);
        
        // Update settlement status
        app.updatePaymentStatus(settlementId, 'paid', response.razorpay_payment_id);
        app.showToast('Payment completed successfully!', 'success');
    }

    handlePaymentDismiss(settlementId) {
        console.log('Payment dismissed for settlement:', settlementId);
        app.updatePaymentStatus(settlementId, 'cancelled');
    }

    simulatePayment(paymentData) {
        // Simulate payment for demo purposes
        app.showToast('Simulating payment (Razorpay not configured)...', 'warning');
        
        setTimeout(() => {
            app.updatePaymentStatus(paymentData.settlementId, 'paid', 'demo_payment_' + Date.now());
            app.showToast('Demo payment completed!', 'success');
        }, 2000);
    }

    // Method to create order on server (in real app)
    async createOrder(amount, currency = 'INR') {
        // SETUP REQUIRED: Call your backend to create Razorpay order
        // return fetch('/api/create-order', { ... });
        return Promise.resolve({
            id: `order_${Date.now()}`,
            amount: amount * 100,
            currency
        });
    }

    // Method to verify payment on server (in real app)
    async verifyPayment(paymentData) {
        // SETUP REQUIRED: Call your backend to verify payment
        // return fetch('/api/verify-payment', { ... });
        return Promise.resolve({ verified: true });
    }
}

// Main Application Class
class ExpenseApp {
    constructor() {
        this.authService = new AuthService();
        this.databaseService = new DatabaseService();
        this.paymentService = new PaymentService();
        
        this.currentUserData = null;
        this.currentGroupId = null;
        this.paymentStatuses = new Map(); // Track payment statuses
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupNavigation();
        this.checkAuthStatus();
    }

    checkAuthStatus() {
        // Check if user is already logged in (in real app, check session/token)
        if (this.authService.isLoggedIn()) {
            this.handleAuthSuccess();
        } else {
            this.showAuthSection();
        }
    }

    showAuthSection() {
        document.getElementById('authSection').style.display = 'flex';
        document.getElementById('mainApp').classList.add('hidden');
    }

    showMainApp() {
        document.getElementById('authSection').style.display = 'none';
        document.getElementById('mainApp').classList.remove('hidden');
    }

    handleAuthSuccess() {
        const user = this.authService.getCurrentUser();
        this.currentUserData = this.databaseService.getUserData(user.id);
        this.showMainApp();
        this.updateUserProfile();
        this.updateUI();
        this.showToast(`Welcome back, ${user.name}!`, 'success');
    }

    updateUserProfile() {
        const user = this.authService.getCurrentUser();
        if (user) {
            document.getElementById('userProfile').textContent = user.name;
            document.getElementById('userGreeting').textContent = `Welcome back, ${user.name}!`;
        }
    }

    setupEventListeners() {
        // Authentication listeners
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            this.handleLogin(e);
        });

        document.getElementById('registerForm').addEventListener('submit', (e) => {
            this.handleRegister(e);
        });

        document.getElementById('showRegister').addEventListener('click', (e) => {
            e.preventDefault();
            this.switchAuthPage('register');
        });

        document.getElementById('showLogin').addEventListener('click', (e) => {
            e.preventDefault();
            this.switchAuthPage('login');
        });

        document.getElementById('forgotPassword').addEventListener('click', (e) => {
            e.preventDefault();
            this.showToast('Demo: Password reset would be implemented here. Try email: demo@example.com, password: demo123', 'info');
        });

        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });

        // Google OAuth buttons
        document.getElementById('googleSignIn').addEventListener('click', () => {
            this.initiateGoogleAuth();
        });

        document.getElementById('googleSignUp').addEventListener('click', () => {
            this.initiateGoogleAuth();
        });

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Groups
        document.getElementById('createGroupBtn').addEventListener('click', () => {
            this.showCreateGroupModal();
        });

        document.getElementById('closeCreateGroupModal').addEventListener('click', () => {
            this.hideCreateGroupModal();
        });

        document.getElementById('cancelCreateGroup').addEventListener('click', () => {
            this.hideCreateGroupModal();
        });

        document.getElementById('createGroupForm').addEventListener('submit', (e) => {
            this.handleCreateGroup(e);
        });

        document.getElementById('addMemberBtn').addEventListener('click', () => {
            this.addMemberInput();
        });

        // Group details modal
        document.getElementById('closeGroupDetailsModal').addEventListener('click', () => {
            this.hideGroupDetailsModal();
        });

        // Add expense
        document.getElementById('addExpenseForm').addEventListener('submit', (e) => {
            this.handleAddExpense(e);
        });

        document.getElementById('expenseGroup').addEventListener('change', () => {
            this.updateParticipantsList();
        });

        // Real-time calculation
        ['expenseAmount', 'taxPercentage', 'tipPercentage'].forEach(id => {
            document.getElementById(id).addEventListener('input', () => {
                this.updateCalculation();
            });
        });

        // Chat
        document.getElementById('sendMessageBtn').addEventListener('click', () => {
            this.sendMessage();
        });

        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Settings
        document.getElementById('exportDataBtn').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('clearDataBtn').addEventListener('click', () => {
            this.clearAllData();
        });

        // Settings checkboxes
        document.getElementById('hidePersonalSpending').addEventListener('change', (e) => {
            this.currentUserData.settings.hidePersonalSpending = e.target.checked;
            this.saveUserData();
        });

        document.getElementById('shareContactInfo').addEventListener('change', (e) => {
            this.currentUserData.settings.shareContactInfo = e.target.checked;
            this.saveUserData();
        });
    }

    switchAuthPage(page) {
        document.querySelectorAll('.auth-page').forEach(p => p.classList.remove('active'));
        document.getElementById(`${page}Page`).classList.add('active');
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        if (!email || !password) {
            this.showToast('Please enter both email and password', 'error');
            return;
        }
        
        const loginBtn = e.target.querySelector('button[type="submit"]');
        const originalText = loginBtn.textContent;
        loginBtn.textContent = 'Logging in...';
        loginBtn.disabled = true;
        
        // Simulate network delay
        setTimeout(async () => {
            try {
                const result = await this.authService.login(email, password);
                
                if (result.success) {
                    this.handleAuthSuccess();
                } else {
                    this.showToast(result.error, 'error');
                }
            } catch (error) {
                this.showToast('Login failed. Please try again.', 'error');
            } finally {
                loginBtn.textContent = originalText;
                loginBtn.disabled = false;
            }
        }, 500);
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const userData = {
            name: document.getElementById('registerName').value,
            phone: document.getElementById('registerPhone').value,
            email: document.getElementById('registerEmail').value,
            password: document.getElementById('registerPassword').value
        };
        
        // Basic validation
        if (!userData.name || !userData.phone || !userData.email || !userData.password) {
            this.showToast('Please fill in all required fields', 'error');
            return;
        }
        
        if (userData.password.length < 6) {
            this.showToast('Password must be at least 6 characters long', 'error');
            return;
        }
        
        const agreeTerms = document.getElementById('agreeTerms').checked;
        if (!agreeTerms) {
            this.showToast('Please agree to the terms and conditions', 'error');
            return;
        }
        
        const registerBtn = e.target.querySelector('button[type="submit"]');
        const originalText = registerBtn.textContent;
        registerBtn.textContent = 'Creating Account...';
        registerBtn.disabled = true;
        
        // Simulate network delay
        setTimeout(async () => {
            try {
                const result = await this.authService.register(userData);
                
                if (result.success) {
                    this.handleAuthSuccess();
                } else {
                    this.showToast(result.error, 'error');
                }
            } catch (error) {
                this.showToast('Registration failed. Please try again.', 'error');
            } finally {
                registerBtn.textContent = originalText;
                registerBtn.disabled = false;
            }
        }, 500);
    }

    initiateGoogleAuth() {
        // SETUP REQUIRED: Initialize Google Sign-In
        if (window.google && window.google.accounts) {
            window.google.accounts.id.prompt();
        } else {
            this.showToast('Google authentication not configured - using demo login', 'warning');
            // For demo purposes, simulate Google login
            this.simulateGoogleAuth();
        }
    }

    simulateGoogleAuth() {
        // Simulate Google authentication for demo
        const mockGoogleUser = {
            name: 'Demo Google User',
            email: 'demo.google@example.com',
            phone: '+91-9876543210',
            password: 'google_demo'
        };
        
        this.authService.register(mockGoogleUser).then(() => {
            this.handleAuthSuccess();
        });
    }

    handleLogout() {
        this.authService.logout();
        this.currentUserData = null;
        this.showAuthSection();
        this.showToast('Logged out successfully', 'success');
        
        // Reset forms
        document.getElementById('loginForm').reset();
        document.getElementById('registerForm').reset();
        
        // Switch back to login page
        this.switchAuthPage('login');
    }

    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const tabId = item.dataset.tab;
                this.switchTab(tabId);
                
                // Update active nav item
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
            });
        });
    }

    switchTab(tabId) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Show selected tab
        document.getElementById(tabId).classList.add('active');
        
        // Update content based on tab
        if (tabId === 'groups-tab') {
            this.updateGroupsList();
        } else if (tabId === 'add-expense-tab') {
            this.updateExpenseForm();
        } else if (tabId === 'analytics-tab') {
            setTimeout(() => this.updateAnalytics(), 100); // Delay to ensure canvas is visible
        } else if (tabId === 'home-tab') {
            this.updateDashboard();
        }
    }

    updateDashboard() {
        if (!this.currentUserData) return;

        document.getElementById('totalGroups').textContent = this.currentUserData.groups.length;
        
        const totalSpent = this.currentUserData.expenses.reduce((sum, expense) => sum + expense.totalAmount, 0);
        document.getElementById('totalExpenses').textContent = `₹${totalSpent.toFixed(2)}`;
        
        const userBalance = this.calculateUserBalance(this.authService.getCurrentUser().id);
        document.getElementById('totalOwed').textContent = `₹${Math.abs(userBalance.owed).toFixed(2)}`;
        
        this.updateRecentActivity();
    }

    updateRecentActivity() {
        const activityList = document.getElementById('recentActivityList');
        const recentExpenses = this.currentUserData.expenses.slice(-5).reverse();
        
        if (recentExpenses.length === 0) {
            activityList.innerHTML = '<div class="empty-state">No recent activity</div>';
            return;
        }
        
        activityList.innerHTML = recentExpenses.map(expense => {
            const payer = this.getUserById(expense.payer);
            const group = this.getGroupById(expense.groupId);
            return `
                <div class="activity-item">
                    <div class="activity-description">
                        ${payer?.name || 'Someone'} paid ₹${expense.totalAmount.toFixed(2)} for "${expense.description}" in ${group?.name || 'Unknown Group'}
                    </div>
                    <div class="activity-time">${this.formatDate(expense.date)}</div>
                </div>
            `;
        }).join('');
    }

    showCreateGroupModal() {
        document.getElementById('createGroupModal').classList.remove('hidden');
    }

    hideCreateGroupModal() {
        document.getElementById('createGroupModal').classList.add('hidden');
        document.getElementById('createGroupForm').reset();
        this.resetMemberInputs();
    }

    hideGroupDetailsModal() {
        document.getElementById('groupDetailsModal').classList.add('hidden');
    }

    addMemberInput() {
        const container = document.getElementById('membersContainer');
        const memberDiv = document.createElement('div');
        memberDiv.className = 'member-input-group';
        memberDiv.innerHTML = `
            <input type="text" placeholder="Name" class="form-control member-name" required>
            <input type="tel" placeholder="Phone" class="form-control member-phone" required>
            <input type="email" placeholder="Email" class="form-control member-email" required>
            <button type="button" class="btn btn--outline btn--sm remove-member">Remove</button>
        `;
        
        memberDiv.querySelector('.remove-member').addEventListener('click', () => {
            memberDiv.remove();
        });
        
        container.appendChild(memberDiv);
    }

    resetMemberInputs() {
        const container = document.getElementById('membersContainer');
        container.innerHTML = `
            <div class="member-input-group">
                <input type="text" placeholder="Name" class="form-control member-name" required>
                <input type="tel" placeholder="Phone" class="form-control member-phone" required>
                <input type="email" placeholder="Email" class="form-control member-email" required>
            </div>
        `;
    }

    handleCreateGroup(e) {
        e.preventDefault();
        
        const name = document.getElementById('groupName').value;
        const description = document.getElementById('groupDescription').value;
        
        const memberInputs = document.querySelectorAll('.member-input-group');
        const members = [];
        
        memberInputs.forEach(input => {
            const memberName = input.querySelector('.member-name').value;
            const phone = input.querySelector('.member-phone').value;
            const email = input.querySelector('.member-email').value;
            
            if (memberName && phone && email) {
                members.push({
                    id: 'member_' + Date.now() + '_' + Math.random(),
                    name: memberName,
                    phone,
                    email
                });
            }
        });
        
        if (members.length === 0) {
            this.showToast('Please add at least one member', 'error');
            return;
        }
        
        // Add current user to members if not already included
        const currentUser = this.authService.getCurrentUser();
        if (currentUser && !members.some(m => m.email === currentUser.email)) {
            members.unshift({
                id: currentUser.id,
                name: currentUser.name,
                phone: currentUser.phone,
                email: currentUser.email
            });
        }
        
        const newGroup = {
            id: 'group_' + Date.now(),
            name,
            description,
            members,
            createdAt: new Date().toISOString()
        };
        
        this.currentUserData.groups.push(newGroup);
        this.saveUserData();
        this.hideCreateGroupModal();
        this.showToast('Group created successfully!', 'success');
        this.updateGroupsList();
    }

    updateGroupsList() {
        const groupsList = document.getElementById('groupsList');
        
        if (this.currentUserData.groups.length === 0) {
            groupsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">👥</div>
                    <p>No groups yet. Create your first group to start splitting expenses!</p>
                </div>
            `;
            return;
        }
        
        groupsList.innerHTML = this.currentUserData.groups.map(group => `
            <div class="group-card" onclick="app.showGroupDetails('${group.id}')">
                <h3>${group.name}</h3>
                <p>${group.description || 'No description'}</p>
                <div class="group-meta">
                    <span>${group.members.length} members</span>
                    <span>${this.formatDate(group.createdAt)}</span>
                </div>
            </div>
        `).join('');
    }

    showGroupDetails(groupId) {
        const group = this.getGroupById(groupId);
        if (!group) return;
        
        this.currentGroupId = groupId;
        
        document.getElementById('groupDetailsTitle').textContent = group.name;
        document.getElementById('groupDetailsDescription').textContent = group.description || 'No description';
        
        // Update members list
        const membersList = document.getElementById('groupMembersList');
        membersList.innerHTML = group.members.map(member => `
            <div class="member-item">
                <div class="member-info">
                    <div class="member-name">${member.name}</div>
                    <div class="member-contact">${member.phone} • ${member.email}</div>
                </div>
            </div>
        `).join('');
        
        // Update expenses list
        this.updateGroupExpensesList(groupId);
        
        // Update settlement summary
        this.updateSettlementSummary(groupId);
        
        // Update chat
        this.updateGroupChat(groupId);
        
        document.getElementById('groupDetailsModal').classList.remove('hidden');
    }

    updateGroupExpensesList(groupId) {
        const expensesList = document.getElementById('groupExpensesList');
        const groupExpenses = this.currentUserData.expenses.filter(e => e.groupId === groupId);
        
        if (groupExpenses.length === 0) {
            expensesList.innerHTML = '<div class="empty-state">No expenses yet</div>';
            return;
        }
        
        expensesList.innerHTML = groupExpenses.map(expense => {
            const payer = this.getUserById(expense.payer);
            return `
                <div class="expense-item">
                    <div class="expense-header">
                        <div class="expense-description">${expense.description}</div>
                        <div class="expense-amount">₹${expense.totalAmount.toFixed(2)}</div>
                    </div>
                    <div class="expense-meta">
                        Paid by ${payer?.name || 'Unknown'} • ${expense.category} • ${this.formatDate(expense.date)}
                        <br>Split between ${expense.participants.length} people
                    </div>
                </div>
            `;
        }).join('');
    }

    updateSettlementSummary(groupId) {
        const settlements = this.calculateSettlements(groupId);
        const settlementList = document.getElementById('settlementList');
        
        if (settlements.length === 0) {
            settlementList.innerHTML = '<div class="empty-state">All settled up! 🎉</div>';
            return;
        }
        
        settlementList.innerHTML = settlements.map(settlement => {
            const paymentStatus = this.paymentStatuses.get(settlement.id);
            const statusClass = paymentStatus ? `payment-status ${paymentStatus.status}` : '';
            
            return `
                <div class="settlement-item">
                    <div class="settlement-text">
                        ${settlement.from} owes ${settlement.to}
                    </div>
                    <div class="settlement-amount">₹${settlement.amount.toFixed(2)}</div>
                    ${paymentStatus && paymentStatus.status === 'paid' ? 
                        `<div class="payment-status paid">✓ Paid</div>` :
                        `<button class="pay-btn" onclick="app.initiatePayment('${settlement.id}', ${settlement.amount}, '${settlement.to}')">Pay Now</button>`
                    }
                </div>
            `;
        }).join('');
    }

    calculateSettlements(groupId) {
        const group = this.getGroupById(groupId);
        if (!group) return [];
        
        const balances = {};
        
        // Initialize balances
        group.members.forEach(member => {
            balances[member.id] = 0;
        });
        
        // Calculate balances from expenses
        const groupExpenses = this.currentUserData.expenses.filter(e => e.groupId === groupId);
        
        groupExpenses.forEach(expense => {
            const perPersonAmount = expense.totalAmount / expense.participants.length;
            
            // Payer gets credited
            balances[expense.payer] += expense.totalAmount;
            
            // Participants get debited
            expense.participants.forEach(participantId => {
                balances[participantId] -= perPersonAmount;
            });
        });
        
        // Create settlements
        const settlements = [];
        const debtors = [];
        const creditors = [];
        
        Object.entries(balances).forEach(([userId, balance]) => {
            const user = this.getUserById(userId);
            if (balance < -0.01) {
                debtors.push({ user, amount: Math.abs(balance) });
            } else if (balance > 0.01) {
                creditors.push({ user, amount: balance });
            }
        });
        
        // Simplify debts
        let i = 0, j = 0;
        while (i < debtors.length && j < creditors.length) {
            const debt = Math.min(debtors[i].amount, creditors[j].amount);
            
            settlements.push({
                id: `settlement_${groupId}_${i}_${j}`,
                from: debtors[i].user.name,
                to: creditors[j].user.name,
                amount: debt,
                fromId: debtors[i].user.id,
                toId: creditors[j].user.id
            });
            
            debtors[i].amount -= debt;
            creditors[j].amount -= debt;
            
            if (debtors[i].amount < 0.01) i++;
            if (creditors[j].amount < 0.01) j++;
        }
        
        return settlements;
    }

    async initiatePayment(settlementId, amount, recipientName) {
        const user = this.authService.getCurrentUser();
        
        const paymentData = {
            settlementId,
            amount,
            recipientName,
            userEmail: user.email
        };
        
        // Update UI to show payment in progress
        this.updatePaymentStatus(settlementId, 'pending');
        
        try {
            await this.paymentService.initiatePayment(paymentData);
        } catch (error) {
            console.error('Payment failed:', error);
            this.updatePaymentStatus(settlementId, 'failed');
            this.showToast('Payment failed. Please try again.', 'error');
        }
    }

    updatePaymentStatus(settlementId, status, paymentId = null) {
        this.paymentStatuses.set(settlementId, {
            status,
            paymentId,
            timestamp: new Date().toISOString()
        });
        
        // Update settlement summary if modal is open
        if (this.currentGroupId) {
            this.updateSettlementSummary(this.currentGroupId);
        }
        
        // In real app, you would also update the server
        this.saveUserData();
    }

    updateGroupChat(groupId) {
        const chatMessages = document.getElementById('chatMessages');
        const groupMessages = this.currentUserData.messages.filter(m => m.groupId === groupId);
        
        if (groupMessages.length === 0) {
            chatMessages.innerHTML = '<div class="empty-state">No messages yet. Start the conversation!</div>';
            return;
        }
        
        chatMessages.innerHTML = groupMessages.map(message => {
            const sender = this.getUserById(message.sender);
            return `
                <div class="chat-message">
                    <div class="message-sender">${sender?.name || 'Unknown'}</div>
                    <div class="message-text">${message.message}</div>
                    <div class="message-time">${this.formatTime(message.timestamp)}</div>
                </div>
            `;
        }).join('');
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message || !this.currentGroupId) return;
        
        const newMessage = {
            id: 'message_' + Date.now(),
            groupId: this.currentGroupId,
            sender: this.authService.getCurrentUser().id,
            message,
            timestamp: new Date().toISOString()
        };
        
        this.currentUserData.messages.push(newMessage);
        this.saveUserData();
        input.value = '';
        this.updateGroupChat(this.currentGroupId);
    }

    updateExpenseForm() {
        const groupSelect = document.getElementById('expenseGroup');
        groupSelect.innerHTML = '<option value="">Choose a group...</option>' +
            this.currentUserData.groups.map(group => `<option value="${group.id}">${group.name}</option>`).join('');
    }

    updateParticipantsList() {
        const groupId = document.getElementById('expenseGroup').value;
        const participantsList = document.getElementById('participantsList');
        const payerSelect = document.getElementById('expensePayer');
        
        if (!groupId) {
            participantsList.innerHTML = '';
            payerSelect.innerHTML = '<option value="">Select payer...</option>';
            return;
        }
        
        const group = this.getGroupById(groupId);
        if (!group) return;
        
        // Update payer dropdown
        payerSelect.innerHTML = '<option value="">Select payer...</option>' +
            group.members.map(member => `<option value="${member.id}">${member.name}</option>`).join('');
        
        // Update participants list
        participantsList.innerHTML = group.members.map(member => `
            <div class="participant-item">
                <input type="checkbox" id="participant_${member.id}" value="${member.id}" checked>
                <label for="participant_${member.id}">${member.name}</label>
            </div>
        `).join('');
    }

    updateCalculation() {
        const amount = parseFloat(document.getElementById('expenseAmount').value) || 0;
        const taxPercent = parseFloat(document.getElementById('taxPercentage').value) || 0;
        const tipPercent = parseFloat(document.getElementById('tipPercentage').value) || 0;
        
        const taxAmount = amount * (taxPercent / 100);
        const tipAmount = amount * (tipPercent / 100);
        const total = amount + taxAmount + tipAmount;
        
        document.getElementById('baseAmount').textContent = `₹${amount.toFixed(2)}`;
        document.getElementById('taxAmount').textContent = `₹${taxAmount.toFixed(2)}`;
        document.getElementById('tipAmount').textContent = `₹${tipAmount.toFixed(2)}`;
        document.getElementById('totalAmount').textContent = `₹${total.toFixed(2)}`;
    }

    handleAddExpense(e) {
        e.preventDefault();
        
        const groupId = document.getElementById('expenseGroup').value;
        const amount = parseFloat(document.getElementById('expenseAmount').value);
        const description = document.getElementById('expenseDescription').value;
        const category = document.getElementById('expenseCategory').value;
        const payer = document.getElementById('expensePayer').value;
        const taxPercent = parseFloat(document.getElementById('taxPercentage').value) || 0;
        const tipPercent = parseFloat(document.getElementById('tipPercentage').value) || 0;
        
        const participants = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
            .map(cb => cb.value);
        
        if (!groupId || !amount || !description || !category || !payer || participants.length === 0) {
            this.showToast('Please fill in all required fields', 'error');
            return;
        }
        
        const taxAmount = amount * (taxPercent / 100);
        const tipAmount = amount * (tipPercent / 100);
        const totalAmount = amount + taxAmount + tipAmount;
        
        const newExpense = {
            id: 'expense_' + Date.now(),
            groupId,
            amount,
            description,
            category,
            payer,
            participants,
            tax: taxAmount,
            tip: tipAmount,
            totalAmount,
            date: new Date().toISOString()
        };
        
        this.currentUserData.expenses.push(newExpense);
        this.saveUserData();
        this.showToast('Expense added successfully!', 'success');
        
        // Reset form
        document.getElementById('addExpenseForm').reset();
        this.updateCalculation();
        this.updateParticipantsList();
    }

    updateAnalytics() {
        // Ensure we have current user data
        if (!this.currentUserData) return;
        
        // Clear existing charts
        try {
            Chart.getChart('categoryChart')?.destroy();
            Chart.getChart('contributionsChart')?.destroy();
            Chart.getChart('trendsChart')?.destroy();
        } catch (e) {
            // Charts don't exist yet
        }
        
        this.updateCategoryChart();
        this.updateContributionsChart();
        this.updateTrendsChart();
    }

    updateCategoryChart() {
        const ctx = document.getElementById('categoryChart');
        if (!ctx) return;
        
        // Calculate spending by category
        const categoryData = {};
        this.currentUserData.expenses.forEach(expense => {
            categoryData[expense.category] = (categoryData[expense.category] || 0) + expense.totalAmount;
        });
        
        // If no data, show empty state
        if (Object.keys(categoryData).length === 0) {
            categoryData['No Data'] = 1;
        }
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(categoryData),
                datasets: [{
                    data: Object.values(categoryData),
                    backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    updateContributionsChart() {
        const ctx = document.getElementById('contributionsChart');
        if (!ctx) return;
        
        // Calculate contributions by user
        const contributionData = {};
        this.currentUserData.expenses.forEach(expense => {
            const payer = this.getUserById(expense.payer);
            if (payer) {
                contributionData[payer.name] = (contributionData[payer.name] || 0) + expense.totalAmount;
            }
        });
        
        // If no data, show empty state
        if (Object.keys(contributionData).length === 0) {
            contributionData['No Data'] = 0;
        }
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(contributionData),
                datasets: [{
                    label: 'Amount Paid (₹)',
                    data: Object.values(contributionData),
                    backgroundColor: '#1FB8CD'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    updateTrendsChart() {
        const ctx = document.getElementById('trendsChart');
        if (!ctx) return;
        
        // Calculate monthly trends
        const monthlyData = {};
        this.currentUserData.expenses.forEach(expense => {
            const month = expense.date.substring(0, 7); // YYYY-MM
            monthlyData[month] = (monthlyData[month] || 0) + expense.totalAmount;
        });
        
        // If no data, show current month with 0
        if (Object.keys(monthlyData).length === 0) {
            const currentMonth = new Date().toISOString().substring(0, 7);
            monthlyData[currentMonth] = 0;
        }
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: Object.keys(monthlyData),
                datasets: [{
                    label: 'Monthly Expenses (₹)',
                    data: Object.values(monthlyData),
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.1)',
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    exportData() {
        const csvContent = this.convertToCSV(this.currentUserData.expenses);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'expenses.csv';
        a.click();
        window.URL.revokeObjectURL(url);
        
        this.showToast('Data exported successfully!', 'success');
    }

    convertToCSV(expenses) {
        const headers = ['Date', 'Description', 'Category', 'Amount (₹)', 'Payer', 'Group'];
        const rows = expenses.map(expense => {
            const payer = this.getUserById(expense.payer);
            const group = this.getGroupById(expense.groupId);
            return [
                expense.date,
                expense.description,
                expense.category,
                expense.totalAmount,
                payer?.name || 'Unknown',
                group?.name || 'Unknown'
            ];
        });
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    clearAllData() {
        if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
            this.currentUserData = {
                groups: [],
                expenses: [],
                messages: [],
                settings: {
                    hidePersonalSpending: false,
                    shareContactInfo: true,
                    theme: 'light'
                }
            };
            
            this.paymentStatuses.clear();
            this.saveUserData();
            this.showToast('All data cleared', 'success');
            this.updateUI();
        }
    }

    toggleTheme() {
        const body = document.body;
        const themeToggle = document.getElementById('themeToggle');
        
        if (body.dataset.colorScheme === 'dark') {
            body.dataset.colorScheme = 'light';
            themeToggle.textContent = '🌙';
            if (this.currentUserData) {
                this.currentUserData.settings.theme = 'light';
            }
        } else {
            body.dataset.colorScheme = 'dark';
            themeToggle.textContent = '☀️';
            if (this.currentUserData) {
                this.currentUserData.settings.theme = 'dark';
            }
        }
        
        this.saveUserData();
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.remove('hidden');
        
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 4000);
    }

    // Utility methods
    getUserById(id) {
        // Check all group members
        for (const group of this.currentUserData.groups) {
            const member = group.members.find(m => m.id === id);
            if (member) return member;
        }
        
        // Check current user
        const currentUser = this.authService.getCurrentUser();
        if (currentUser && currentUser.id === id) {
            return currentUser;
        }
        
        return null;
    }

    getGroupById(id) {
        return this.currentUserData.groups.find(group => group.id === id);
    }

    calculateUserBalance(userId) {
        let paid = 0;
        let owed = 0;
        
        this.currentUserData.expenses.forEach(expense => {
            if (expense.payer === userId) {
                paid += expense.totalAmount;
            }
            
            if (expense.participants.includes(userId)) {
                owed += expense.totalAmount / expense.participants.length;
            }
        });
        
        return { paid, owed: owed - paid };
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-IN');
    }

    formatTime(dateString) {
        return new Date(dateString).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    }

    saveUserData() {
        if (this.authService.getCurrentUser() && this.currentUserData) {
            this.databaseService.saveUserData(this.authService.getCurrentUser().id, this.currentUserData);
        }
    }

    updateUI() {
        if (!this.authService.isLoggedIn() || !this.currentUserData) return;
        
        this.updateDashboard();
        this.updateGroupsList();
        this.updateExpenseForm();
        
        // Set theme
        if (this.currentUserData.settings.theme === 'dark') {
            document.body.dataset.colorScheme = 'dark';
            document.getElementById('themeToggle').textContent = '☀️';
        }
        
        // Set settings checkboxes
        document.getElementById('hidePersonalSpending').checked = this.currentUserData.settings.hidePersonalSpending;
        document.getElementById('shareContactInfo').checked = this.currentUserData.settings.shareContactInfo;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ExpenseApp();
});

/* 
=== SETUP INSTRUCTIONS ===

To connect this app to real services, you need to make the following changes:

1. GOOGLE OAUTH SETUP:
   - Get a Google OAuth Client ID from Google Cloud Console
   - Replace "YOUR_GOOGLE_CLIENT_ID_HERE" in AuthService.initGoogleAuth()
   - Configure authorized domains in Google Cloud Console

2. RAZORPAY SETUP:
   - Sign up for Razorpay account at https://razorpay.com
   - Get your API keys from Razorpay Dashboard
   - Replace "rzp_test_YOUR_KEY_HERE" in PaymentService constructor
   - Implement server-side order creation and payment verification

3. DATABASE SETUP:
   - Replace DatabaseService with real API calls
   - Implement user authentication backend
   - Set up database tables: users, groups, expenses, messages, user_settings
   - Add proper data validation and security

4. BACKEND API ENDPOINTS NEEDED:
   - POST /api/auth/login
   - POST /api/auth/register
   - POST /api/auth/google
   - GET /api/user/data
   - POST /api/user/data
   - POST /api/payments/create-order
   - POST /api/payments/verify

5. ENVIRONMENT VARIABLES:
   - GOOGLE_CLIENT_ID
   - RAZORPAY_KEY_ID
   - RAZORPAY_KEY_SECRET
   - DATABASE_URL
   - JWT_SECRET

6. SECURITY CONSIDERATIONS:
   - Implement proper password hashing (bcrypt)
   - Use JWT tokens for session management
   - Add input validation and sanitization
   - Implement rate limiting
   - Use HTTPS in production
   - Add CORS configuration

7. REAL-TIME FEATURES (OPTIONAL):
   - WebSocket connection for real-time chat
   - Push notifications for new expenses
   - Real-time payment status updates

This demo shows the complete user flow and UI. Replace the mock services with real implementations.

=== DEMO LOGIN CREDENTIALS ===
Email: demo@example.com
Password: demo123

OR

Email: john@example.com
Password: password123
*/