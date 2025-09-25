// Sleep Quality Assessment Quiz JavaScript

class SleepQuiz {
    constructor() {
        this.currentQuestion = 1;
        this.totalQuestions = 6;
        this.answers = {};
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateProgress();
        this.showQuestion(1);
    }

    setupEventListeners() {
        const nextBtn = document.getElementById('nextBtn');
        const prevBtn = document.getElementById('prevBtn');
        const submitBtn = document.getElementById('submitBtn');

        nextBtn.addEventListener('click', () => this.nextQuestion());
        prevBtn.addEventListener('click', () => this.prevQuestion());
        submitBtn.addEventListener('click', () => this.submitQuiz());

        // Auto-advance when option is selected
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', () => {
                setTimeout(() => {
                    if (this.currentQuestion < this.totalQuestions) {
                        this.nextQuestion();
                    } else {
                        this.showSubmitButton();
                    }
                }, 500);
            });
        });
    }

    showQuestion(questionNum) {
        // Hide all questions
        document.querySelectorAll('.quiz-question').forEach(q => {
            q.classList.remove('active');
        });

        // Show current question
        const currentQ = document.querySelector(`[data-question="${questionNum}"]`);
        if (currentQ) {
            currentQ.classList.add('active');
        }

        this.updateProgress();
        this.updateNavigation();
    }

    nextQuestion() {
        if (this.currentQuestion < this.totalQuestions) {
            this.saveCurrentAnswer();
            this.currentQuestion++;
            this.showQuestion(this.currentQuestion);
        }
    }

    prevQuestion() {
        if (this.currentQuestion > 1) {
            this.currentQuestion--;
            this.showQuestion(this.currentQuestion);
        }
    }

    saveCurrentAnswer() {
        const currentQ = document.querySelector(`[data-question="${this.currentQuestion}"]`);
        const selectedOption = currentQ.querySelector('input[type="radio"]:checked');
        
        if (selectedOption) {
            const questionName = selectedOption.name;
            const value = parseFloat(selectedOption.value);
            this.answers[questionName] = value;
        }
    }

    updateProgress() {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        const progress = (this.currentQuestion / this.totalQuestions) * 100;
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `Question ${this.currentQuestion} of ${this.totalQuestions}`;
    }

    updateNavigation() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');

        // Show/hide previous button
        prevBtn.style.display = this.currentQuestion > 1 ? 'inline-flex' : 'none';

        // Show/hide next/submit buttons
        if (this.currentQuestion === this.totalQuestions) {
            nextBtn.style.display = 'none';
            this.showSubmitButton();
        } else {
            nextBtn.style.display = 'inline-flex';
            submitBtn.style.display = 'none';
        }
    }

    showSubmitButton() {
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.style.display = 'inline-flex';
    }

    submitQuiz() {
        this.saveCurrentAnswer();
        this.calculateResults();
        this.showResults();
    }

    calculateResults() {
        let totalScore = 0;
        const maxPossibleScore = 30; // 6 questions × 5 points each

        // Simple sum of all answer values
        Object.keys(this.answers).forEach(question => {
            if (this.answers[question]) {
                totalScore += parseFloat(this.answers[question]);
            }
        });

        // Calculate percentage: (totalScore / maxPossibleScore) × 100
        this.scorePercentage = Math.floor((totalScore / maxPossibleScore) * 100);
        this.finalScore = Math.floor((totalScore / maxPossibleScore) * 30); // For display consistency

        // Debug logging
        console.log('Total Score:', totalScore);
        console.log('Max Possible Score:', maxPossibleScore);
        console.log('Score Percentage:', this.scorePercentage);
        console.log('Answers:', this.answers);
    }

    showResults() {
        // Hide quiz form
        document.querySelector('.quiz-container').style.display = 'none';
        
        // Show results
        const results = document.getElementById('quizResults');
        results.style.display = 'block';

        // Update score display
        const displayPercentage = isNaN(this.scorePercentage) ? 0 : this.scorePercentage;
        document.getElementById('scorePercentage').textContent = `${displayPercentage}%`;
        
        // Determine category and recommendations
        const category = this.getScoreCategory(displayPercentage);
        document.getElementById('categoryTitle').textContent = category.title;
        document.getElementById('categoryDescription').textContent = category.description;
        
        // Generate recommendations
        this.generateRecommendations();
    }

    getScoreCategory(percentage = this.scorePercentage) {
        if (percentage >= 83) {
            return {
                title: "Excellent Sleep Quality",
                description: "Your sleep habits and environment are well-optimized. You're getting quality rest that supports peak performance."
            };
        } else if (percentage >= 67) {
            return {
                title: "Good Sleep Quality",
                description: "Your sleep is generally good with some areas for improvement. Small optimizations could enhance your rest quality."
            };
        } else if (percentage >= 50) {
            return {
                title: "Fair Sleep Quality",
                description: "Your sleep quality has room for improvement. Several factors may be impacting your rest and performance."
            };
        } else if (percentage >= 33) {
            return {
                title: "Poor Sleep Quality",
                description: "Your sleep quality is significantly impacting your well-being. Multiple factors need attention for better rest."
            };
        } else {
            return {
                title: "Very Poor Sleep Quality",
                description: "Your sleep quality is severely compromised. Professional assessment and intervention are strongly recommended."
            };
        }
    }

    generateRecommendations() {
        const recommendations = [];
        
        // Analyze specific areas for improvement
        if (this.answers.sleep_duration && this.answers.sleep_duration <= 2) {
            recommendations.push({
                title: "Optimize Sleep Duration",
                description: "Aim for 7-9 hours of sleep per night. Create a consistent bedtime routine to ensure adequate rest."
            });
        }

        if (this.answers.room_temp && this.answers.room_temp <= 2) {
            recommendations.push({
                title: "Improve Room Temperature",
                description: "Keep your bedroom between 60-67°F (15-19°C) for optimal sleep. Consider a fan or air conditioning."
            });
        }

        if (this.answers.light_exposure && this.answers.light_exposure <= 2) {
            recommendations.push({
                title: "Reduce Light Exposure",
                description: "Use blackout curtains or an eye mask. Avoid bright lights 1 hour before bedtime."
            });
        }

        if (this.answers.noise_level && this.answers.noise_level <= 2) {
            recommendations.push({
                title: "Minimize Noise",
                description: "Use earplugs or white noise machines. Consider soundproofing your bedroom."
            });
        }

        if (this.answers.air_quality && this.answers.air_quality <= 2) {
            recommendations.push({
                title: "Improve Air Quality",
                description: "Ensure proper ventilation. Consider an air purifier and regular cleaning to reduce allergens."
            });
        }

        if (this.answers.tech_use && this.answers.tech_use <= 2) {
            recommendations.push({
                title: "Limit Technology Use",
                description: "Avoid screens 1 hour before bed. Keep devices out of the bedroom or use blue light filters."
            });
        }

        if (this.answers.stress_level && this.answers.stress_level <= 2) {
            recommendations.push({
                title: "Manage Stress",
                description: "Practice relaxation techniques like meditation or deep breathing before bedtime."
            });
        }

        if (this.answers.sleep_consistency && this.answers.sleep_consistency <= 2) {
            recommendations.push({
                title: "Maintain Consistent Schedule",
                description: "Go to bed and wake up at the same time every day, even on weekends."
            });
        }

        // If no specific recommendations, provide general ones
        if (recommendations.length === 0) {
            recommendations.push({
                title: "Maintain Current Habits",
                description: "Your sleep habits are good. Continue your current routine and consider professional monitoring for optimization."
            });
        }

        // Display recommendations
        const recommendationList = document.getElementById('recommendationList');
        recommendationList.innerHTML = recommendations.map(rec => `
            <div class="recommendation-item">
                <h4>${rec.title}</h4>
                <p>${rec.description}</p>
            </div>
        `).join('');
    }
}

// Initialize quiz when page loads
document.addEventListener('DOMContentLoaded', () => {
    new SleepQuiz();
});
