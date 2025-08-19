// App State Management
class ExpenseApp {
    constructor() {
        this.currentUser = null;
        this.groups = [];
        this.expenses = [];
        this.messages = [];
        this.settings = {
            hidePersonalSpending: false,
            shareContactInfo: true,
            theme: 'light'
        };
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.setupNavigation();
        this.updateUI();
        this.loadSampleData();
    }

    loadData() {
        // Load from localStorage - but since we can't use it, we'll use sample data
        this.loadSampleData();
    }

    loadSampleData() {
        // Sample data for demonstration
        this.sampleUsers = [
            {"id": "u1", "name": "John Doe", "phone": "+1234567890", "email": "john@example.com"},
            {"id": "u2", "name": "Jane Smith", "phone": "+1234567891", "email": "jane@example.com"},
            {"id": "u3", "name": "Mike Johnson", "phone": "+1234567892", "email": "mike@example.com"}
        ];

        this.groups = [
            {
                "id": "g1", 
                "name": "Weekend Trip", 
                "description": "Beach vacation with friends",
                "members": this.sampleUsers,
                "createdAt": "2025-08-15"
            }
        ];

        this.expenses = [
            {
                "id": "e1",
                "groupId": "g1",
                "amount": 120,
                "description": "Dinner at restaurant",
                "category": "Food",
                "payer": "u1",
                "participants": ["u1", "u2", "u3"],
                "tax": 12,
                "tip": 18,
                "totalAmount": 150,
                "date": "2025-08-15"
            },
            {
                "id": "e2",
                "groupId": "g1",
                "amount": 60,
                "description": "Uber ride",
                "category": "Transport",
                "payer": "u2",
                "participants": ["u1", "u2", "u3"],
                "tax": 0,
                "tip": 0,
                "totalAmount": 60,
                "date": "2025-08-15"
            }
        ];

        this.messages = [
            {
                "id": "m1",
                "groupId": "g1",
                "sender": "u1",
                "message": "Hey everyone! Just added the dinner expense.",
                "timestamp": "2025-08-15T19:30:00Z"
            },
            {
                "id": "m2",
                "groupId": "g1",
                "sender": "u2",
                "message": "Thanks! I'll add the Uber ride cost too.",
                "timestamp": "2025-08-15T20:15:00Z"
            }
        ];
    }

    saveData() {
        // In a real app, this would save to localStorage
        // For demo purposes, we'll just log
        console.log('Data saved:', {
            user: this.currentUser,
            groups: this.groups,
            expenses: this.expenses,
            messages: this.messages,
            settings: this.settings
        });
    }

    setupEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Registration
        document.getElementById('getStartedBtn').addEventListener('click', () => {
            this.showRegistration();
        });

        document.getElementById('registrationForm').addEventListener('submit', (e) => {
            this.handleRegistration(e);
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
            this.settings.hidePersonalSpending = e.target.checked;
            this.saveData();
        });

        document.getElementById('shareContactInfo').addEventListener('change', (e) => {
            this.settings.shareContactInfo = e.target.checked;
            this.saveData();
        });
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
            this.updateAnalytics();
        } else if (tabId === 'home-tab') {
            this.updateDashboard();
        }
    }

    showRegistration() {
        document.getElementById('welcomeSection').classList.add('hidden');
        document.getElementById('registrationSection').classList.remove('hidden');
    }

    handleRegistration(e) {
        e.preventDefault();
        
        const name = document.getElementById('userName').value;
        const phone = document.getElementById('userPhone').value;
        const email = document.getElementById('userEmail').value;
        
        this.currentUser = {
            id: 'user_' + Date.now(),
            name,
            phone,
            email,
            createdAt: new Date().toISOString()
        };
        
        this.saveData();
        this.showToast('Profile created successfully!', 'success');
        this.showDashboard();
    }

    showDashboard() {
        document.getElementById('registrationSection').classList.add('hidden');
        document.getElementById('dashboardSection').classList.remove('hidden');
        this.updateDashboard();
    }

    updateDashboard() {
        if (!this.currentUser) {
            // Show welcome section if no user
            document.getElementById('welcomeSection').classList.remove('hidden');
            document.getElementById('dashboardSection').classList.add('hidden');
            return;
        }

        document.getElementById('userGreeting').textContent = `Welcome back, ${this.currentUser.name}!`;
        document.getElementById('totalGroups').textContent = this.groups.length;
        
        const totalSpent = this.expenses.reduce((sum, expense) => sum + expense.totalAmount, 0);
        document.getElementById('totalExpenses').textContent = `$${totalSpent.toFixed(2)}`;
        
        const userExpenses = this.calculateUserBalance(this.currentUser.id);
        document.getElementById('totalOwed').textContent = `$${Math.abs(userExpenses.owed).toFixed(2)}`;
        
        this.updateRecentActivity();
    }

    updateRecentActivity() {
        const activityList = document.getElementById('recentActivityList');
        const recentExpenses = this.expenses.slice(-5).reverse();
        
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
                        ${payer?.name || 'Someone'} paid $${expense.totalAmount.toFixed(2)} for "${expense.description}" in ${group?.name || 'Unknown Group'}
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
            const name = input.querySelector('.member-name').value;
            const phone = input.querySelector('.member-phone').value;
            const email = input.querySelector('.member-email').value;
            
            if (name && phone && email) {
                members.push({
                    id: 'member_' + Date.now() + '_' + Math.random(),
                    name,
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
        if (this.currentUser && !members.some(m => m.email === this.currentUser.email)) {
            members.unshift(this.currentUser);
        }
        
        const newGroup = {
            id: 'group_' + Date.now(),
            name,
            description,
            members,
            createdAt: new Date().toISOString()
        };
        
        this.groups.push(newGroup);
        this.saveData();
        this.hideCreateGroupModal();
        this.showToast('Group created successfully!', 'success');
        this.updateGroupsList();
    }

    updateGroupsList() {
        const groupsList = document.getElementById('groupsList');
        
        if (this.groups.length === 0) {
            groupsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">👥</div>
                    <p>No groups yet. Create your first group to start splitting expenses!</p>
                </div>
            `;
            return;
        }
        
        groupsList.innerHTML = this.groups.map(group => `
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
        const groupExpenses = this.expenses.filter(e => e.groupId === groupId);
        
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
                        <div class="expense-amount">$${expense.totalAmount.toFixed(2)}</div>
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
        
        settlementList.innerHTML = settlements.map(settlement => `
            <div class="settlement-item">
                <div class="settlement-text">
                    ${settlement.from} owes ${settlement.to}
                </div>
                <div class="settlement-amount">$${settlement.amount.toFixed(2)}</div>
                <button class="pay-btn" onclick="app.markAsPaid('${settlement.id}')">Pay</button>
            </div>
        `).join('');
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
        const groupExpenses = this.expenses.filter(e => e.groupId === groupId);
        
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
                id: `settlement_${i}_${j}`,
                from: debtors[i].user.name,
                to: creditors[j].user.name,
                amount: debt
            });
            
            debtors[i].amount -= debt;
            creditors[j].amount -= debt;
            
            if (debtors[i].amount < 0.01) i++;
            if (creditors[j].amount < 0.01) j++;
        }
        
        return settlements;
    }

    markAsPaid(settlementId) {
        this.showToast('Payment marked as completed!', 'success');
        // In a real app, this would update the database
    }

    updateGroupChat(groupId) {
        const chatMessages = document.getElementById('chatMessages');
        const groupMessages = this.messages.filter(m => m.groupId === groupId);
        
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
        
        if (!message) return;
        
        // Get current group from modal
        const groupId = this.getCurrentGroupId();
        if (!groupId) return;
        
        const newMessage = {
            id: 'message_' + Date.now(),
            groupId,
            sender: this.currentUser?.id || 'u1', // Default to first user for demo
            message,
            timestamp: new Date().toISOString()
        };
        
        this.messages.push(newMessage);
        this.saveData();
        input.value = '';
        this.updateGroupChat(groupId);
    }

    getCurrentGroupId() {
        // This is a simplified way to get the current group ID
        // In a real app, you'd track this more systematically
        return this.groups.length > 0 ? this.groups[0].id : null;
    }

    updateExpenseForm() {
        const groupSelect = document.getElementById('expenseGroup');
        groupSelect.innerHTML = '<option value="">Choose a group...</option>' +
            this.groups.map(group => `<option value="${group.id}">${group.name}</option>`).join('');
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
        
        document.getElementById('baseAmount').textContent = `$${amount.toFixed(2)}`;
        document.getElementById('taxAmount').textContent = `$${taxAmount.toFixed(2)}`;
        document.getElementById('tipAmount').textContent = `$${tipAmount.toFixed(2)}`;
        document.getElementById('totalAmount').textContent = `$${total.toFixed(2)}`;
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
        
        this.expenses.push(newExpense);
        this.saveData();
        this.showToast('Expense added successfully!', 'success');
        
        // Reset form
        document.getElementById('addExpenseForm').reset();
        this.updateCalculation();
        this.updateParticipantsList();
    }

    updateAnalytics() {
        this.updateCategoryChart();
        this.updateContributionsChart();
        this.updateTrendsChart();
    }

    updateCategoryChart() {
        const ctx = document.getElementById('categoryChart').getContext('2d');
        
        // Calculate spending by category
        const categoryData = {};
        this.expenses.forEach(expense => {
            categoryData[expense.category] = (categoryData[expense.category] || 0) + expense.totalAmount;
        });
        
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
                maintainAspectRatio: false
            }
        });
    }

    updateContributionsChart() {
        const ctx = document.getElementById('contributionsChart').getContext('2d');
        
        // Calculate contributions by user
        const contributionData = {};
        this.expenses.forEach(expense => {
            const payer = this.getUserById(expense.payer);
            if (payer) {
                contributionData[payer.name] = (contributionData[payer.name] || 0) + expense.totalAmount;
            }
        });
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(contributionData),
                datasets: [{
                    label: 'Amount Paid',
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
        const ctx = document.getElementById('trendsChart').getContext('2d');
        
        // Calculate monthly trends
        const monthlyData = {};
        this.expenses.forEach(expense => {
            const month = expense.date.substring(0, 7); // YYYY-MM
            monthlyData[month] = (monthlyData[month] || 0) + expense.totalAmount;
        });
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: Object.keys(monthlyData),
                datasets: [{
                    label: 'Monthly Expenses',
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
        const data = {
            user: this.currentUser,
            groups: this.groups,
            expenses: this.expenses,
            messages: this.messages,
            settings: this.settings
        };
        
        const csvContent = this.convertToCSV(this.expenses);
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
        const headers = ['Date', 'Description', 'Category', 'Amount', 'Payer', 'Group'];
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
            this.currentUser = null;
            this.groups = [];
            this.expenses = [];
            this.messages = [];
            this.settings = {
                hidePersonalSpending: false,
                shareContactInfo: true,
                theme: 'light'
            };
            
            this.saveData();
            this.showToast('All data cleared', 'success');
            this.updateUI();
            
            // Reset to welcome screen
            document.getElementById('dashboardSection').classList.add('hidden');
            document.getElementById('welcomeSection').classList.remove('hidden');
        }
    }

    toggleTheme() {
        const body = document.body;
        const themeToggle = document.getElementById('themeToggle');
        
        if (body.dataset.colorScheme === 'dark') {
            body.dataset.colorScheme = 'light';
            themeToggle.textContent = '🌙';
            this.settings.theme = 'light';
        } else {
            body.dataset.colorScheme = 'dark';
            themeToggle.textContent = '☀️';
            this.settings.theme = 'dark';
        }
        
        this.saveData();
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.remove('hidden');
        
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }

    // Utility methods
    getUserById(id) {
        const allUsers = [...this.sampleUsers];
        if (this.currentUser) allUsers.push(this.currentUser);
        
        // Also check group members
        this.groups.forEach(group => {
            allUsers.push(...group.members);
        });
        
        return allUsers.find(user => user.id === id);
    }

    getGroupById(id) {
        return this.groups.find(group => group.id === id);
    }

    calculateUserBalance(userId) {
        let paid = 0;
        let owed = 0;
        
        this.expenses.forEach(expense => {
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
        return new Date(dateString).toLocaleDateString();
    }

    formatTime(dateString) {
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    updateUI() {
        if (this.currentUser) {
            this.showDashboard();
        }
        this.updateDashboard();
        this.updateGroupsList();
        this.updateExpenseForm();
        
        // Set theme
        if (this.settings.theme === 'dark') {
            document.body.dataset.colorScheme = 'dark';
            document.getElementById('themeToggle').textContent = '☀️';
        }
        
        // Set settings checkboxes
        document.getElementById('hidePersonalSpending').checked = this.settings.hidePersonalSpending;
        document.getElementById('shareContactInfo').checked = this.settings.shareContactInfo;
    }
}

// Initialize the app
const app = new ExpenseApp();