const SUPABASE_URL = 'https://bizsfynwzloygiefvldl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpenNmeW53emxveWdpZWZ2bGRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NjM3MTYsImV4cCI6MjA2NDIzOTcxNn0.MXFR5R9lFz1Ih_kaSpununIwdfDeiGRq-Qukjzn41VU';

let supabase;
let currentFilter = 'all';
let allWords = [];

// Mock 데이터
let mockData = [
    {
        id: 1,
        word: "친목질",
        meaning: "친목을 도모하는 활동이나 행위",
        category: "모임용어",
        example: "오늘 회식으로 친목질 좀 해볼까?",
        created_at: "2024-01-15T10:30:00Z",
        created_by: "김철수"
    },
    {
        id: 2,
        word: "번개모임",
        meaning: "갑작스럽게 계획된 즉석 모임",
        category: "모임용어",
        example: "오늘 저녁에 번개모임 어때?",
        created_at: "2024-01-14T15:20:00Z",
        created_by: "박영희"
    },
    {
        id: 3,
        word: "눈치게임",
        meaning: "상대방의 반응을 살피면서 진행하는 게임이나 상황",
        category: "게임",
        example: "지금 완전 눈치게임 중이야",
        created_at: "2024-01-13T18:45:00Z",
        created_by: "이민수"
    },
    {
        id: 4,
        word: "개그콘서트",
        meaning: "웃음을 주는 공연이나 모임",
        category: "엔터테인먼트",
        example: "오늘 개그콘서트 같은 분위기네",
        created_at: "2024-01-12T14:20:00Z",
        created_by: "홍길동"
    },
    {
        id: 5,
        word: "소맥",
        meaning: "소주와 맥주를 섞은 술",
        category: "음료",
        example: "소맥 한 잔 어때?",
        created_at: "2024-01-11T19:30:00Z",
        created_by: "김영수"
    }
];

// 한글 초성 추출 함수
function getInitialConsonant(word) {
    const initials = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
    const firstChar = word.charAt(0);
    const code = firstChar.charCodeAt(0) - 44032;
    
    if (code >= 0 && code <= 11171) {
        return initials[Math.floor(code / 588)];
    }
    return 'ㄱ'; // 기본값
}

// 초기화
window.onload = function() {
    initializeSupabase();
    loadWords();
    setupEventListeners();
};

function initializeSupabase() {
    if (SUPABASE_URL && SUPABASE_URL !== 'YOUR_SUPABASE_URL' && 
        SUPABASE_ANON_KEY && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY') {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
        console.log('Supabase 설정이 없어 mock 데이터를 사용합니다.');
        showMessage('현재 데모 모드입니다. 실제 데이터베이스 연결을 위해 Supabase 설정이 필요합니다.', 'error');
    }
}

function setupEventListeners() {
    document.getElementById('searchInput').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            searchWords();
        } else {
            searchWords();
        }
    });

    document.getElementById('addWordForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addWord();
    });

    // 자음 버튼 이벤트
    document.querySelectorAll('.consonant-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.consonant-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.getAttribute('data-consonant');
            filterWords();
        });
    });
}

async function loadWords() {
    try {
        let words;
        if (supabase) {
            const { data, error } = await supabase
                .from('words')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            words = data;
        } else {
            words = mockData;
        }

        allWords = words;
        filterWords();
    } catch (error) {
        console.error('단어 로딩 중 오류:', error);
        showMessage('단어를 불러오는 중 오류가 발생했습니다.', 'error');
        allWords = mockData;
        filterWords();
    }
}

function filterWords() {
    let filteredWords = allWords;

    if (currentFilter !== 'all') {
        filteredWords = allWords.filter(word => {
            const initial = getInitialConsonant(word.word);
            return initial === currentFilter;
        });
    }

    displayWords(filteredWords);
}

// displayWords 함수에서 word-meaning 부분을 다음과 같이 수정:
function displayWords(words) {
    const container = document.getElementById('wordsContainer');
    
    if (words.length === 0) {
        container.innerHTML = '<div class="no-results">등록된 단어가 없습니다.</div>';
        return;
    }

    container.innerHTML = words.map(word => `
    <div class="word-card">
        <div class="word-main-content">
            <div class="word-title">${word.word}</div>
            <div class="word-meaning" id="meaning-${word.id}">
                ${word.meaning}
                <div class="scratch-overlay" id="overlay-${word.id}">
                    <span>긁어서 의미를 확인하세요</span>
                    <canvas class="scratch-canvas" id="canvas-${word.id}"></canvas>
                </div>
            </div>
        </div>
        ${word.example ? `<div class="word-example"><strong>예시:</strong> ${word.example}</div>` : ''}
        <div class="word-meta">
            <span>${word.category || '미분류'}</span>
            <div class="word-actions">
                <button class="action-btn" onclick="editWord(${word.id})">수정</button>
                <button class="action-btn" onclick="deleteWord(${word.id})">삭제</button>
            </div>
        </div>
    </div>
    `).join('');

    // 스크래치 효과 초기화
    words.forEach(word => {
        initScratchEffect(word.id);
    });
}

function initScratchEffect(wordId) {
   const canvas = document.getElementById(`canvas-${wordId}`);
   const overlay = document.getElementById(`overlay-${wordId}`);
   
   if (!canvas || !overlay) return;

   const ctx = canvas.getContext('2d');
   
   // 캔버스 크기를 부모 요소 크기와 정확히 맞춤
   const resizeCanvas = () => {
       const rect = overlay.getBoundingClientRect();
       canvas.width = rect.width;
       canvas.height = rect.height;
       
       // 초기 회색 배경
       ctx.fillStyle = '#ddd';
       ctx.fillRect(0, 0, canvas.width, canvas.height);
   };
   
   // 초기 설정 및 윈도우 리사이즈 시 재설정
   resizeCanvas();
   window.addEventListener('resize', resizeCanvas);
   
   let isDrawing = false;
   let scratchedArea = 0;

   function startScratch(e) {
       isDrawing = true;
       overlay.classList.add('scratching');
       scratch(e);
   }

   function scratch(e) {
       if (!isDrawing) return;
       
       const rect = canvas.getBoundingClientRect();
       const x = (e.clientX || e.touches[0].clientX) - rect.left;
       const y = (e.clientY || e.touches[0].clientY) - rect.top;
       
       ctx.globalCompositeOperation = 'destination-out';
       ctx.beginPath();
       ctx.arc(x, y, 25, 0, 2 * Math.PI);
       ctx.fill();
       
       const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
       let transparent = 0;
       for (let i = 3; i < imageData.data.length; i += 4) {
           if (imageData.data[i] === 0) transparent++;
       }
       
       scratchedArea = transparent / (imageData.data.length / 4);
       
       if (scratchedArea > 0.6) {
           overlay.style.display = 'none';
       }
   }

   function stopScratch() {
       isDrawing = false;
       overlay.classList.remove('scratching');
   }

   // 마우스 이벤트
   canvas.addEventListener('mousedown', startScratch);
   canvas.addEventListener('mousemove', scratch);
   canvas.addEventListener('mouseup', stopScratch);
   canvas.addEventListener('mouseleave', stopScratch);

   // 터치 이벤트 (모바일)
   canvas.addEventListener('touchstart', (e) => {
       e.preventDefault();
       startScratch(e);
   });
   canvas.addEventListener('touchmove', (e) => {
       e.preventDefault();
       scratch(e);
   });
   canvas.addEventListener('touchend', (e) => {
       e.preventDefault();
       stopScratch();
   });
}

function searchWords() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (!searchTerm) {
        filterWords();
        return;
    }

    const filteredWords = allWords.filter(word => {
        const matchesSearch = word.word.toLowerCase().includes(searchTerm) ||
                            word.meaning.toLowerCase().includes(searchTerm) ||
                            word.category.toLowerCase().includes(searchTerm);
        
        if (currentFilter === 'all') {
            return matchesSearch;
        } else {
            const initial = getInitialConsonant(word.word);
            return matchesSearch && initial === currentFilter;
        }
    });

    displayWords(filteredWords);
}

function toggleAddForm() {
    const leftPanel = document.getElementById('leftPanel');
    const rightPanel = document.getElementById('rightPanel');
    
    leftPanel.classList.toggle('shifted');
    rightPanel.classList.toggle('visible');
}

async function addWord() {
    const wordInput = document.getElementById('wordInput');
    const meaningInput = document.getElementById('meaningInput');
    const categoryInput = document.getElementById('categoryInput');
    const exampleInput = document.getElementById('exampleInput');

    if (!wordInput.value.trim() || !meaningInput.value.trim()) {
        showMessage('단어와 의미는 필수 항목입니다.', 'error');
        return;
    }

    const newWord = {
        word: wordInput.value.trim(),
        meaning: meaningInput.value.trim(),
        category: categoryInput.value.trim() || '미분류',
        example: exampleInput.value.trim(),
        created_at: new Date().toISOString(),
        created_by: '사용자'
    };

    try {
        if (supabase) {
            const { data, error } = await supabase
                .from('words')
                .insert([newWord]);
            
            if (error) throw error;
        } else {
            newWord.id = Math.max(...mockData.map(w => w.id), 0) + 1;
            mockData.unshift(newWord);
        }

        showMessage('단어가 성공적으로 추가되었습니다!', 'success');
        clearForm();
        loadWords();
        toggleAddForm();
    } catch (error) {
        console.error('단어 추가 중 오류:', error);
        showMessage('단어 추가 중 오류가 발생했습니다.', 'error');
    }
}

async function deleteWord(id) {
    if (!confirm('정말 이 단어를 삭제하시겠습니까?')) {
        return;
    }

    try {
        if (supabase) {
            const { error } = await supabase
                .from('words')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
        } else {
            const index = mockData.findIndex(word => word.id === id);
            if (index > -1) {
                mockData.splice(index, 1);
            }
        }

        showMessage('단어가 삭제되었습니다.', 'success');
        loadWords();
    } catch (error) {
        console.error('단어 삭제 중 오류:', error);
        showMessage('단어 삭제 중 오류가 발생했습니다.', 'error');
    }
}

async function editWord(id) {
    const word = allWords.find(w => w.id === id);
    if (word) {
        const newMeaning = prompt('새로운 의미를 입력하세요:', word.meaning);
        if (newMeaning && newMeaning.trim()) {
            try {
                if (supabase) {
                    // Supabase 데이터베이스 업데이트
                    const { error } = await supabase
                        .from('words')
                        .update({ meaning: newMeaning.trim() })
                        .eq('id', id);
                    
                    if (error) throw error;
                } else {
                    // Mock 데이터 업데이트
                    const mockWord = mockData.find(w => w.id === id);
                    if (mockWord) {
                        mockWord.meaning = newMeaning.trim();
                    }
                }
                
                showMessage('단어가 수정되었습니다.', 'success');
                loadWords(); // 데이터 다시 로드
            } catch (error) {
                console.error('단어 수정 중 오류:', error);
                showMessage('단어 수정 중 오류가 발생했습니다.', 'error');
            }
        }
    }
}
function clearForm() {
    document.getElementById('wordInput').value = '';
    document.getElementById('meaningInput').value = '';
    document.getElementById('categoryInput').value = '';
    document.getElementById('exampleInput').value = '';
}

function showMessage(message, type) {
    const existingMessage = document.querySelector('.error, .success');
    if (existingMessage) {
        existingMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = type;
    messageDiv.textContent = message;
    
    document.querySelector('.left-panel').insertBefore(messageDiv, document.querySelector('.search-container'));
    
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}