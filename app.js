class HabitTracker {
    constructor() {
        this.habits = [
            'treino', 'jogos', 'redes', 'pornografia', 
            'oracao', 'leitura', 'jejum', 'agua', 'sono'
        ];
        
        this.habitNames = {
            'treino': 'Treino',
            'jogos': 'Sem Jogos',
            'redes': 'Sem Redes',
            'pornografia': 'Pureza',
            'oracao': 'Oração',
            'leitura': 'Leitura',
            'jejum': 'Jejum',
            'agua': 'Água',
            'sono': 'Sono'
        };

        this.init();
    }

    init() {
        this.checkNewDay();
        this.loadProgress();
        this.updateDisplay();
        this.bindEvents();
    }

    // ✅ NOVA FUNÇÃO: Verifica se é um novo dia
    checkNewDay() {
        const today = this.getTodayString();
        const lastSaveDate = localStorage.getItem('lastSaveDate');
        
        if (lastSaveDate && lastSaveDate !== today) {
            // É um novo dia! Resetar checkboxes
            this.resetDailyProgress();
        }
    }

    // ✅ NOVA FUNÇÃO: Reset diário
    resetDailyProgress() {
        // Limpar checkboxes
        this.habits.forEach(habit => {
            const checkbox = document.getElementById(habit);
            if (checkbox) {
                checkbox.checked = false;
                checkbox.parentElement.classList.remove('completed');
            }
        });

        // Limpar diário
        const diaryText = document.getElementById('diaryText');
        if (diaryText) {
            diaryText.value = '';
        }

        // Atualizar progresso visual
        this.updateProgress();
    }

    // ✅ FUNÇÃO MELHORADA: Data de hoje
    getTodayString() {
        const today = new Date();
        return today.toDateString(); // Ex: "Mon Sep 01 2025"
    }

    loadProgress() {
        // Carregar dados salvos
        const savedData = localStorage.getItem('habitData');
        if (savedData) {
            this.data = JSON.parse(savedData);
        } else {
            this.data = {
                startDate: new Date().toDateString(),
                dailyProgress: {},
                totalStats: {
                    completedDays: 0,
                    currentStreak: 0,
                    bestStreak: 0,
                    habitStats: {}
                }
            };
        }

        // Carregar estado dos checkboxes APENAS se for o mesmo dia
        const today = this.getTodayString();
        const lastSaveDate = localStorage.getItem('lastSaveDate');
        
        if (lastSaveDate === today) {
            // Mesmo dia - carregar estado salvo
            this.habits.forEach(habit => {
                const saved = localStorage.getItem(`habit_${habit}`);
                const checkbox = document.getElementById(habit);
                if (checkbox && saved === 'true') {
                    checkbox.checked = true;
                    checkbox.parentElement.classList.add('completed');
                }
            });

            // Carregar diário
            const savedDiary = localStorage.getItem('diary_today');
            const diaryText = document.getElementById('diaryText');
            if (diaryText && savedDiary) {
                diaryText.value = savedDiary;
            }
        }
    }

    bindEvents() {
        // Event listeners para checkboxes
        this.habits.forEach(habit => {
            const checkbox = document.getElementById(habit);
            if (checkbox) {
                checkbox.addEventListener('change', () => {
                    this.toggleHabit(habit);
                });
            }
        });

        // Event listener para botão salvar
        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveProgress();
            });
        }

        // Auto-save do diário
        const diaryText = document.getElementById('diaryText');
        if (diaryText) {
            diaryText.addEventListener('input', () => {
                localStorage.setItem('diary_today', diaryText.value);
            });
        }
    }

    toggleHabit(habitId) {
        const checkbox = document.getElementById(habitId);
        const habitElement = checkbox.parentElement;
        
        if (checkbox.checked) {
            habitElement.classList.add('completed');
        } else {
            habitElement.classList.remove('completed');
        }

        // Salvar estado imediatamente
        localStorage.setItem(`habit_${habitId}`, checkbox.checked);
        
        this.updateProgress();
    }

    updateProgress() {
        const completed = this.habits.filter(habit => {
            const checkbox = document.getElementById(habit);
            return checkbox && checkbox.checked;
        }).length;

        const total = this.habits.length;
        const percentage = Math.round((completed / total) * 100);

        // Atualizar barra de progresso
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
        
        if (progressText) {
            progressText.textContent = `${completed} de ${total} hábitos concluídos`;
        }
    }

    saveProgress() {
        const today = this.getTodayString();
        const completed = this.habits.filter(habit => {
            const checkbox = document.getElementById(habit);
            return checkbox && checkbox.checked;
        }).length;

        const total = this.habits.length;
        const percentage = Math.round((completed / total) * 100);

        // Salvar progresso do dia
        this.data.dailyProgress[today] = {
            completed,
            total,
            percentage,
            habits: {}
        };

        // Salvar estado individual dos hábitos
        this.habits.forEach(habit => {
            const checkbox = document.getElementById(habit);
            this.data.dailyProgress[today].habits[habit] = checkbox ? checkbox.checked : false;
        });

        // Salvar diário
        const diaryText = document.getElementById('diaryText');
        if (diaryText) {
            this.data.dailyProgress[today].diary = diaryText.value;
        }

        // Atualizar estatísticas
        this.updateStats();

        // Salvar no localStorage
        localStorage.setItem('habitData', JSON.stringify(this.data));
        localStorage.setItem('lastSaveDate', today);

        // Feedback visual
        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn) {
            saveBtn.textContent = '✅ Salvo!';
            saveBtn.classList.add('success');
            
            setTimeout(() => {
                saveBtn.textContent = '💾 Salvar Progresso';
                saveBtn.classList.remove('success');
            }, 2000);
        }

        this.updateDisplay();
    }

    updateStats() {
        const days = Object.keys(this.data.dailyProgress);
        const completedDays = days.filter(day => 
            this.data.dailyProgress[day].percentage === 100
        ).length;

        // Calcular sequência atual
        let currentStreak = 0;
        const sortedDays = days.sort((a, b) => new Date(b) - new Date(a));
        
        for (let day of sortedDays) {
            if (this.data.dailyProgress[day].percentage === 100) {
                currentStreak++;
            } else {
                break;
            }
        }

        // Estatísticas dos hábitos
        const habitStats = {};
        this.habits.forEach(habit => {
            const completedCount = days.filter(day => 
                this.data.dailyProgress[day].habits[habit]
            ).length;
            habitStats[habit] = Math.round((completedCount / days.length) * 100) || 0;
        });

        // Encontrar melhor hábito
        const bestHabit = Object.keys(habitStats).reduce((a, b) => 
            habitStats[a] > habitStats[b] ? a : b
        );

        this.data.totalStats = {
            completedDays,
            currentStreak,
            habitStats,
            bestHabit: this.habitNames[bestHabit] || '-'
        };
    }

    updateDisplay() {
        // Atualizar dia atual
        const startDate = new Date(this.data.startDate);
        const today = new Date();
        const daysDiff = Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;
        const currentDay = Math.min(daysDiff, 30);
        
        const currentDayElement = document.getElementById('currentDay');
        if (currentDayElement) {
            currentDayElement.textContent = currentDay;
        }

        // Atualizar estatísticas
        const stats = this.data.totalStats;
        const days = Object.keys(this.data.dailyProgress);
        
        document.getElementById('totalDays').textContent = stats.completedDays || 0;
        document.getElementById('streak').textContent = stats.currentStreak || 0;
        
        // Média geral
        const avgProgress = days.length > 0 ? 
            Math.round(days.reduce((sum, day) => sum + this.data.dailyProgress[day].percentage, 0) / days.length) : 0;
        document.getElementById('avgProgress').textContent = `${avgProgress}%`;
        
        document.getElementById('bestHabit').textContent = stats.bestHabit || '-';

        // Atualizar progresso atual
        this.updateProgress();
    }
}

// Inicializar app
document.addEventListener('DOMContentLoaded', () => {
    new HabitTracker();
});
