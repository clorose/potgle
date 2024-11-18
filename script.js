// script.js
const themeToggle = document.querySelector('.theme-toggle');
const body = document.body;
const searchInput = document.querySelector('.search-input');
const resultsContainer = document.querySelector('.results-container');

let selectedIndex = -1;

// 다크모드 토글
themeToggle.addEventListener('click', () => {
    if (body.getAttribute('data-theme') === 'dark') {
        body.removeAttribute('data-theme');
        themeToggle.textContent = '다크 모드';
    } else {
        body.setAttribute('data-theme', 'dark');
        themeToggle.textContent = '라이트 모드';
    }
});

// 검색 결과 표시
function showResults(searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    
    if (!searchTerm) {
        resultsContainer.classList.remove('show');
        selectedIndex = -1;
        return;
    }

    // 포트 매칭 결과 찾기
    const matches = Object.entries(PORTS).filter(([name, port]) => 
        name.toLowerCase().includes(searchLower) || 
        port.includes(searchLower)
    );

    let html = '';

    // 숫자가 입력됐을 때는 localhost 항목을 첫번째로 추가
    if (!isNaN(searchTerm)) {
        // 정확히 일치하는 포트가 있는지 확인
        const exactMatch = matches.some(([_, port]) => port === searchTerm);
        
        // 정확히 일치하지 않을 때만 localhost 항목 추가
        if (!exactMatch) {
            html += `
                <div class="result-item" data-port="${searchTerm}">
                    <span class="result-name">localhost</span>
                    <span class="result-port">:${searchTerm}</span>
                </div>
            `;
        }
    }

    // 기존 검색 결과 추가
    html += matches.map(([name, port]) => `
        <div class="result-item" data-port="${port}">
            <span class="result-name">${name}</span>
            <span class="result-port">:${port}</span>
        </div>
    `).join('');

    if (html) {
        resultsContainer.innerHTML = html;
        resultsContainer.querySelectorAll('.result-item').forEach(item => {
            item.addEventListener('click', () => {
                openPort(item.dataset.port);
            });
        });
        resultsContainer.classList.add('show');
        selectedIndex = -1;
    } else {
        resultsContainer.classList.remove('show');
        selectedIndex = -1;
    }
}

function openPort(port) {
    window.open(`http://localhost:${port}`, '_blank');
}

function updateSelection() {
    const items = resultsContainer.querySelectorAll('.result-item');
    items.forEach((item, index) => {
        if (index === selectedIndex) {
            item.classList.add('selected');
            item.scrollIntoView({ block: 'nearest' });
        } else {
            item.classList.remove('selected');
        }
    });
}

// 키보드 이벤트 처리
searchInput.addEventListener('keydown', (e) => {
    const items = resultsContainer.querySelectorAll('.result-item');
    
    if (!items.length) {
        if (e.key === 'Enter' && e.target.value.trim() && !isNaN(e.target.value)) {
            openPort(e.target.value.trim());
        }
        return;
    }

    switch(e.key) {
        case 'ArrowDown':
            e.preventDefault();
            selectedIndex = (selectedIndex + 1) % items.length;
            updateSelection();
            break;
            
        case 'ArrowUp':
            e.preventDefault();
            selectedIndex = selectedIndex <= 0 ? items.length - 1 : selectedIndex - 1;
            updateSelection();
            break;
            
        case 'Enter':
            e.preventDefault();
            if (selectedIndex >= 0) {
                const port = items[selectedIndex].dataset.port;
                openPort(port);
            } else if (items.length > 0) {
                openPort(items[0].dataset.port);
            }
            break;
            
        case 'Escape':
            resultsContainer.classList.remove('show');
            selectedIndex = -1;
            break;
    }
});

// 입력 이벤트
searchInput.addEventListener('input', (e) => {
    showResults(e.target.value);
});

// 검색창 외부 클릭시 결과 숨기기
document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container') && !e.target.closest('.results-container')) {
        resultsContainer.classList.remove('show');
        selectedIndex = -1;
    }
});

// 페이지 로드시 검색창에 포커스
searchInput.focus();