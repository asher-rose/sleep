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
		this.showEmailGate();
    }

	showEmailGate() {
		// Hide quiz Q&A container
		const quizContainer = document.querySelector('.quiz-container');
		if (quizContainer) quizContainer.style.display = 'none';

		// Show email gate
		const emailGate = document.getElementById('quizEmailGate');
		if (emailGate) emailGate.style.display = 'block';

		// Attach submit handler once
		const form = document.getElementById('emailGateForm');
		if (form && !form.dataset.bound) {
			form.addEventListener('submit', async (e) => {
				e.preventDefault();
				const input = document.getElementById('emailGateInput');
				const email = (input && input.value || '').trim();

				if (!this.isValidEmail(email)) {
					if (input) input.focus();
					return;
				}

				// Optionally store for later use
				try { localStorage.setItem('sleep_quiz_email', email); } catch (_) {}

				// Calculate results now so we can include them in submission
				this.calculateResults();

				const answersJson = JSON.stringify(this.answers);
				const scoreValue = String(this.scorePercentage ?? 0);

				// Fill hidden fields for Web3Forms (fallback if native submission fires)
				const answersJsonField = document.getElementById('wf_answers_json');
				const scoreField = document.getElementById('wf_score_percentage');
				if (answersJsonField) answersJsonField.value = answersJson;
				if (scoreField) scoreField.value = scoreValue;

				// Submit to Web3Forms without navigating away
				const submitButton = form.querySelector('button[type="submit"]');
				if (submitButton) {
					submitButton.disabled = true;
					submitButton.textContent = 'Submitting...';
				}

				const payload = {
					access_key: form.querySelector('input[name="access_key"]')?.value || '',
					subject: form.querySelector('input[name="subject"]')?.value || 'Sleep Quiz Results',
					to: form.querySelector('input[name="to"]')?.value || 'asher.rose@summitstrategies.io',
					redirect: 'false',
					email,
					score_percentage: scoreValue,
					answers_json: answersJson,
					quiz_url: window.location.href,
					user_agent: navigator.userAgent
				};

				try {
					const response = await fetch('https://api.web3forms.com/submit', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							'Accept': 'application/json'
						},
						body: JSON.stringify(payload)
					});

					const data = await response.json().catch(() => ({ success: false }));
					if (!data.success) {
						console.warn('Web3Forms submission returned without success flag.', data);
					}
				} catch (err) {
					console.error('Web3Forms submission failed.', err);
				} finally {
					if (submitButton) {
						submitButton.disabled = false;
						submitButton.textContent = 'Show My Results';
					}
					// Hide email gate and show results
					emailGate.style.display = 'none';
					this.showResults();
				}
			});
			form.dataset.bound = 'true';
		}
	}

	isValidEmail(email) {
		return /\S+@\S+\.\S+/.test(email);
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

}

// Initialize quiz when page loads
document.addEventListener('DOMContentLoaded', () => {
    new SleepQuiz();
});
