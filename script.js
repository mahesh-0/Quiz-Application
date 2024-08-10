const API_URL = 'https://opentdb.com/api.php';
let players = [];
let currentCategory;
let currentPlayerIndex = 0;
let questions = [];
let currentQuestionIndex = 0;
let scores = [0, 0];
let selectedCategories = new Set();

document.getElementById('start-game').addEventListener('click', startGame);
document.getElementById('submit-answer').addEventListener('click', submitAnswer);
document.getElementById('restart-game').addEventListener('click', restartGame);

function startGame() {
    const player1Name = document.getElementById('player1-name').value;
    const player2Name = document.getElementById('player2-name').value;

    if (player1Name && player2Name) {
        players = [player1Name, player2Name];
        document.getElementById('player-setup').classList.add('hidden');
        loadCategories();
    }
}

function loadCategories() {
    fetch('https://opentdb.com/api_category.php')
        .then(response => response.json())
        .then(data => {
            const categoryList = document.getElementById('category-list');
            categoryList.innerHTML = '';
            data.trivia_categories.forEach(category => {
                const categoryItem = document.createElement('div');
                categoryItem.classList.add('category-item');
                categoryItem.textContent = category.name;
                categoryItem.dataset.id = category.id;
                categoryItem.addEventListener('click', selectCategory);
                categoryList.appendChild(categoryItem);
            });
            document.getElementById('category-selection').classList.remove('hidden');
        });
}

function selectCategory(event) {
    const categoryId = event.target.dataset.id;
    const categoryName = event.target.textContent;

    if (selectedCategories.has(categoryId)) {
        return;
    }

    selectedCategories.add(categoryId);
    currentCategory = categoryName;
    fetchQuestions(categoryId);
}

function fetchQuestions(categoryId) {
    fetch(`${API_URL}?amount=6&category=${categoryId}&difficulty=easy&type=multiple`)
        .then(response => response.json())
        .then(data => {
            questions = data.results.map(q => ({
                question: q.question,
                correctAnswer: q.correct_answer,
                incorrectAnswers: q.incorrect_answers
            }));
            document.getElementById('category-selection').classList.add('hidden');
            showNextQuestion();
        });
}

function showNextQuestion() {
    if (currentQuestionIndex >= questions.length) {
        endCategory();
        return;
    }

    const questionObj = questions[currentQuestionIndex];
    const allAnswers = [...questionObj.incorrectAnswers];
    allAnswers.splice(Math.floor(Math.random() * 4), 0, questionObj.correctAnswer);

    document.getElementById('question-category').textContent = currentCategory;
    document.getElementById('current-question').innerHTML = questionObj.question;

    const answerOptions = document.getElementById('answer-options');
    answerOptions.innerHTML = '';
    allAnswers.forEach(answer => {
        const answerOption = document.createElement('div');
        answerOption.classList.add('answer-option');
        answerOption.textContent = answer;
        answerOption.addEventListener('click', () => {
            document.querySelectorAll('.answer-option').forEach(opt => opt.classList.remove('selected'));
            answerOption.classList.add('selected');
        });
        answerOptions.appendChild(answerOption);
    });

    document.getElementById('question-area').classList.remove('hidden');
}

function submitAnswer() {
    const selectedAnswer = document.querySelector('.answer-option.selected');
    if (!selectedAnswer) {
        return;
    }

    const correctAnswer = questions[currentQuestionIndex].correctAnswer;
    if (selectedAnswer.textContent === correctAnswer) {
        const points = currentQuestionIndex < 2 ? 10 : currentQuestionIndex < 4 ? 15 : 20;
        scores[currentPlayerIndex] += points;
    }

    currentPlayerIndex = (currentPlayerIndex + 1) % 2;
    currentQuestionIndex++;
    showNextQuestion();
}

function endCategory() {
    document.getElementById('question-area').classList.add('hidden');
    if (selectedCategories.size === document.querySelectorAll('.category-item').length) {
        endGame();
    } else {
        loadCategories();
    }
}

function endGame() {
    document.getElementById('final-scores').textContent = `${players[0]}: ${scores[0]} points, ${players[1]}: ${scores[1]} points`;
    if (scores[0] > scores[1]) {
        document.getElementById('winner').textContent = `${players[0]} wins!`;
    } else if (scores[1] > scores[0]) {
        document.getElementById('winner').textContent = `${players[1]} wins!`;
    } else {
        document.getElementById('winner').textContent = `It's a tie!`;
    }
    document.getElementById('results').classList.remove('hidden');
}

function restartGame() {
    document.getElementById('results').classList.add('hidden');
    document.getElementById('player-setup').classList.remove('hidden');
    selectedCategories.clear();
    scores = [0, 0];
    currentQuestionIndex = 0;
    currentPlayerIndex = 0;
    players = [];
}
