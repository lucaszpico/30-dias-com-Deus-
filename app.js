class HabitTracker {
    constructor() {
        this.habits = ['treino', 'jogos', 'redes', 'pornografia', 'oracao', 'leitura', 'jejum', 'agua', 'sono'];
        this.data = this.loadData();
        this.init();
    }

    loadData() {
        const stored = localStorage.getItem('30diasComDeus');
        return stored ? JSON.parse(stored) : {
            startDate: new Date().toISOString().split('T')[0],
            days: {}
        };
    }

    saveData() {
        localStorage.setItem('30diasComDeus', JSON.stringify(this.data));
    }

    getCurrentDay() {
        const start = new Date(this.data.startDate);
        const today = new Date();
        const diffTime = Math.abs(today - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.min(diffDays, 30);
    }

    getTodayKey() {
        return new Date().toISOString().split('T')[0];
    }

    init() {
        document.getElementById('currentDay').textContent = this.getCurrentDay();
        this.loadTodayData();
        this.setupEventListeners();
        this.updateProgress();
        this.updateStats();
    }

    setupEventListeners() {
        // Event listeners para checkboxes
        this.habits.forEach(habit => {
            const checkbox = document.getElementById(habit);
            const habitDiv = document.querySelector(`[data-habit="${habit}"]`);
            
            checkbox.addEventListener('change', () => {
                this.updateProgress();
                this.autoSave();
            });

            // Permitir clicar na div inteira
            habitDiv.addEventListener('click', (e) => {
                if (e.target !== checkbox) {
                    checkbox.checked = !checkbox.checked;
                    this.updateProgress();
                    this.autoSave();
                }
            });
        });

        // Event listener para botão de salvar
        const saveBtn = document.getElementById('saveBtn');
        saveBtn.addEventListener('click', () => this.saveProgress());
        saveBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.saveProgress();
        });

        // Auto-save do diário
        document.getElementById('diaryText').addEventListener('input', () => {
            clearTimeout(this.diaryTimeout);
            this.diaryTimeout = setTimeout(() => this.autoSave(), 2000);
        });
    }

    loadTodayData() {
        const today = this.getTodayKey();
        const todayData = this.data.days[today];

        if (todayData) {
            this.habits.forEach((habit, index) => {
                document.getElementById(habit).checked = todayData.habits[index] || false;
            });
            document.getElementById('diaryText').value = todayData.diary || '';
        }
    }

    updateProgress() {
        const completed = this.habits.filter(habit => 
            document.getElementById(habit).checked
        ).length;

        const percentage = (completed / this.habits.length) * 100;

        document.getElementById('progressFill').style.width = percentage + '%';
        document.getElementById('progressText').textContent = 
            `${completed} de ${this.habits.length} hábitos concluídos`;

        // Atualizar visual dos hábitos
        this.habits.forEach(habit => {
            const checkbox = document.getElementById(habit);
            const habitDiv = document.querySelector(`[data-habit="${habit}"]`);
            
            if (checkbox.checked) {
                habitDiv.classList.add('completed');
            } else {
                habitDiv.classList.remove('completed');
            }
        });
    }

    updateStats() {
        const days = Object.values(this.data.days);
        const totalDays = days.length;
        
        if (totalDays === 0) {
            document.getElementById('totalDays').textContent = '0';
            document.getElementById('streak').textContent = '0';
            document.getElementById('avgProgress').textContent = '0%';
            document.getElementById('bestHabit').textContent = '-';
            return;
        }

        // Dias completos
        const completeDays = days.filter(day => 
            day.habits.filter(h => h).length === this.habits.length
        ).length;

        // Sequência atual
        let currentStreak = 0;
        const sortedDays = Object.keys(this.data.days).sort().reverse();
        
        for (const day of sortedDays) {
            const dayData = this.data.days[day];
            const completed = dayData.habits.filter(h => h).length;
            if (completed === this.habits.length) {
                currentStreak++;
            } else {
                break;
            }
        }

        // Média de progresso
        const totalProgress = days.reduce((sum, day) => {
            return sum + (day.habits.filter(h => h).length / this.habits.length);
        }, 0);
        const avgProgress = Math.round((totalProgress / totalDays) * 100);

        // Melhor hábito
        const habitCounts = {};
        this.habits.forEach(habit => habitCounts[habit] = 0);
        
        days.forEach(day => {
            day.habits.forEach((completed, index) => {
                if (completed) habitCounts[this.habits[index]]++;
            });
        });

        const bestHabitKey = Object.keys(habitCounts).reduce((a, b) => 
            habitCounts[a] > habitCounts[b] ? a : b
        );

        const habitLabels = {
            'treino': 'Treino',
            'jogos': 'Jogos',
            'redes': 'Redes',
            'pornografia': 'Pureza',
            'oracao': 'Oração',
            'leitura': 'Leitura',
            'jejum': 'Jejum',
            'agua': 'Água',
            'sono': 'Sono'
        };

        // Atualizar interface
        document.getElementById('totalDays').textContent = completeDays;
        document.getElementById('streak').textContent = currentStreak;
        document.getElementById('avgProgress').textContent = avgProgress + '%';
        document.getElementById('bestHabit').textContent = habitLabels[bestHabitKey];
    }

    autoSave() {
        const today = this.getTodayKey();
        const habitStates = this.habits.map(habit => 
            document.getElementById(habit).checked
        );
        const diary = document.getElementById('diaryText').value;

        this.data.days[today] = {
            habits: habitStates,
            diary: diary,
            timestamp: new Date().toISOString()
        };

        this.saveData();
        this.updateStats();
    }

    saveProgress() {
        this.autoSave();
        
        const btn = document.getElementById('saveBtn');
        const originalText = btn.textContent;
        
        btn.textContent = '✅ Salvo!';
        btn.classList.add('success');
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove('success');
        }, 2000);
    }
}

// Inicializar app
document.addEventListener('DOMContentLoaded', () => {
    new HabitTracker();
});
